import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (price: number) => string;
  formatCurrency: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (simplified - in a real app, these would be fetched from an API)
const exchangeRates: Record<string, number> = {
  AED: 1,       // Base currency
  USD: 0.27,    // 1 AED = 0.27 USD
  EUR: 0.25,    // 1 AED = 0.25 EUR
  GBP: 0.21,    // 1 AED = 0.21 GBP
  INR: 22.5,    // 1 AED = 22.5 INR
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState("AED");

  // Load user's preferred currency from profile
  useEffect(() => {
    if (!user) return;

    const loadCurrency = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .single();

      if (data?.currency) {
        setCurrency(data.currency);
      }
    };

    loadCurrency();
  }, [user]);

  // Format number with thousand separators
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Convert price to selected currency
  const convertPrice = (price: number) => {
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = price * rate;
    
    if (currency === "AED") {
      return `AED ${formatCurrency(convertedPrice)}`;
    }
    
    return `${currency} ${convertedPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      convertPrice,
      formatCurrency 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}