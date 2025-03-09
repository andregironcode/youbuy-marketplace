
import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { products } from "@/data/products";

// Products Page Component
const ProductsPage = () => {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your products</h1>
        <p className="text-muted-foreground">
          Here you can list items, manage the ones you already have and activate featured to sell them faster
        </p>
      </div>

      <Tabs defaultValue="selling">
        <TabsList>
          <TabsTrigger value="selling">SELLING</TabsTrigger>
          <TabsTrigger value="sold">SOLD</TabsTrigger>
        </TabsList>
        <TabsContent value="selling" className="mt-6">
          <Card className="border rounded-lg overflow-hidden">
            <div className="divide-y">
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center p-4 hover:bg-accent/10">
                  <div className="flex-shrink-0 mr-3">
                    <input type="checkbox" className="rounded-sm" />
                  </div>
                  <div className="flex-shrink-0 mr-4">
                    <img 
                      src={`${product.image}?w=80&h=80&auto=format&fit=crop`} 
                      alt={product.title} 
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-medium">${product.price}</div>
                    <div className="text-sm">{product.title}</div>
                  </div>
                  <div className="hidden md:block w-24 text-sm text-muted-foreground">
                    <div>Published</div>
                    <div>12/02/2024</div>
                  </div>
                  <div className="hidden md:block w-24 text-sm text-muted-foreground">
                    <div>Modified</div>
                    <div>14/02/2024</div>
                  </div>
                  <div className="ml-4">
                    <button className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm">
                      Reactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="sold">
          <div className="text-center py-10">
            <p className="text-muted-foreground">No sold items yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Placeholder components for other sections
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex-1 p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground">This section is under development.</p>
  </div>
);

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <ProfileSidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/profile/products" replace />} />
          <Route path="purchases" element={<PlaceholderPage title="Purchases" />} />
          <Route path="sales" element={<PlaceholderPage title="Sales" />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inbox" element={<PlaceholderPage title="Inbox" />} />
          <Route path="favorites" element={<PlaceholderPage title="Favorites" />} />
          <Route path="stats" element={<PlaceholderPage title="Stats" />} />
          <Route path="wallet" element={<PlaceholderPage title="Wallet" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="help" element={<PlaceholderPage title="Help" />} />
        </Routes>
      </div>
    </div>
  );
};

export default Profile;
