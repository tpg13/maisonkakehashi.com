import { describe, expect, it } from "vitest";
import { feeSchedule, LISTING_CHECK_PRICE, purchaseFee, renovationFee } from "@/lib/pricing";

describe("pricing", () => {
  it("€0–10,000 property → €1,250", () => expect(purchaseFee(8000)).toBe(1250));
  it("€10,000–50,000 property → €1,750", () => expect(purchaseFee(30000)).toBe(1750));
  it("over €50,000 → €2,500", () => expect(purchaseFee(80000)).toBe(2500));
  it("35% at contract, 65% at purchase", () =>
    expect(feeSchedule(2500)).toEqual({ deposit: 875, balance: 1625 }));
  it("renovation is 10% of works", () => expect(renovationFee(20000)).toBe(2000));
  it("renovation minimum €500", () => expect(renovationFee(2000)).toBe(500));
  it("listing check is €45", () => expect(LISTING_CHECK_PRICE).toBe(45));
});
