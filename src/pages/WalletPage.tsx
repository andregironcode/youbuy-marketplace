import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  WalletIcon,
  ClockIcon,
  RefreshCcwIcon
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { parseISO, format } from 'date-fns';

// Function to format currency with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    balance, 
    isLoading, 
    transactions, 
    addFunds, 
    withdrawFunds, 
    refreshWallet 
  } = useWallet();

  const [amount, setAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('balance');
  const [actionLoading, setActionLoading] = useState(false);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>
              Please sign in to access your wallet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleRefresh = async () => {
    await refreshWallet();
    toast({
      title: "Wallet refreshed",
      description: "Your wallet balance and transactions have been updated."
    });
  };

  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);
    const result = await addFunds(Number(amount));
    setActionLoading(false);
    
    if (result) {
      setAmount('');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    if (Number(amount) > balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough funds in your wallet.",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);
    const result = await withdrawFunds(Number(amount));
    setActionLoading(false);
    
    if (result) {
      setAmount('');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />;
      case 'payment':
        return <WalletIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Wallet</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCcwIcon className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Your current available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <WalletIcon className="h-12 w-12 text-primary mb-4" />
              <div className="text-3xl font-bold">AED {formatCurrency(balance)}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Available for purchases
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Manage Funds</CardTitle>
            <CardDescription>Add or withdraw funds from your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="balance">Add Funds</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>
              
              <TabsContent value="balance" className="space-y-4">
                <div className="flex flex-col space-y-2 py-4">
                  <label htmlFor="amount" className="text-sm font-medium">
                    Amount to Add (AED)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button 
                      onClick={handleAddFunds} 
                      disabled={isLoading || actionLoading || !amount}
                    >
                      {actionLoading ? "Processing..." : "Add Funds"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add funds to your wallet for future purchases.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="withdraw" className="space-y-4">
                <div className="flex flex-col space-y-2 py-4">
                  <label htmlFor="withdrawAmount" className="text-sm font-medium">
                    Amount to Withdraw (AED)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="withdrawAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={balance.toString()}
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button 
                      onClick={handleWithdraw} 
                      disabled={isLoading || actionLoading || !amount || Number(amount) > balance}
                    >
                      {actionLoading ? "Processing..." : "Withdraw"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Withdraw funds from your wallet to your bank account.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No transactions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className={
                      transaction.type === 'deposit'
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                    }>
                      {transaction.type === 'deposit' ? '+' : '-'}
                      AED {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage; 