/** Purchase-support fee (CHF) by property price (CHF). */
export function purchaseFee(propertyPrice: number): number {
  if (propertyPrice <= 12_000) return 1350;
  if (propertyPrice <= 50_000) return 1850;
  if (propertyPrice <= 95_000) return 2750;
  return 3250;
}

/** Fee split: 35% at contract signature, 65% at purchase. */
export function feeSchedule(fee: number) {
  const deposit = Math.round(fee * 0.35 * 100) / 100;
  return { deposit, balance: Math.round((fee - deposit) * 100) / 100 };
}

/**
 * Renovation Handling Assistance:
 * - Minimum 5,000 CHF works
 * - 9% of renovation costs up to 25,000 CHF
 * - 7.5% for renovations over 25,000 CHF
 */
export function renovationFee(worksAmount: number): number {
  const effective = Math.max(5000, worksAmount);
  if (effective <= 25_000) {
    return Math.round(effective * 0.09 * 100) / 100;
  }
  return Math.round(effective * 0.075 * 100) / 100;
}

export const LISTING_CHECK_PRICE = 75;
export const TOUR_VISIT_PRICE = 320;
