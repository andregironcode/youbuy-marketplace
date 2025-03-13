
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { products } from "@/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from "recharts";
import { ShoppingBag, Tag, Package, Heart, Eye, TrendingUp, Wallet } from "lucide-react";

// Mock data for now - would be replaced with real data from Supabase
const mockActivityData = [
  { name: 'Jan', sales: 4, purchases: 2 },
  { name: 'Feb', sales: 3, purchases: 1 },
  { name: 'Mar', sales: 2, purchases: 3 },
  { name: 'Apr', sales: 5, purchases: 2 },
  { name: 'May', sales: 1, purchases: 4 },
  { name: 'Jun', sales: 6, purchases: 3 },
  { name: 'Jul', sales: 4, purchases: 2 },
];

const mockCategoryData = [
  { name: 'Electronics', value: 40 },
  { name: 'Clothing', value: 30 },
  { name: 'Furniture', value: 20 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#10B981'];

export const StatsOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real application, this would fetch data from Supabase
    // For now, let's use the mock data and products
    const fetchStats = () => {
      setIsLoading(true);
      
      // Use the mock products data for now
      const userProducts = products.filter(product => 
        product.seller.userId === user?.id || 
        product.seller.id === user?.id
      );
      
      setStats({
        totalProducts: userProducts.length,
        totalSales: Math.floor(Math.random() * 10),
        totalPurchases: Math.floor(Math.random() * 8),
        totalViews: userProducts.reduce((acc, p) => acc + (p.viewCount || 0), 0),
        totalFavorites: userProducts.reduce((acc, p) => acc + (p.likeCount || 0), 0),
        totalEarnings: userProducts.reduce((acc, p) => acc + (Math.random() > 0.7 ? p.price : 0), 0),
      });
      
      setIsLoading(false);
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted">
            <div className="h-full w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Products Listed"
          value={stats.totalProducts}
          icon={<Package className="h-4 w-4 text-youbuy" />}
        />
        <StatsCard
          title="Total Sales"
          value={stats.totalSales}
          icon={<Tag className="h-4 w-4 text-green-500" />}
        />
        <StatsCard
          title="Total Purchases"
          value={stats.totalPurchases}
          icon={<ShoppingBag className="h-4 w-4 text-blue-500" />}
        />
        <StatsCard
          title="Total Earnings"
          value={`$${stats.totalEarnings.toFixed(2)}`}
          icon={<Wallet className="h-4 w-4 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockActivityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill="#8B5CF6" />
                  <Bar dataKey="purchases" name="Purchases" fill="#EC4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mockActivityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="Sales" stroke="#8B5CF6" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="purchases" name="Purchases" stroke="#EC4899" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Views</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.totalViews}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Total product views
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Favorites</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats.totalFavorites}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Total times favorited
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const StatsCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
