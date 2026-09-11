export const DIGITAL_USD = 12;
export const TWO_ALBUMS_USD = 15;
export const EXTRA_ALBUM_USD = TWO_ALBUMS_USD - DIGITAL_USD;
export const SOFTCOVER_USD = 24;
export const HARDCOVER_USD = 39;
export const HARDCOVER_BUNDLE_USD = 49;
export const HARDCOVER_IN_CART_USD = HARDCOVER_BUNDLE_USD - DIGITAL_USD;

export type PrintFinish = "softcover" | "hardcover";
export type MerchSku = "tee" | "hoodie" | "mug" | "poster";

export type MerchProduct = {
  sku: MerchSku;
  name: string;
  blurb: string;
  priceUsd: number;
  printfulProductId: number;
  sizes: string[];
  colors: Array<{ id: string; label: string; hex: string }>;
  printW: number;
  printH: number;
  shipUsd: { US: number; CA: number; default: number };
};

export const MERCH: MerchProduct[] = [
  {
    sku: "tee",
    name: "T-shirt",
    blurb: "Bella+Canvas 3001. One photograph on the chest.",
    priceUsd: 28,
    printfulProductId: 71,
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [
      { id: "White", label: "White", hex: "#f4f1ea" },
      { id: "Black", label: "Black", hex: "#1c1814" },
      { id: "Natural", label: "Natural", hex: "#e7dcc8" },
      { id: "Navy", label: "Navy", hex: "#1f2a44" },
    ],
    printW: 2400,
    printH: 3000,
    shipUsd: { US: 4.99, CA: 8.99, default: 12.99 },
  },
  {
    sku: "hoodie",
    name: "Hoodie",
    blurb: "Gildan 18500. The photograph, a little bigger.",
    priceUsd: 49,
    printfulProductId: 146,
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [
      { id: "White", label: "White", hex: "#f4f1ea" },
      { id: "Black", label: "Black", hex: "#1c1814" },
      { id: "Sand", label: "Sand", hex: "#cbb89a" },
      { id: "Navy", label: "Navy", hex: "#1f2a44" },
    ],
    printW: 2400,
    printH: 3000,
    shipUsd: { US: 6.99, CA: 11.99, default: 16.99 },
  },
  {
    sku: "mug",
    name: "Mug",
    blurb: "11oz ceramic. A page you can hold.",
    priceUsd: 18,
    printfulProductId: 19,
    sizes: ["11oz"],
    colors: [{ id: "White", label: "White", hex: "#f4f1ea" }],
    printW: 2700,
    printH: 1125,
    shipUsd: { US: 5.99, CA: 9.99, default: 14.99 },
  },
  {
    sku: "poster",
    name: "Poster",
    blurb: "12×16 matte print. One photograph, full bleed.",
    priceUsd: 22,
    printfulProductId: 1,
    sizes: ["12×16"],
    colors: [{ id: "Matte", label: "Matte", hex: "#efe8dc" }],
    printW: 3600,
    printH: 4800,
    shipUsd: { US: 5.99, CA: 10.99, default: 15.99 },
  },
];

export const SHIP_COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "IE", label: "Ireland" },
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "NL", label: "Netherlands" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
] as const;

export const BOOK_SHIP_USD = { US: 7.99, CA: 12.99, default: 14.99 } as const;

export type CartInput = {
  extraAlbum: boolean;
  print: PrintFinish | null;
  country: string;
  digitalPaid?: boolean;
};

export type CartQuote = {
  digitalUsd: number;
  extraAlbumUsd: number;
  printUsd: number;
  printLabel: string | null;
  shippingUsd: number;
  totalUsd: number;
  hardcoverBundled: boolean;
};

function zoneAmount(table: { US: number; CA: number; default: number }, country: string): number {
  if (country === "US") return table.US;
  if (country === "CA") return table.CA;
  return table.default;
}

export function quoteCart(input: CartInput): CartQuote {
  const extraAlbumUsd = input.digitalPaid ? 0 : input.extraAlbum ? EXTRA_ALBUM_USD : 0;
  const hardcoverBundled = input.print === "hardcover" && !input.digitalPaid;
  const printUsd =
    input.print === "hardcover"
      ? hardcoverBundled
        ? HARDCOVER_IN_CART_USD
        : HARDCOVER_USD
      : input.print === "softcover"
        ? SOFTCOVER_USD
        : 0;
  const printLabel =
    input.print === "hardcover"
      ? "Hardcover photo book (24 pages, ships after we develop)"
      : input.print === "softcover"
        ? "Softcover photo book (ships after we develop)"
        : null;
  const shippingUsd = input.print ? zoneAmount(BOOK_SHIP_USD, input.country) : 0;
  const digitalUsd = input.digitalPaid ? 0 : DIGITAL_USD;
  return {
    digitalUsd,
    extraAlbumUsd,
    printUsd,
    printLabel,
    shippingUsd,
    totalUsd: digitalUsd + extraAlbumUsd + printUsd + shippingUsd,
    hardcoverBundled,
  };
}

export function merchProduct(sku: string): MerchProduct | undefined {
  return MERCH.find((item) => item.sku === sku);
}

export function quoteMerch(sku: MerchSku, country: string): { priceUsd: number; shippingUsd: number; totalUsd: number } {
  const product = merchProduct(sku);
  if (!product) throw new Error("Unknown product.");
  const shippingUsd = zoneAmount(product.shipUsd, country);
  return { priceUsd: product.priceUsd, shippingUsd, totalUsd: product.priceUsd + shippingUsd };
}

export function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function prodigiSku(finish: PrintFinish): string {
  if (finish === "hardcover") {
    return process.env.PRODIGI_HARDCOVER_SKU?.trim() || "BOOK-FE-SQ";
  }
  return process.env.PRODIGI_SOFTCOVER_SKU?.trim() || "BOOK-SOFT-SQ";
}
