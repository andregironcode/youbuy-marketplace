
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Users, ShoppingBag, CreditCard, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    reports: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;

        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (productsError) throw productsError;

        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (ordersError) throw ordersError;

        setStats({
          users: usersCount || 0,
          products: productsCount || 0,
          orders: ordersCount || 0,
          reports: 0, // Placeholder for reports count
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Sample data for charts - In a real app, these would come from the database
  const salesData = [
    { name: 'Jan', total: 1200 },
    { name: 'Feb', total: 1900 },
    { name: 'Mar', total: 2100 },
    { name: 'Apr', total: 2400 },
    { name: 'May', total: 2700 },
    { name: 'Jun', total: 3000 },
    { name: 'Jul', total: 2500 },
  ];

  const userRegistrationData = [
    { name: 'Jan', users: 20 },
    { name: 'Feb', users: 35 },
    { name: 'Mar', users: 25 },
    { name: 'Apr', users: 40 },
    { name: 'May', users: 30 },
    { name: 'Jun', users: 48 },
    { name: 'Jul', users: 52 },
  ];

  const productCategoryData = [
    { name: 'Electronics', value: 45 },
    { name: 'Clothing', value: 30 },
    { name: 'Home', value: 15 },
    { name: 'Sports', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the YouBuy admin dashboard</p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.users}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">12%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Products
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.products}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">8%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.orders}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">15%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reports
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.reports}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDown className="mr-1 h-3 w-3 text-red-600" />
              <span className="text-red-600">5%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Monthly platform sales revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Registrations</CardTitle>
            <CardDescription>
              New user registrations by month
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRegistrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Users']} />
                <Bar dataKey="users" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>
              Distribution of products by category
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Products']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="rounded-full w-2 h-2 bg-blue-600 mt-1.5 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-muted-foreground">Jane Smith registered 10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full w-2 h-2 bg-green-600 mt-1.5 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">Product sold</p>
                  <p className="text-xs text-muted-foreground">iPhone 15 Pro was purchased 25 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full w-2 h-2 bg-yellow-600 mt-1.5 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">New report filed</p>
                  <p className="text-xs text-muted-foreground">User reported a counterfeit item 45 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full w-2 h-2 bg-red-600 mt-1.5 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">Order canceled</p>
                  <p className="text-xs text-muted-foreground">Order #12345 was canceled 1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
