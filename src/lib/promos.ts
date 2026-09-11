const OWNER_FREE_DIGITAL = "hfwuh49fh93whfw9h03fh0iwofhj03hj0fj230f2";

export function ownerPromoCode(): string {
  return process.env.PROMO_FREE_DIGITAL?.trim() || OWNER_FREE_DIGITAL;
}

export function promoMakesDigitalFree(code: string): boolean {
  return code.trim() === ownerPromoCode();
}
