
import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SellerListings } from "@/components/seller/SellerListings";

// Products Page Component
const ProductsPage = () => {
  const { user } = useAuth();

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
          <TabsTrigger value="selling" className="text-youbuy data-[state=active]:text-youbuy font-medium">SELLING</TabsTrigger>
          <TabsTrigger value="sold" className="font-medium">SOLD</TabsTrigger>
        </TabsList>
        <TabsContent value="selling" className="mt-6">
          <SellerListings userId={user?.id} />
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

// Redirect component for the Inbox (leads to Messages page)
const InboxPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/messages');
  }, [navigate]);
  
  return null;
};

// Redirect component for Favorites (leads to main Favorites page)
const FavoritesRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/favorites');
  }, [navigate]);
  
  return null;
};

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
          <Route path="inbox" element={<InboxPage />} />
          <Route path="favorites" element={<FavoritesRedirect />} />
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
