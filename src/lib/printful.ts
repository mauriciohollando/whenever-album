import { merchProduct, type MerchSku } from "./commerce";
import type { MerchOrder, ShippingAddress } from "./types";

const API = "https://api.printful.com";

export function printfulEnabled(): boolean {
  return !!process.env.PRINTFUL_TOKEN?.trim();
}

async function printful<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.PRINTFUL_TOKEN?.trim();
  if (!token) throw new Error("PRINTFUL_TOKEN is missing");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = (await res.json()) as { code?: number; result?: T; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(body.error?.message || `Printful ${res.status}`);
  }
  return body.result as T;
}

type CatalogVariant = {
  id: number;
  size: string;
  color: string;
};

export async function resolvePrintfulVariant(
  sku: MerchSku,
  color: string,
  size: string
): Promise<number> {
  const product = merchProduct(sku);
  if (!product) throw new Error("Unknown merch product.");
  const variants = await printful<CatalogVariant[]>(`/products/${product.printfulProductId}`);
  const list = Array.isArray(variants) ? variants : ((variants as { variants?: CatalogVariant[] }).variants ?? []);
  const match = list.find(
    (item) =>
      item.size.toLowerCase() === size.toLowerCase() &&
      item.color.toLowerCase() === color.toLowerCase()
  );
  if (!match) {
    const fallback = list.find((item) => item.size.toLowerCase() === size.toLowerCase()) || list[0];
    if (!fallback) throw new Error("Printful has no variants for this product.");
    return fallback.id;
  }
  return match.id;
}

function recipient(shipping: ShippingAddress) {
  return {
    name: shipping.name,
    email: shipping.email,
    address1: shipping.line1,
    address2: shipping.line2 || "",
    city: shipping.city,
    state_code: shipping.state || "",
    zip: shipping.postal,
    country_code: shipping.country,
  };
}

export async function submitPrintfulOrder(order: MerchOrder): Promise<{ id: number }> {
  if (!order.shipping) throw new Error("Merch order is missing a shipping address.");
  const variantId = await resolvePrintfulVariant(order.sku, order.color, order.size);
  const created = await printful<{ id: number }>("/orders", {
    method: "POST",
    body: JSON.stringify({
      recipient: recipient(order.shipping),
      items: [
        {
          variant_id: variantId,
          quantity: 1,
          files: [{ type: "default", url: order.artUrl }],
        },
      ],
      confirm: true,
    }),
  });
  return { id: created.id };
}
