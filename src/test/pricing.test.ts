import { describe, expect, it } from "vitest";
import { feeSchedule, LISTING_CHECK_PRICE, TOUR_VISIT_PRICE, purchaseFee, renovationFee } from "@/lib/pricing";

describe("pricing", () => {
  it("0–12k CHF property → 1,350 CHF", () => expect(purchaseFee(8000)).toBe(1350));
  it("12k–50k CHF property → 1,850 CHF", () => expect(purchaseFee(30000)).toBe(1850));
  it("50k–95k CHF property → 2,750 CHF", () => expect(purchaseFee(75000)).toBe(2750));
  it("over 95k CHF property → 3,250 CHF", () => expect(purchaseFee(120000)).toBe(3250));
  it("35% at contract, 65% at purchase", () =>
    expect(feeSchedule(1000)).toEqual({ deposit: 350, balance: 650 }));
  it("renovation <= 25k is 9% of works", () => expect(renovationFee(20000)).toBe(1800));
  it("renovation minimum 5,000 CHF base (9% = 450)", () => expect(renovationFee(2000)).toBe(450));
  it("renovation > 25k is 7.5% of works", () => expect(renovationFee(40000)).toBe(3000));
  it("listing check is 75 CHF", () => expect(LISTING_CHECK_PRICE).toBe(75));
  it("day tour visit starts from 189 CHF", () => expect(TOUR_VISIT_PRICE).toBe(189));
});
