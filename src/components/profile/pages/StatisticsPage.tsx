import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Loader2 } from "lucide-react";

interface StatisticsData {
  salesCount: number;
  purchasesCount: number;
  totalRevenue: number;
  totalSpent: number;
  averageOrderValue: number;
  salesByMonth: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  purchasesByMonth: Array<{
    month: string;
    purchases: number;
    spent: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

interface SalesMonthData {
  month: string;
  sales: number;
  revenue: number;
}

interface PurchaseMonthData {
  month: string;
  purchases: number;
  spent: number;
}

interface Order {
  amount: number;
  created_at: string;
  product_id: string;
}

export const StatisticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch sales data
      const { data: salesData, error: salesError } = await supabase
        .from("orders")
        .select("amount, created_at, product_id")
        .eq("seller_id", user?.id);

      if (salesError) throw salesError;

      // Fetch purchase data
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("orders")
        .select("amount, created_at, product_id")
        .eq("buyer_id", user?.id);

      if (purchasesError) throw purchasesError;

      // Process the data
      const processedStats: StatisticsData = {
        salesCount: salesData.length,
        purchasesCount: purchasesData.length,
        totalRevenue: salesData.reduce((sum, order) => sum + order.amount, 0),
        totalSpent: purchasesData.reduce((sum, order) => sum + order.amount, 0),
        averageOrderValue: salesData.length > 0 
          ? salesData.reduce((sum, order) => sum + order.amount, 0) / salesData.length 
          : 0,
        salesByMonth: processSalesByMonth(salesData),
        purchasesByMonth: processPurchasesByMonth(purchasesData),
        topCategories: await fetchTopCategories(salesData.map(sale => sale.product_id))
      };

      setStats(processedStats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const processSalesByMonth = (data: Order[]): SalesMonthData[] => {
    const monthlyData = data.reduce((acc: Record<string, SalesMonthData>, order) => {
      const monthYear = format(new Date(order.created_at), "MMM yyyy");
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          sales: 0,
          revenue: 0
        };
      }
      acc[monthYear].sales += 1;
      acc[monthYear].revenue += order.amount;
      return acc;
    }, {});

    return Object.values(monthlyData);
  };

  const processPurchasesByMonth = (data: Order[]): PurchaseMonthData[] => {
    const monthlyData = data.reduce((acc: Record<string, PurchaseMonthData>, order) => {
      const monthYear = format(new Date(order.created_at), "MMM yyyy");
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          purchases: 0,
          spent: 0
        };
      }
      acc[monthYear].purchases += 1;
      acc[monthYear].spent += order.amount;
      return acc;
    }, {});

    return Object.values(monthlyData);
  };

  const fetchTopCategories = async (productIds: string[]): Promise<Array<{ category: string; count: number }>> => {
    if (productIds.length === 0) return [];

    const { data: products, error } = await supabase
      .from("products")
      .select("category")
      .in("id", productIds);

    if (error) {
      console.error("Error fetching product categories:", error);
      return [];
    }

    const categoryCounts = (products || []).reduce((acc: Record<string, number>, product: { category: string }) => {
      if (!acc[product.category]) {
        acc[product.category] = 0;
      }
      acc[product.category] += 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
      </div>
    );
  }

  return (
    <div className="flex-1 -mt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          View detailed insights about your buying and selling activities
        </p>
      </div>

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
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  AED {stats?.averageOrderValue.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {stats?.topCategories.map((category, index) => (
                    <div key={category.category} className="text-sm flex justify-between">
                      <span>{category.category}</span>
                      <span className="text-muted-foreground">{category.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Overview</CardTitle>
              <CardDescription>Your sales performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#16a34a" 
                      name="Revenue" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#0ea5e9" 
                      name="Orders" 
                      strokeWidth={2}
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
              <CardDescription>Detailed breakdown of your sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#16a34a" />
                    <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="revenue" fill="#16a34a" name="Revenue" />
                    <Bar yAxisId="right" dataKey="sales" fill="#0ea5e9" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Analytics</CardTitle>
              <CardDescription>Track your spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.purchasesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#16a34a" />
                    <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="spent" fill="#16a34a" name="Spent" />
                    <Bar yAxisId="right" dataKey="purchases" fill="#0ea5e9" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 