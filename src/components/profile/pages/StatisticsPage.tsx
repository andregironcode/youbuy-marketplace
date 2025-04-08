import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "../PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface Stats {
  salesCount: number;
  purchasesCount: number;
  totalRevenue: number;
  totalSpent: number;
  averageOrderValue: number;
  topCategory: string;
  monthlySales: {
    month: string;
    sales: number;
    revenue: number;
  }[];
  monthlyPurchases: {
    month: string;
    purchases: number;
    spent: number;
  }[];
}

export const StatisticsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    salesCount: 0,
    purchasesCount: 0,
    totalRevenue: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    topCategory: "",
    monthlySales: [],
    monthlyPurchases: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch sales data
        const { data: salesData, error: salesError } = await supabase
          .from("orders")
          .select("amount, created_at, product:products(category)")
          .eq("seller_id", user.id);

        if (salesError) throw salesError;

        // Fetch purchase data
        const { data: purchasesData, error: purchasesError } = await supabase
          .from("orders")
          .select("amount, created_at, product:products(category)")
          .eq("buyer_id", user.id);

        if (purchasesError) throw purchasesError;

        // Process sales data
        const salesByMonth: Record<string, { sales: number; revenue: number }> = {};
        const categories: Record<string, number> = {};
        let totalRevenue = 0;

        salesData?.forEach((sale) => {
          const date = new Date(sale.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          
          if (!salesByMonth[monthKey]) {
            salesByMonth[monthKey] = { sales: 0, revenue: 0 };
          }
          
          salesByMonth[monthKey].sales++;
          salesByMonth[monthKey].revenue += sale.amount;
          totalRevenue += sale.amount;

          if (sale.product?.category) {
            categories[sale.product.category] = (categories[sale.product.category] || 0) + 1;
          }
        });

        // Process purchase data
        const purchasesByMonth: Record<string, { purchases: number; spent: number }> = {};
        let totalSpent = 0;

        purchasesData?.forEach((purchase) => {
          const date = new Date(purchase.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          
          if (!purchasesByMonth[monthKey]) {
            purchasesByMonth[monthKey] = { purchases: 0, spent: 0 };
          }
          
          purchasesByMonth[monthKey].purchases++;
          purchasesByMonth[monthKey].spent += purchase.amount;
          totalSpent += purchase.amount;
        });

        // Find top category
        const topCategory = Object.entries(categories).reduce(
          (max, [category, count]) =>
            count > (max[1] || 0) ? [category, count] : max,
          ["", 0]
        )[0];

        // Calculate average order value
        const totalOrders = (salesData?.length || 0) + (purchasesData?.length || 0);
        const averageOrderValue =
          totalOrders > 0 ? (totalRevenue + totalSpent) / totalOrders : 0;

        // Convert monthly data to arrays for charts
        const monthlySales = Object.entries(salesByMonth).map(([month, data]) => ({
          month,
          ...data,
        }));

        const monthlyPurchases = Object.entries(purchasesByMonth).map(([month, data]) => ({
          month,
          ...data,
        }));

        setStats({
          salesCount: salesData?.length || 0,
          purchasesCount: purchasesData?.length || 0,
          totalRevenue,
          totalSpent,
          averageOrderValue,
          topCategory,
          monthlySales,
          monthlyPurchases,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Statistics"
        description="View detailed insights about your buying and selling activities"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.salesCount}</div>
                <p className="text-xs text-muted-foreground">
                  Revenue: AED {stats?.totalRevenue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.purchasesCount}</div>
                <p className="text-xs text-muted-foreground">
                  Spent: AED {stats?.totalSpent.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  AED {stats?.averageOrderValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {stats?.topCategory || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Most sold category</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Your sales and purchase trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[...stats.monthlySales, ...stats.monthlyPurchases]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Sales Revenue"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="spent"
                      name="Purchase Spent"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.monthlySales}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="sales"
                      name="Number of Sales"
                      fill="#8884d8"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="revenue"
                      name="Revenue"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>Monthly purchase activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.monthlyPurchases}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="purchases"
                      name="Number of Purchases"
                      fill="#8884d8"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="spent"
                      name="Amount Spent"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}; 