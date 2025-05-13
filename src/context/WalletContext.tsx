import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';

// Function to format currency with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Types for wallet transactions
export type TransactionType = 'deposit' | 'withdrawal' | 'payment';
export type DepositFrequency = 'daily' | 'weekly' | 'monthly';

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

export interface RecurringDeposit {
  id: number;
  user_id: string;
  amount: number;
  frequency: DepositFrequency;
  next_deposit_date: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Transaction filter types
export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  types?: TransactionType[];
}

// Type for the Wallet Context
type WalletContextType = {
  balance: number;
  isLoading: boolean;
  error: string | null;
  transactions: WalletTransaction[];
  filteredTransactions: WalletTransaction[];
  filter: TransactionFilter;
  recurringDeposits: RecurringDeposit[];
  addFunds: (amount: number) => Promise<boolean>;
  withdrawFunds: (amount: number) => Promise<boolean>;
  makePayment: (amount: number, description: string) => Promise<boolean>;
  refreshWallet: () => Promise<void>;
  filterTransactions: (filter: TransactionFilter) => void;
  clearFilters: () => void;
  createRecurringDeposit: (amount: number, frequency: DepositFrequency, description: string, startDate?: Date) => Promise<boolean>;
  updateRecurringDeposit: (id: number, updates: Partial<Omit<RecurringDeposit, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<boolean>;
  deleteRecurringDeposit: (id: number) => Promise<boolean>;
  toggleRecurringDeposit: (id: number, isActive: boolean) => Promise<boolean>;
  loadRecurringDeposits: () => Promise<void>;
};

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<WalletTransaction[]>([]);
  const [recurringDeposits, setRecurringDeposits] = useState<RecurringDeposit[]>([]);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Initialize the wallet when user logs in
      initializeWallet();
      // Load transactions
      loadTransactions();
      // Load recurring deposits
      loadRecurringDeposits();
    } else {
      // Reset wallet state when user logs out
      setWallet(null);
      setTransactions([]);
      setFilteredTransactions([]);
      setRecurringDeposits([]);
      setFilter({});
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  // Apply filters when transactions or filter changes
  useEffect(() => {
    applyFilters();
  }, [transactions, filter]);

  // Initialize the wallet
  const initializeWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) return;

      // Check if user already has a wallet
      const { data: existingWallet, error: walletError } = await supabase
        .from('wallets' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      if (existingWallet) {
        setWallet(existingWallet as unknown as Wallet);
      } else {
        // Create a new wallet if one doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallets' as any)
          .insert([{ user_id: user.id, balance: 0 }])
          .select('*')
          .single();

        if (createError) throw createError;

        setWallet(newWallet as unknown as Wallet);
      }
    } catch (err: any) {
      console.error('Error initializing wallet:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('wallet_transactions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data as unknown as WalletTransaction[]);
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
      const { data, error } = await supabase.rpc('make_deposit' as any, {
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
        description: `AED ${formatCurrency(amount)} has been added to your wallet`,
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
      const { data, error } = await supabase.rpc('make_withdrawal' as any, {
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
        description: `AED ${formatCurrency(amount)} has been withdrawn from your wallet`,
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
      const { data, error } = await supabase.rpc('make_payment' as any, {
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
        description: `AED ${formatCurrency(amount)} has been paid from your wallet`,
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

  // Apply filters to transactions
  const applyFilters = () => {
    let filtered = [...transactions];

    // Filter by transaction type
    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter(t => filter.types?.includes(t.type));
    }

    // Filter by amount range
    if (filter.minAmount !== undefined) {
      filtered = filtered.filter(t => t.amount >= (filter.minAmount || 0));
    }

    if (filter.maxAmount !== undefined) {
      filtered = filtered.filter(t => t.amount <= (filter.maxAmount || Infinity));
    }

    // Filter by date range
    if (filter.startDate) {
      filtered = filtered.filter(t => {
        const transactionDate = parseISO(t.created_at);
        return isAfter(transactionDate, filter.startDate as Date) || 
               isEqual(transactionDate, filter.startDate as Date);
      });
    }

    if (filter.endDate) {
      filtered = filtered.filter(t => {
        const transactionDate = parseISO(t.created_at);
        return isBefore(transactionDate, filter.endDate as Date) || 
               isEqual(transactionDate, filter.endDate as Date);
      });
    }

    setFilteredTransactions(filtered);
  };

  // Filter transactions
  const filterTransactions = (newFilter: TransactionFilter) => {
    setFilter(newFilter);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilter({});
  };

  // Load recurring deposits
  const loadRecurringDeposits = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('recurring_deposits' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('next_deposit_date', { ascending: true });

      if (error) throw error;

      setRecurringDeposits(data as unknown as RecurringDeposit[]);
    } catch (err: any) {
      console.error('Error loading recurring deposits:', err);
      setError(err.message);
    }
  };

  // Create a recurring deposit
  const createRecurringDeposit = async (
    amount: number, 
    frequency: DepositFrequency, 
    description: string,
    startDate?: Date
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('You must be logged in to create a recurring deposit');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      // Set next deposit date
      const nextDepositDate = startDate || new Date();

      const { data, error } = await supabase
        .from('recurring_deposits' as any)
        .insert([{
          user_id: user.id,
          amount,
          frequency,
          next_deposit_date: nextDepositDate.toISOString(),
          description,
          is_active: true
        }])
        .select();

      if (error) throw error;

      // Refresh recurring deposits
      await loadRecurringDeposits();

      toast({
        title: 'Recurring deposit created',
        description: `Your ${frequency} deposit of AED ${formatCurrency(amount)} has been set up.`,
      });

      return true;
    } catch (err: any) {
      console.error('Error creating recurring deposit:', err);
      setError(err.message);
      toast({
        title: 'Error creating recurring deposit',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a recurring deposit
  const updateRecurringDeposit = async (
    id: number,
    updates: Partial<Omit<RecurringDeposit, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('You must be logged in to update a recurring deposit');
      }

      // Validate amount if it's being updated
      if (updates.amount !== undefined && updates.amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      const { data, error } = await supabase
        .from('recurring_deposits' as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;

      // Refresh recurring deposits
      await loadRecurringDeposits();

      toast({
        title: 'Recurring deposit updated',
        description: 'Your recurring deposit has been updated successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Error updating recurring deposit:', err);
      setError(err.message);
      toast({
        title: 'Error updating recurring deposit',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a recurring deposit
  const deleteRecurringDeposit = async (id: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('You must be logged in to delete a recurring deposit');
      }

      const { error } = await supabase
        .from('recurring_deposits' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh recurring deposits
      await loadRecurringDeposits();

      toast({
        title: 'Recurring deposit deleted',
        description: 'Your recurring deposit has been deleted successfully.',
      });

      return true;
    } catch (err: any) {
      console.error('Error deleting recurring deposit:', err);
      setError(err.message);
      toast({
        title: 'Error deleting recurring deposit',
        description: err.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle a recurring deposit (activate/deactivate)
  const toggleRecurringDeposit = async (id: number, isActive: boolean): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('You must be logged in to update a recurring deposit');
      }

      const { data, error } = await supabase
        .from('recurring_deposits' as any)
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;

      // Refresh recurring deposits
      await loadRecurringDeposits();

      toast({
        title: isActive ? 'Recurring deposit activated' : 'Recurring deposit paused',
        description: isActive 
          ? 'Your recurring deposit has been activated.' 
          : 'Your recurring deposit has been paused.',
      });

      return true;
    } catch (err: any) {
      console.error('Error toggling recurring deposit:', err);
      setError(err.message);
      toast({
        title: 'Error updating recurring deposit',
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
        .from('wallets' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw new Error(walletError.message);

      setWallet(walletData as unknown as Wallet);

      // Refresh transactions
      await loadTransactions();

      // Refresh recurring deposits
      await loadRecurringDeposits();
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
      filteredTransactions,
      filter,
      recurringDeposits,
      addFunds,
      withdrawFunds,
      makePayment,
      refreshWallet,
      filterTransactions,
      clearFilters,
      createRecurringDeposit,
      updateRecurringDeposit,
      deleteRecurringDeposit,
      toggleRecurringDeposit,
      loadRecurringDeposits
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
