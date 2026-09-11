import { addressFromStripe } from "./address";
import { DIGITAL_USD, EXTRA_ALBUM_USD, HARDCOVER_USD, SOFTCOVER_USD, laterBookUsd } from "./commerce";
import { consumeCredit, issueExtraAlbumCredit } from "./credits";
import { prodigiEnabled, submitProdigiBook } from "./prodigi";
import { storePrintFiles } from "./printBook";
import { printfulEnabled, submitPrintfulOrder } from "./printful";
import { loadAlbum, saveAlbum } from "./store";
import { newId } from "./token";
import { bookPurchaseKind, creditsForBook, recordPurchase } from "./users";
import type { Album, MerchOrder, PrintFinish } from "./types";
import type Stripe from "stripe";

export async function applyAlbumPayment(album: Album, session: Stripe.Checkout.Session): Promise<Album> {
  const wasDraft = album.status === "draft";
  if (wasDraft) {
    album.status = "paid";
  }
  if (album.pendingCreditToken) {
    await consumeCredit(album.pendingCreditToken);
    album.paidWithCredit = true;
    album.pendingCreditToken = undefined;
  }
  album.email = session.customer_details?.email || session.customer_email || album.email;
  album.stripeSessionId = session.id;
  album.updatedAt = new Date().toISOString();

  const finish = session.metadata?.print as PrintFinish | undefined;
  if ((finish === "hardcover" || finish === "softcover") && !album.printOrder) {
    album.printOrder = {
      id: newId("prn"),
      finish,
      status: "pending",
      shipping: addressFromStripe(session),
    };
  }

  if (session.metadata?.extra_album === "1" && !album.extraAlbumToken) {
    const issued = await issueExtraAlbumCredit(album.id, album.email);
    album.extraAlbumToken = issued.token;
    album.extraAlbumRemaining = issued.credit.remaining;
  }

  await saveAlbum(album);

  if (wasDraft) {
    await recordPurchase(album, {
      kind: "digital",
      label: "Digital album",
      amountUsd: album.paidWithCredit ? 0 : DIGITAL_USD,
      creditsGranted: 0,
      stripeSessionId: session.id,
    });
  }
  if (finish === "hardcover" || finish === "softcover") {
    const later = session.metadata?.later === "1";
    await recordPurchase(album, {
      kind: bookPurchaseKind(finish),
      label: later ? `${finish} photo book (later)` : `${finish} photo book (with album)`,
      amountUsd: later
        ? laterBookUsd(finish)
        : finish === "hardcover"
          ? HARDCOVER_USD
          : SOFTCOVER_USD,
      creditsGranted: creditsForBook(later ? "later" : "bundle"),
      stripeSessionId: session.id,
    });
  }
  if (session.metadata?.extra_album === "1") {
    await recordPurchase(album, {
      kind: "extra_album",
      label: "Second album credit",
      amountUsd: EXTRA_ALBUM_USD,
      creditsGranted: 0,
      stripeSessionId: session.id,
    });
  }

  const next = (await loadAlbum(album.id)) || album;
  return next;
}

export async function fulfillPrintIfNeeded(album: Album): Promise<Album> {
  const order = album.printOrder;
  if (!order || order.status !== "pending") return album;
  if (album.status !== "ready") return album;

  try {
    const files = await storePrintFiles(album);
    order.interiorUrl = files.interiorUrl;
    order.coverUrl = files.coverUrl;
    if (prodigiEnabled()) {
      order.prodigiOrderId = await submitProdigiBook(order, order.finish);
      order.status = "submitted";
    } else {
      order.status = "pending";
      order.error = "Print file is ready. Add PRODIGI_API_KEY to send it to the printer.";
    }
  } catch (e) {
    order.status = "failed";
    order.error = e instanceof Error ? e.message : "Could not send the book to print.";
  }
  album.printOrder = order;
  album.updatedAt = new Date().toISOString();
  await saveAlbum(album);
  return album;
}

export async function applyMerchPayment(album: Album, session: Stripe.Checkout.Session): Promise<Album> {
  const draftId = session.metadata?.merch_draft_id;
  const draft = draftId ? album.merchDrafts?.[draftId] : undefined;
  if (!draft) return album;
  if (album.merchOrders?.some((item) => item.id === draft.id)) return album;

  const order: MerchOrder = {
    id: draft.id,
    sku: draft.sku,
    photoId: draft.photoId,
    color: draft.color,
    size: draft.size,
    artUrl: draft.artUrl,
    status: "pending",
    shipping: addressFromStripe(session),
    createdAt: new Date().toISOString(),
  };

  try {
    if (printfulEnabled()) {
      const created = await submitPrintfulOrder(order);
      order.status = "submitted";
      order.printfulId = created.id;
    } else {
      order.error = "Paid. Add PRINTFUL_TOKEN to send it to the printer.";
    }
  } catch (e) {
    order.status = "failed";
    order.error = e instanceof Error ? e.message : "Printful could not take the order.";
  }

  album.merchOrders = [...(album.merchOrders || []), order];
  if (album.merchDrafts) delete album.merchDrafts[draft.id];
  album.email = session.customer_details?.email || session.customer_email || album.email;
  album.updatedAt = new Date().toISOString();
  await saveAlbum(album);
  const product = order.sku;
  await recordPurchase(album, {
    kind: "merch",
    label: `${product} · ${order.photoId}`,
    amountUsd: 0,
    creditsGranted: 0,
    stripeSessionId: session.id,
  });
  return (await loadAlbum(album.id)) || album;
}

export async function applyStripeSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.metadata?.product !== "whenever") return;
  const albumId = session.metadata?.album_id;
  if (!albumId) return;
  const album = await loadAlbum(albumId);
  if (!album) return;
  if (session.metadata?.sku === "merch") {
    await applyMerchPayment(album, session);
    return;
  }
  if (session.metadata?.sku === "print" || session.metadata?.later === "1") {
    await applyLaterPrintPayment(album, session);
    return;
  }
  if (album.status === "draft" || !album.printOrder) {
    await applyAlbumPayment(album, session);
  }
}

export async function applyLaterPrintPayment(album: Album, session: Stripe.Checkout.Session): Promise<Album> {
  album.email = session.customer_details?.email || session.customer_email || album.email;
  const finish = session.metadata?.print as PrintFinish | undefined;
  if (finish !== "hardcover" && finish !== "softcover") return album;
  if (album.printOrder && album.printOrder.status !== "failed" && album.printOrder.status !== "refunded") {
    return album;
  }
  album.printOrder = {
    id: newId("prn"),
    finish,
    status: "pending",
    shipping: addressFromStripe(session),
  };
  album.updatedAt = new Date().toISOString();
  await saveAlbum(album);
  await recordPurchase(album, {
    kind: bookPurchaseKind(finish),
    label: `${finish} photo book (later)`,
    amountUsd: laterBookUsd(finish),
    creditsGranted: creditsForBook("later"),
    stripeSessionId: session.id,
  });
  const next = (await loadAlbum(album.id)) || album;
  if (next.status === "ready") {
    return fulfillPrintIfNeeded(next);
  }
  return next;
}

