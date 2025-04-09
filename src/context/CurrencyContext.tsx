import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (price: string | number) => string;
  formatCurrency: (amount: string | number) => string;
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
  const formatCurrency = (amount: string | number): string => {
    // Convert string to number if needed
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if it's a valid number
    if (isNaN(numericAmount)) {
      return '0.00';
    }
    
    return numericAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Convert price to selected currency
  const convertPrice = (price: string | number) => {
    // Convert string to number if needed
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Check if it's a valid number
    if (isNaN(numericPrice)) {
      return `${currency} 0.00`;
    }
    
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = numericPrice * rate;
    
    if (currency === "AED") {
      return `AED ${formatCurrency(convertedPrice)}`;
    }
    
    // Format the price with thousand separators
    return `${currency} ${formatCurrency(convertedPrice)}`;
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