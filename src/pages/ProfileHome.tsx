import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarIcon } from "lucide-react";
import {
  User,
  Package,
  ShoppingBag,
  Store,
  MessageCircle,
  BarChart2,
  HeadphonesIcon,
  HelpCircle,
  Crown,
  Wallet,
  Heart,
  Settings
} from "lucide-react";

export const ProfileHome = () => {
  const { user } = useAuth();
  const { balance } = useWallet();
  const navigate = useNavigate();

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return `${user.user_metadata.avatar_url}?t=${Date.now()}`;
    }
    return null;
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  // Format currency value
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  // Main sections
  const catalogItems = [
    {
      id: "items",
      icon: Package,
      title: "Items",
      path: "/profile/products",
    }
  ];
  
  const transactionItems = [
    {
      id: "purchases",
      icon: ShoppingBag,
      title: "Purchases",
      path: "/profile/purchases",
    },
    {
      id: "sales",
      icon: Store,
      title: "Sales",
      path: "/profile/sales",
    },
    {
      id: "wallet",
      icon: Wallet,
      title: "Wallet",
      path: "/profile/wallet",
      balance: `£${formatCurrency(balance)}`,
    },
    {
      id: "impact",
      icon: Heart,
      title: "Your positive impact",
      path: "/profile/statistics",
      badge: "New",
    }
  ];
  
  const accountItems = [
    {
      id: "premium",
      icon: Crown,
      title: "YouBuy PRO",
      path: "/profile/premium",
      className: "text-amber-500",
    },
    {
      id: "settings",
      icon: Settings,
      title: "Settings",
      path: "/profile/settings",
    }
  ];
  
  const supportItems = [
    {
      id: "help",
      icon: HelpCircle,
      title: "Help",
      path: "/profile/help",
    }
  ];

  const renderMenuItem = (item: any) => (
    <div
      key={item.id}
      className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 cursor-pointer"
      onClick={() => navigate(item.path)}
    >
      <div className="flex items-center gap-3">
        <item.icon className={`h-5 w-5 ${item.className || ""}`} />
        <span className="text-sm font-medium">{item.title}</span>
      </div>
      <div className="flex items-center">
        {item.balance && (
          <span className="text-sm font-medium">{item.balance}</span>
        )}
        {item.badge && (
          <Badge className="ml-2 bg-red-500 text-white text-xs">{item.badge}</Badge>
        )}
        <svg className="h-5 w-5 text-gray-400 ml-2" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-20">
      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={getAvatarUrl() || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </h2>
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>On YouBuy since 2023</span>
            </div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm ml-1">(5)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gray-50 px-4 py-2">
          <h3 className="text-xs font-medium uppercase text-gray-500">CATALOG</h3>
        </div>
        {catalogItems.map(renderMenuItem)}
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gray-50 px-4 py-2">
          <h3 className="text-xs font-medium uppercase text-gray-500">TRANSACTIONS</h3>
        </div>
        {transactionItems.map(renderMenuItem)}
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gray-50 px-4 py-2">
          <h3 className="text-xs font-medium uppercase text-gray-500">ACCOUNT</h3>
        </div>
        {accountItems.map(renderMenuItem)}
      </div>

      {/* YouBuy Speaking Section */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="bg-gray-50 px-4 py-2">
          <h3 className="text-xs font-medium uppercase text-gray-500">YOUBUY SPEAKING</h3>
        </div>
        {supportItems.map(renderMenuItem)}
      </div>
    </div>
  );
}; 