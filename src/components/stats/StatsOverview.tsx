
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesChart } from "./SalesChart";
import { ProductsMetrics } from "./ProductsMetrics";
import { BuyingActivity } from "./BuyingActivity";
import { SellerMetrics } from "./SellerMetrics";
import { StatsHeader } from "./StatsHeader";
import { TopProducts } from "./TopProducts";
import { ScrollArea } from "@/components/ui/scroll-area";

export const StatsOverview = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="flex-1 p-4 flex flex-col h-[calc(100vh-4rem)] overflow-hidden"> {/* Reduced padding and added overflow-hidden */}
      <StatsHeader />
      
      <Tabs defaultValue="overview" className="flex-1 flex flex-col mt-2 overflow-hidden"> {/* Reduced margin-top and added overflow-hidden */}
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="selling">Selling</TabsTrigger>
          <TabsTrigger value="buying">Buying</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="flex-1 space-y-3 overflow-hidden"> {/* Reduced space-y-4 to space-y-3 and added overflow-hidden */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"> {/* Reduced gap-4 to gap-3 */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2"> {/* Adjusted padding */}
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent className="pt-0"> {/* Added pt-0 to reduce padding */}
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2"> {/* Adjusted padding */}
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                  <path d="M16 22V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v18" />
                  <rect width="20" height="3" x="2" y="20" rx="1" />
                </svg>
              </CardHeader>
              <CardContent className="pt-0"> {/* Added pt-0 to reduce padding */}
                <div className="text-2xl font-bold">$4,685</div>
                <p className="text-xs text-muted-foreground">+18.1% from last month</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2"> {/* Adjusted padding */}
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent className="pt-0"> {/* Added pt-0 to reduce padding */}
                <div className="text-2xl font-bold">$1,255</div>
                <p className="text-xs text-muted-foreground">+4.6% from last month</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2"> {/* Adjusted padding */}
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent className="pt-0"> {/* Added pt-0 to reduce padding */}
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">+12.3% from last month</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7 flex-1 overflow-hidden"> {/* Reduced gap-4 to gap-3 and added overflow-hidden */}
            <Card className="col-span-4 shadow-sm overflow-hidden">
              <CardHeader className="py-2"> {/* Reduced padding */}
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Your sales performance for the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4.5rem)] overflow-hidden"> {/* Adjusted height calculation */}
                <SalesChart />
              </CardContent>
            </Card>
            <Card className="col-span-3 shadow-sm overflow-hidden">
              <CardHeader className="py-2"> {/* Reduced padding */}
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Your most viewed products this month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-4.5rem)] overflow-hidden"> {/* Adjusted height calculation */}
                <TopProducts />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="selling" className="flex-1 space-y-3 overflow-hidden"> {/* Reduced space-y-4 to space-y-3 and added overflow-hidden */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 h-full overflow-hidden"> {/* Reduced gap-4 to gap-3 and added overflow-hidden */}
            <Card className="col-span-2 shadow-sm overflow-hidden">
              <CardHeader className="py-2"> {/* Reduced padding */}
                <CardTitle>Product Metrics</CardTitle>
                <CardDescription>Performance of your active listings</CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-4.5rem)] overflow-hidden"> {/* Adjusted height calculation */}
                <ProductsMetrics />
              </CardContent>
            </Card>
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="py-2"> {/* Reduced padding */}
                <CardTitle>Seller Performance</CardTitle>
                <CardDescription>Your seller metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-4.5rem)] overflow-hidden"> {/* Adjusted height calculation */}
                <SellerMetrics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="buying" className="flex-1 space-y-3 overflow-hidden"> {/* Reduced space-y-4 to space-y-3 and added overflow-hidden */}
          <Card className="h-full shadow-sm overflow-hidden">
            <CardHeader className="py-2"> {/* Reduced padding */}
              <CardTitle>Buying Activity</CardTitle>
              <CardDescription>Track your purchases over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-4.5rem)] overflow-hidden"> {/* Adjusted height calculation */}
                <BuyingActivity />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
