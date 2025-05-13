import React, { useState } from 'react';
import { useWallet, TransactionType, DepositFrequency, RecurringDeposit } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
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
  RefreshCcwIcon,
  FilterIcon,
  XIcon,
  CalendarIcon,
  DollarSignIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { parseISO, format, startOfDay, endOfDay, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
    filteredTransactions,
    filter,
    recurringDeposits,
    addFunds, 
    withdrawFunds, 
    refreshWallet,
    filterTransactions,
    clearFilters,
    createRecurringDeposit,
    updateRecurringDeposit,
    deleteRecurringDeposit,
    toggleRecurringDeposit
  } = useWallet();

  const [amount, setAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('balance');
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [startDate, setStartDate] = useState<Date | undefined>(filter.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(filter.endDate);
  const [minAmount, setMinAmount] = useState<number | undefined>(filter.minAmount);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(filter.maxAmount);
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>(filter.types || []);

  // Recurring deposit state
  const [recurringAmount, setRecurringAmount] = useState<string>('');
  const [recurringFrequency, setRecurringFrequency] = useState<DepositFrequency>('monthly');
  const [recurringDescription, setRecurringDescription] = useState<string>('');
  const [recurringStartDate, setRecurringStartDate] = useState<Date>(addDays(new Date(), 1));
  const [editingDeposit, setEditingDeposit] = useState<RecurringDeposit | null>(null);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);

  // Find max transaction amount for slider
  const maxTransactionAmount = transactions.length > 0 
    ? Math.max(...transactions.map(t => t.amount)) 
    : 1000;

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

  const handleApplyFilters = () => {
    const newFilter = {
      startDate: startDate ? startOfDay(startDate) : undefined,
      endDate: endDate ? endOfDay(endDate) : undefined,
      minAmount,
      maxAmount,
      types: selectedTypes.length > 0 ? selectedTypes : undefined
    };

    filterTransactions(newFilter);
    setShowFilters(false);

    toast({
      title: "Filters applied",
      description: "Your transaction history has been filtered."
    });
  };

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setSelectedTypes([]);
    clearFilters();

    toast({
      title: "Filters cleared",
      description: "All filters have been removed."
    });
  };

  const handleTypeToggle = (type: TransactionType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Recurring deposit handlers
  const handleCreateRecurringDeposit = async () => {
    if (!recurringAmount || isNaN(Number(recurringAmount)) || Number(recurringAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);
    const result = await createRecurringDeposit(
      Number(recurringAmount),
      recurringFrequency,
      recurringDescription || `${recurringFrequency} deposit`,
      recurringStartDate
    );
    setActionLoading(false);

    if (result) {
      setRecurringAmount('');
      setRecurringDescription('');
      setRecurringFrequency('monthly');
      setRecurringStartDate(addDays(new Date(), 1));
      setIsRecurringDialogOpen(false);
    }
  };

  const handleUpdateRecurringDeposit = async () => {
    if (!editingDeposit) return;

    if (!recurringAmount || isNaN(Number(recurringAmount)) || Number(recurringAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);
    const result = await updateRecurringDeposit(
      editingDeposit.id,
      {
        amount: Number(recurringAmount),
        frequency: recurringFrequency,
        description: recurringDescription || `${recurringFrequency} deposit`,
        next_deposit_date: recurringStartDate.toISOString()
      }
    );
    setActionLoading(false);

    if (result) {
      setRecurringAmount('');
      setRecurringDescription('');
      setRecurringFrequency('monthly');
      setRecurringStartDate(addDays(new Date(), 1));
      setEditingDeposit(null);
      setIsRecurringDialogOpen(false);
    }
  };

  const handleDeleteRecurringDeposit = async (id: number) => {
    setActionLoading(true);
    const result = await deleteRecurringDeposit(id);
    setActionLoading(false);

    if (result) {
      toast({
        title: "Recurring deposit deleted",
        description: "Your recurring deposit has been deleted successfully."
      });
    }
  };

  const handleToggleRecurringDeposit = async (id: number, isActive: boolean) => {
    setActionLoading(true);
    const result = await toggleRecurringDeposit(id, isActive);
    setActionLoading(false);
  };

  const openEditDialog = (deposit: RecurringDeposit) => {
    setEditingDeposit(deposit);
    setRecurringAmount(deposit.amount.toString());
    setRecurringFrequency(deposit.frequency);
    setRecurringDescription(deposit.description);
    setRecurringStartDate(parseISO(deposit.next_deposit_date));
    setIsRecurringDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingDeposit(null);
    setRecurringAmount('');
    setRecurringDescription('');
    setRecurringFrequency('monthly');
    setRecurringStartDate(addDays(new Date(), 1));
    setIsRecurringDialogOpen(true);
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

      {/* Recurring Deposits Card */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recurring Deposits</CardTitle>
            <CardDescription>Automatically add funds to your wallet on a schedule</CardDescription>
          </div>
          <Button 
            onClick={openCreateDialog}
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            New Deposit
          </Button>
        </CardHeader>

        <CardContent>
          {recurringDeposits.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <RepeatIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>You don't have any recurring deposits set up.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={openCreateDialog}
              >
                Set up recurring deposit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recurringDeposits.map((deposit) => (
                <Card key={deposit.id} className="overflow-hidden">
                  <div className={`p-1 ${deposit.is_active ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <RepeatIcon className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">
                            {deposit.description || `${deposit.frequency} deposit`}
                          </h3>
                          <Badge variant={deposit.is_active ? "outline" : "secondary"} className="ml-2">
                            {deposit.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <DollarSignIcon className="h-3.5 w-3.5" />
                            <span>AED {formatCurrency(deposit.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-3.5 w-3.5" />
                            <span>Every {deposit.frequency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>Next deposit: {format(parseISO(deposit.next_deposit_date), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(deposit)}
                          title="Edit"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleRecurringDeposit(deposit.id, !deposit.is_active)}
                          title={deposit.is_active ? "Pause" : "Activate"}
                        >
                          {deposit.is_active ? (
                            <PauseIcon className="h-4 w-4 text-amber-500" />
                          ) : (
                            <PlayIcon className="h-4 w-4 text-green-500" />
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete recurring deposit?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this recurring deposit. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteRecurringDeposit(deposit.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Deposit Dialog */}
      <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDeposit ? "Edit Recurring Deposit" : "Create Recurring Deposit"}
            </DialogTitle>
            <DialogDescription>
              {editingDeposit 
                ? "Update your recurring deposit details" 
                : "Set up automatic deposits to your wallet on a regular schedule"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recurringAmount">Amount (AED)</Label>
              <Input
                id="recurringAmount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={recurringAmount}
                onChange={(e) => setRecurringAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringFrequency">Frequency</Label>
              <Select
                value={recurringFrequency}
                onValueChange={(value) => setRecurringFrequency(value as DepositFrequency)}
              >
                <SelectTrigger id="recurringFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurringDescription">Description (optional)</Label>
              <Input
                id="recurringDescription"
                placeholder="E.g., Savings deposit"
                value={recurringDescription}
                onChange={(e) => setRecurringDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurringStartDate ? format(recurringStartDate, 'PPP') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={recurringStartDate}
                    onSelect={(date) => date && setRecurringStartDate(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                First deposit will occur on this date
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecurringDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingDeposit ? handleUpdateRecurringDeposit : handleCreateRecurringDeposit}
              disabled={actionLoading || !recurringAmount}
            >
              {actionLoading ? "Processing..." : editingDeposit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent wallet transactions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <FilterIcon className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            {Object.keys(filter).length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-red-500"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t border-b">
            <div className="space-y-4 py-2">
              <h3 className="text-sm font-medium">Filter Transactions</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label className="text-xs">Date Range</Label>
                  <div className="flex flex-wrap gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {startDate ? format(startDate, 'PP') : 'Start Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {endDate ? format(endDate, 'PP') : 'End Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Amount Range Filter */}
                <div className="space-y-2">
                  <Label className="text-xs">Amount Range (AED)</Label>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, maxTransactionAmount]}
                      min={0}
                      max={maxTransactionAmount}
                      step={1}
                      value={[
                        minAmount !== undefined ? minAmount : 0, 
                        maxAmount !== undefined ? maxAmount : maxTransactionAmount
                      ]}
                      onValueChange={([min, max]) => {
                        setMinAmount(min);
                        setMaxAmount(max);
                      }}
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>AED {formatCurrency(minAmount !== undefined ? minAmount : 0)}</span>
                      <span>AED {formatCurrency(maxAmount !== undefined ? maxAmount : maxTransactionAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Type Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Transaction Type</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="type-deposit" 
                      checked={selectedTypes.includes('deposit')}
                      onCheckedChange={() => handleTypeToggle('deposit')}
                    />
                    <label
                      htmlFor="type-deposit"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                    >
                      <ArrowDownIcon className="h-3 w-3 text-green-500" />
                      Deposits
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="type-withdrawal" 
                      checked={selectedTypes.includes('withdrawal')}
                      onCheckedChange={() => handleTypeToggle('withdrawal')}
                    />
                    <label
                      htmlFor="type-withdrawal"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                    >
                      <ArrowUpIcon className="h-3 w-3 text-red-500" />
                      Withdrawals
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="type-payment" 
                      checked={selectedTypes.includes('payment')}
                      onCheckedChange={() => handleTypeToggle('payment')}
                    />
                    <label
                      htmlFor="type-payment"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                    >
                      <WalletIcon className="h-3 w-3 text-blue-500" />
                      Payments
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {transactions.length === 0 ? "No transactions found." : "No transactions match your filters."}
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
                {filteredTransactions.map((transaction) => (
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

        {filteredTransactions.length > 0 && (
          <CardFooter className="flex justify-between text-sm text-muted-foreground border-t">
            <div>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
            {Object.keys(filter).length > 0 && (
              <Button variant="link" size="sm" onClick={handleClearFilters} className="h-auto p-0">
                Clear Filters
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default WalletPage; 
