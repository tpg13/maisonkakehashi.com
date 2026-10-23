import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export const CURRENCIES = ['EUR', 'USD', 'JPY', 'GBP', 'CHF'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  JPY: '¥',
  GBP: '£',
  CHF: 'CHF ',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  EUR: 'Euros (€)',
  USD: 'US Dollars ($)',
  JPY: 'Japanese Yen (¥)',
  GBP: 'British Pounds (£)',
  CHF: 'Swiss Francs (CHF)',
};

// Base reference: 1 EUR
export const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1.0,
  USD: 1.08,
  JPY: 160.0,
  GBP: 0.86,
  CHF: 0.96,
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertFromEur: (amountEur: number) => number;
  formatEur: (amountEur: number, options?: { roundToThousands?: boolean; fractionDigits?: number }) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = 'kakehashi_selected_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Currency | null;
      if (saved && CURRENCIES.includes(saved)) {
        setCurrencyState(saved);
      }
    } catch {
      // ignore storage access issues
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  };

  const convertFromEur = (amountEur: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return amountEur * rate;
  };

  const formatEur = (
    amountEur: number,
    options?: { roundToThousands?: boolean; fractionDigits?: number }
  ): string => {
    const converted = convertFromEur(amountEur);
    const sym = CURRENCY_SYMBOLS[currency];

    if (currency === 'JPY') {
      const rounded = Math.round(converted / 10000) * 10000;
      return `${sym}${rounded.toLocaleString('en-US')}`;
    }

    if (options?.roundToThousands && converted >= 1000) {
      const rounded = Math.round(converted / 1000) * 1000;
      return `${sym}${rounded.toLocaleString('en-US')}`;
    }

    const digits = options?.fractionDigits ?? (converted % 1 !== 0 ? 2 : 0);
    const formattedNum = converted.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

    return `${sym}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertFromEur,
        formatEur,
        symbol: CURRENCY_SYMBOLS[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      currency: 'EUR' as Currency,
      setCurrency: () => {},
      convertFromEur: (amt: number) => amt,
      formatEur: (amt: number) => `€${amt.toLocaleString()}`,
      symbol: '€',
    };
  }
  return ctx;
}

export function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative inline-block text-left ${className || ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded border border-gold/40 bg-background/80 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-gold hover:border-gold hover:bg-gold/10 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{currency}</span>
        <span className="text-[10px] opacity-75">{CURRENCY_SYMBOLS[currency].trim()}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-32 rounded-md border border-gold/50 bg-card/95 py-1 shadow-elegant backdrop-blur z-50">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCurrency(c);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors ${
                  currency === c
                    ? 'bg-gold/20 font-bold text-gold'
                    : 'text-foreground/80 hover:bg-gold/10 hover:text-foreground'
                }`}
              >
                <span>{c}</span>
                <span className="text-gold font-mono">{CURRENCY_SYMBOLS[c]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
