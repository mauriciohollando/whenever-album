import { prodigiSku } from "./commerce";
import type { PrintFinish, PrintOrder, ShippingAddress } from "./types";

function prodigiHost(): string {
  const sandbox = process.env.PRODIGI_SANDBOX?.trim() === "1";
  return sandbox ? "https://api.sandbox.prodigi.com/v4.0" : "https://api.prodigi.com/v4.0";
}

export function prodigiEnabled(): boolean {
  return !!process.env.PRODIGI_API_KEY?.trim();
}

async function prodigi<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.PRODIGI_API_KEY?.trim();
  if (!key) throw new Error("PRODIGI_API_KEY is missing");
  const res = await fetch(`${prodigiHost()}${path}`, {
    ...init,
    headers: {
      "X-API-Key": key,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(body.error?.message || `Prodigi ${res.status}`);
  }
  return body;
}

function recipient(shipping: ShippingAddress) {
  return {
    name: shipping.name,
    email: shipping.email,
    addressLine1: shipping.line1,
    addressLine2: shipping.line2 || undefined,
    townOrCity: shipping.city,
    stateOrCounty: shipping.state || undefined,
    postalOrZipCode: shipping.postal,
    countryCode: shipping.country,
  };
}

export async function submitProdigiBook(order: PrintOrder, finish: PrintFinish): Promise<string> {
  if (!order.shipping) throw new Error("Print order is missing a shipping address.");
  if (!order.interiorUrl) throw new Error("Print interior PDF is missing.");
  const created = await prodigi<{ order?: { id?: string }; id?: string }>("/Orders", {
    method: "POST",
    body: JSON.stringify({
      shippingMethod: "Standard",
      recipient: recipient(order.shipping),
      items: [
        {
          sku: prodigiSku(finish),
          copies: 1,
          sizing: "fillPrintArea",
          assets: [
            {
              printArea: "default",
              url: order.interiorUrl,
              pageCount: 24,
            },
            ...(order.coverUrl
              ? [{ printArea: "cover", url: order.coverUrl }]
              : []),
          ],
        },
      ],
    }),
  });
  const id = created.order?.id || created.id;
  if (!id) throw new Error("Prodigi did not return an order id.");
  return id;
}
