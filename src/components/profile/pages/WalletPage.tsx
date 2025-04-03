import { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CreditCard, 
  Banknote, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

// Mock transaction data
const transactions = [
  { 
    id: 1, 
    type: "deposit", 
    amount: 150, 
    date: "2023-10-15T14:30:00", 
    status: "completed", 
    method: "Credit Card"
  },
  { 
    id: 2, 
    type: "withdraw", 
    amount: 75, 
    date: "2023-10-10T09:15:00", 
    status: "completed", 
    method: "Bank Transfer"
  },
  { 
    id: 3, 
    type: "deposit", 
    amount: 200, 
    date: "2023-09-28T16:45:00", 
    status: "completed", 
    method: "Credit Card"
  },
  { 
    id: 4, 
    type: "withdraw", 
    amount: 50, 
    date: "2023-09-15T11:20:00", 
    status: "completed", 
    method: "Bank Transfer"
  },
  { 
    id: 5, 
    type: "deposit", 
    amount: 300, 
    date: "2023-08-30T13:10:00", 
    status: "completed", 
    method: "Credit Card"
  }
];

export const WalletPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const balance = 525.00; // Mock balance

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    return type === "deposit" 
      ? <ArrowUpRight className="h-4 w-4 text-green-500" /> 
      : <ArrowDownLeft className="h-4 w-4 text-red-500" />;
  };

  // Get transaction text color based on type
  const getTransactionColor = (type: string) => {
    return type === "deposit" ? "text-green-500" : "text-red-500";
  };

  // Format amount with sign
  const formatAmount = (amount: number, type: string) => {
    return type === "deposit" ? `+$${amount.toFixed(2)}` : `-$${amount.toFixed(2)}`;
  };

  return (
    <div className="flex-1 -mt-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-youbuy" />
            <span>Your Wallet</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your YouBuy wallet, fund it or withdraw your money
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="overview" className="h-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-youbuy/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Current Balance</CardTitle>
                  <CardDescription>Available to use for purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-youbuy">${balance.toFixed(2)}</div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <Button size="sm" className="w-full bg-youbuy hover:bg-youbuy/90">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Add funds
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <ArrowDownLeft className="mr-2 h-4 w-4" />
                    Withdraw
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border border-youbuy/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  <CardDescription>Your last 3 transactions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {transactions.slice(0, 3).map((transaction) => (
                      <li key={transaction.id} className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium">{transaction.type === "deposit" ? "Deposit" : "Withdrawal"}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveTab("history")}>
                    View all transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card className="border border-youbuy/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Manage your wallet with ease</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4 hover:border-youbuy hover:text-youbuy" onClick={() => setActiveTab("fund")}>
                    <CreditCard className="h-8 w-8" />
                    <span>Add via Card</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4 hover:border-youbuy hover:text-youbuy" onClick={() => setActiveTab("fund")}>
                    <Banknote className="h-8 w-8" />
                    <span>Bank Transfer</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4 hover:border-youbuy hover:text-youbuy" onClick={() => setActiveTab("withdraw")}>
                    <ArrowDownLeft className="h-8 w-8" />
                    <span>Withdraw</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4 hover:border-youbuy hover:text-youbuy" onClick={() => setActiveTab("history")}>
                    <Clock className="h-8 w-8" />
                    <span>Transaction History</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fund" className="h-full">
            <Card className="border border-youbuy/20 shadow-sm">
              <CardHeader>
                <CardTitle>Fund Your Wallet</CardTitle>
                <CardDescription>Choose a payment method to add funds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-auto flex flex-col items-center gap-3 p-6 bg-white border-2 border-youbuy text-youbuy hover:bg-youbuy/10">
                    <CreditCard className="h-10 w-10" />
                    <span className="text-lg font-semibold">Credit or Debit Card</span>
                    <span className="text-xs text-muted-foreground">Instant funding with 2% fee</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto flex flex-col items-center gap-3 p-6 hover:border-youbuy hover:text-youbuy">
                    <Banknote className="h-10 w-10" />
                    <span className="text-lg font-semibold">Bank Transfer</span>
                    <span className="text-xs text-muted-foreground">1-3 business days with no fee</span>
                  </Button>
                </div>

                <div className="pt-6 pb-2">
                  <h3 className="text-lg font-semibold mb-4">Enter Amount</h3>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-semibold">$</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      min="5" 
                      className="w-full pl-8 h-14 text-2xl font-bold border-2 rounded-md focus:border-youbuy focus:ring-youbuy" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Minimum amount: $5.00</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full bg-youbuy hover:bg-youbuy/90 py-6 text-lg">
                  Continue to Payment
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By adding funds, you agree to YouBuy's <a href="#" className="text-youbuy underline">Terms of Service</a> and <a href="#" className="text-youbuy underline">Privacy Policy</a>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="h-full">
            <Card className="border border-youbuy/20 shadow-sm">
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>Move money from your wallet to your bank account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-youbuy/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Available for withdrawal</p>
                    <p className="text-2xl font-bold text-youbuy">${balance.toFixed(2)}</p>
                  </div>
                  <Badge variant="outline" className="bg-youbuy/10 text-youbuy border-youbuy">
                    Available Now
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Enter Amount to Withdraw</h3>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-semibold">$</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      min="10" 
                      max={balance}
                      className="w-full pl-8 h-14 text-2xl font-bold border-2 rounded-md focus:border-youbuy focus:ring-youbuy" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Minimum withdrawal: $10.00
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Withdrawal Method</h3>
                  <div className="space-y-3">
                    <div className="border-2 border-youbuy rounded-lg p-4 relative">
                      <input type="radio" id="bank" name="withdrawal" className="absolute top-4 right-4" defaultChecked />
                      <label htmlFor="bank" className="flex items-start gap-3 cursor-pointer">
                        <Banknote className="h-6 w-6 text-youbuy mt-1" />
                        <div>
                          <p className="font-semibold">Bank Account (ACH)</p>
                          <p className="text-sm text-muted-foreground">1-3 business days to process</p>
                        </div>
                      </label>
                    </div>
                    
                    <div className="border-2 border-gray-200 rounded-lg p-4 relative opacity-60">
                      <div className="absolute -inset-px bg-gray-100/50 rounded-lg flex items-center justify-center z-10">
                        <Badge variant="outline" className="bg-gray-50">Coming Soon</Badge>
                      </div>
                      <input type="radio" id="instant" name="withdrawal" className="absolute top-4 right-4" disabled />
                      <label htmlFor="instant" className="flex items-start gap-3">
                        <CreditCard className="h-6 w-6 mt-1" />
                        <div>
                          <p className="font-semibold">Instant to Debit Card</p>
                          <p className="text-sm text-muted-foreground">Instant transfer with 1.5% fee</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-youbuy hover:bg-youbuy/90 py-6 text-lg">
                  Withdraw Funds
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="h-full">
            <Card className="border border-youbuy/20 shadow-sm h-full">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All transactions in your wallet</CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-150px)]">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-1">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-3 hover:bg-youbuy/5 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "deposit" ? "bg-green-100" : "bg-red-100"
                          }`}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.type === "deposit" ? "Deposit" : "Withdrawal"}</p>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{formatDate(transaction.date)}</span>
                              <span>•</span>
                              <span>{transaction.method}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                            {formatAmount(transaction.amount, transaction.type)}
                          </p>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-green-50 text-green-600 border-green-200"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
