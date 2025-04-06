import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { PageHeader } from "../PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

// Function to format currency with thousand separators
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const WalletPage = () => {
  const { user } = useAuth();
  const { balance, transactions, addFunds, withdrawFunds, refreshWallet, isLoading } = useWallet();
  const [activeTab, setActiveTab] = useState("overview");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === "deposit" ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type: string) => {
    return type === "deposit" ? "text-green-600" : "text-red-600";
  };

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

    setIsProcessing(true);
    const success = await addFunds(Number(amount));
    setIsProcessing(false);
    
    if (success) {
      setAmount("");
      setActiveTab("overview");
      toast({
        title: "Funds added",
        description: `AED ${formatCurrency(Number(amount))} has been added to your wallet.`
      });
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

    setIsProcessing(true);
    const success = await withdrawFunds(Number(amount));
    setIsProcessing(false);
    
    if (success) {
      setAmount("");
      setActiveTab("overview");
      toast({
        title: "Funds withdrawn",
        description: `AED ${formatCurrency(Number(amount))} has been withdrawn from your wallet.`
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Manage your balance, add funds, or withdraw to your bank account"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fund">Add Funds</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <div className="grid gap-6">
          <TabsContent value="overview" className="m-0">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current Balance</CardTitle>
                  <CardDescription>Your available funds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">AED {formatCurrency(balance)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common wallet operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto flex flex-col items-center gap-2 p-4"
                      onClick={() => setActiveTab("fund")}
                    >
                      <Plus className="h-6 w-6" />
                      <span>Add Funds</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto flex flex-col items-center gap-2 p-4"
                      onClick={() => setActiveTab("withdraw")}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span>Withdraw</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest wallet activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions yet
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {transactions.map((transaction) => {
                          const Icon = getTransactionIcon(transaction.type);
                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "p-2 rounded-full",
                                    transaction.type === "deposit"
                                      ? "bg-green-100"
                                      : "bg-red-100"
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "h-4 w-4",
                                      getTransactionColor(transaction.type)
                                    )}
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {transaction.type === "deposit"
                                      ? "Added Funds"
                                      : transaction.type === "withdrawal"
                                      ? "Withdrawal"
                                      : "Payment"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(transaction.created_at)}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  "font-medium",
                                  getTransactionColor(transaction.type)
                                )}
                              >
                                {transaction.type === "deposit" ? "+" : "-"} AED{" "}
                                {formatCurrency(transaction.amount)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fund" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Add Funds</CardTitle>
                <CardDescription>
                  Add money to your wallet using your credit or debit card
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (AED)</Label>
                  <Input
                    id="amount"
                    placeholder="Enter amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full bg-youbuy hover:bg-youbuy/90 text-white"
                  onClick={handleAddFunds}
                  disabled={isProcessing || !amount || Number(amount) <= 0}
                >
                  {isProcessing ? "Processing..." : "Add Funds"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>
                  Transfer your wallet balance to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="withdraw-amount">Amount (AED)</Label>
                  <Input
                    id="withdraw-amount"
                    placeholder="Enter amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available balance: AED {formatCurrency(balance)}
                  </p>
                </div>
                <Button 
                  className="w-full bg-youbuy hover:bg-youbuy/90 text-white"
                  onClick={handleWithdraw}
                  disabled={isProcessing || !amount || Number(amount) <= 0 || Number(amount) > balance}
                >
                  {isProcessing ? "Processing..." : "Withdraw to Bank Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};
