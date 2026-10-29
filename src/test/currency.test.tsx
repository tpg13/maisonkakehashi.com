import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CurrencyProvider, useCurrency, CURRENCIES } from "@/lib/currency";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CurrencyProvider>{children}</CurrencyProvider>
);

describe("currency context and conversion", () => {
  it("defaults to CHF and formats 75 CHF and 320 CHF correctly", () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    expect(result.current.currency).toBe("CHF");
    expect(result.current.formatChf(75)).toBe("75 CHF");
    expect(result.current.formatChf(320)).toBe("320 CHF");
    expect(result.current.formatChf(1350)).toBe("1,350 CHF");
  });

  it("converts and formats properly when switched to EUR", () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => {
      result.current.setCurrency("EUR");
    });
    expect(result.current.currency).toBe("EUR");
    // 75 CHF / 0.96 ≈ 78.125 -> 78 €
    expect(result.current.formatChf(75)).toContain("€");
    expect(result.current.convertFromChf(96)).toBeCloseTo(100, 1);
  });

  it("converts and formats properly when switched to USD", () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => {
      result.current.setCurrency("USD");
    });
    expect(result.current.currency).toBe("USD");
    expect(result.current.formatChf(75)).toContain("$");
  });

  it("converts and formats properly when switched to JPY", () => {
    const { result } = renderHook(() => useCurrency(), { wrapper });
    act(() => {
      result.current.setCurrency("JPY");
    });
    expect(result.current.currency).toBe("JPY");
    expect(result.current.formatChf(75)).toContain("¥");
    // Should be rounded to nearest 100 or 1000 without decimals
    const jpy75 = result.current.formatChf(75);
    expect(jpy75).not.toContain(".");
  });

  it("supports all declared currencies", () => {
    expect(CURRENCIES).toEqual(["EUR", "USD", "JPY", "GBP", "CHF"]);
  });
});
