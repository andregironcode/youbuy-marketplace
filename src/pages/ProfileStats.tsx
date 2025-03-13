
import { useAuth } from "@/context/AuthContext";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { StatsOverview } from "@/components/profile/stats/StatsOverview";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfileStats() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <p className="text-muted-foreground">Please sign in to view your stats</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ProfileSidebar />
      
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Your Stats</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <StatsOverview />
          </TabsContent>
          
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
                <div className="bg-card rounded-lg shadow-sm p-4 h-[350px]">
                  {/* Sales performance chart will be added here */}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="purchases" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Purchase History</h2>
                <div className="bg-card rounded-lg shadow-sm p-4 h-[350px]">
                  {/* Purchase history chart will be added here */}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Product Performance</h2>
                <div className="bg-card rounded-lg shadow-sm p-4 h-[350px]">
                  {/* Product performance chart will be added here */}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
