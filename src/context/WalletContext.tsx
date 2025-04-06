import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

// Types for wallet transactions
export type TransactionType = 'deposit' | 'withdrawal' | 'payment';

export interface WalletTransaction {
  id: number;
  user_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

// Type for the Wallet Context
type WalletContextType = {
  balance: number;
  isLoading: boolean;
  error: string | null;
  transactions: WalletTransaction[];
  addFunds: (amount: number) => Promise<boolean>;
  withdrawFunds: (amount: number) => Promise<boolean>;
  makePayment: (amount: number, description: string) => Promise<boolean>;
  refreshWallet: () => Promise<void>;
};

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Initialize the wallet when user logs in
      initializeWallet();
      // Load transactions
      loadTransactions();
    } else {
      // Reset wallet state when user logs out
      setWallet(null);
      setTransactions([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  // Initialize wallet (create if doesn't exist)
  const initializeWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) return;

      // First, check if the wallet exists
      const { data: existingWallet, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is the error for "no rows returned" which is expected
        // if the user doesn't have a wallet yet
        throw new Error(fetchError.message);
      }

      if (existingWallet) {
        setWallet(existingWallet as Wallet);
      } else {
        // Create a new wallet for the user
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert([{ user_id: user.id, balance: 0 }])
          .select('*')
          .single();

        if (createError) throw new Error(createError.message);

        setWallet(newWallet as Wallet);
      }
    } catch (err: any) {
      console.error('Error initializing wallet:', err);
      setError(err.message);
      toast({
        title: 'Error initializing wallet',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load user transactions
  const loadTransactions = async () => {
    try {
      if (!user) return;

      const { data, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (txError) throw new Error(txError.message);

      setTransactions(data as WalletTransaction[] || []);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError(err.message);
    }
  };

  // Add funds to the wallet
  const addFunds = async (amount: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('You must be logged in to add funds');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      // Call the make_deposit RPC function
      const { data, error } = await supabase.rpc('make_deposit', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: 'Deposit to wallet'
      });

      if (error) throw new Error(error.message);

      // Update the local state with the new balance
      if (wallet) {
        setWallet({
          ...wallet,
          balance: wallet.balance + amount
        });
      }

      // Refresh transactions
      await loadTransactions();

      toast({
        title: 'Funds added successfully',
        description: `$${amount.toFixed(2)} has been added to your wallet`,
      });

      return true;
    } catch (err: any) {
      console.error('Error adding funds:', err);
      setError(err.message);
      toast({
        title: 'Error adding funds',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw funds from the wallet
  const withdrawFunds = async (amount: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('You must be logged in to withdraw funds');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient funds in your wallet');
      }

      // Call the make_withdrawal RPC function
      const { data, error } = await supabase.rpc('make_withdrawal', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: 'Withdrawal from wallet'
      });

      if (error) throw new Error(error.message);

      // Update the local state with the new balance
      setWallet({
        ...wallet,
        balance: wallet.balance - amount
      });

      // Refresh transactions
      await loadTransactions();

      toast({
        title: 'Withdrawal successful',
        description: `$${amount.toFixed(2)} has been withdrawn from your wallet`,
      });

      return true;
    } catch (err: any) {
      console.error('Error withdrawing funds:', err);
      setError(err.message);
      toast({
        title: 'Error withdrawing funds',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Make a payment
  const makePayment = async (amount: number, description: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('You must be logged in to make a payment');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient funds in your wallet');
      }

      // Call the make_payment RPC function
      const { data, error } = await supabase.rpc('make_payment', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description
      });

      if (error) throw new Error(error.message);

      // Update the local state with the new balance
      setWallet({
        ...wallet,
        balance: wallet.balance - amount
      });

      // Refresh transactions
      await loadTransactions();

      toast({
        title: 'Payment successful',
        description: `$${amount.toFixed(2)} has been paid from your wallet`,
      });

      return true;
    } catch (err: any) {
      console.error('Error making payment:', err);
      setError(err.message);
      toast({
        title: 'Error making payment',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh wallet data and transactions
  const refreshWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) return;

      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw new Error(walletError.message);
      
      setWallet(walletData as Wallet);

      // Refresh transactions
      await loadTransactions();
    } catch (err: any) {
      console.error('Error refreshing wallet:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the context value
  return (
    <WalletContext.Provider value={{
      balance: wallet?.balance || 0,
      isLoading,
      error,
      transactions,
      addFunds,
      withdrawFunds,
      makePayment,
      refreshWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
} 