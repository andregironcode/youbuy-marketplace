import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "../PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const WalletPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [balance] = useState(1234.56);
  const [transactions] = useState([
    { id: 1, type: "deposit", amount: 500, date: "2024-04-01" },
    { id: 2, type: "withdrawal", amount: 200, date: "2024-03-28" },
    { id: 3, type: "deposit", amount: 1000, date: "2024-03-25" },
  ]);

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

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Manage your balance, add funds, or withdraw to your bank account"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
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
                  <div className="text-3xl font-bold">AED {balance.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common wallet operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
                      <Plus className="h-6 w-6" />
                      <span>Add Funds</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
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
                                    : "Withdrawal"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(transaction.date)}
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
                              {transaction.amount.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
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
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button className="w-full bg-youbuy hover:bg-youbuy/90 text-white">
                  Continue to Payment
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
                    min="0"
                    max={balance}
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground">
                    Available balance: AED {balance.toFixed(2)}
                  </p>
                </div>
                <Button className="w-full bg-youbuy hover:bg-youbuy/90 text-white">
                  Withdraw to Bank Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};
