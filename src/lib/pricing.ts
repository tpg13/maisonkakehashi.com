/** Purchase-support fee (EUR) by property price (EUR). */
export function purchaseFee(propertyPrice: number): number {
  if (propertyPrice <= 10_000) return 1250;
  if (propertyPrice <= 50_000) return 1750;
  return 2500;
}

/** Fee split: 35% at contract signature, 65% at purchase. */
export function feeSchedule(fee: number) {
  const deposit = Math.round(fee * 0.35 * 100) / 100;
  return { deposit, balance: Math.round((fee - deposit) * 100) / 100 };
}

/** Renovation follow-up: 10% of works, minimum €500. */
export function renovationFee(worksAmount: number): number {
  return Math.max(500, Math.round(worksAmount * 0.1 * 100) / 100);
}

export const LISTING_CHECK_PRICE = 45;
