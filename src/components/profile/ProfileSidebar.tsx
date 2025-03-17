
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  User,
  Package,
  ShoppingBag,
  CreditCard,
  HelpCircle,
  Crown,
  Store,
  MessageSquare,
  HeadphonesIcon
} from "lucide-react";

// Define the profile type
interface UserProfile {
  full_name?: string;
  avatar_url?: string;
}

// Extend the user type
interface ExtendedUser {
  id: string;
  email?: string;
  profile?: UserProfile;
}

export const ProfileSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const extendedUser = user as ExtendedUser;
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  // Base items that are always shown
  const items = [
    {
      icon: User,
      label: "Account",
      href: "/profile/settings",
      active: isActive("/settings"),
    },
    {
      icon: Package,
      label: "My Products",
      href: "/profile/products",
      active: isActive("/products"),
    },
    {
      icon: ShoppingBag,
      label: "Purchases",
      href: "/profile/purchases",
      active: isActive("/purchases"),
    },
    {
      icon: Store,
      label: "Sales",
      href: "/profile/sales",
      active: isActive("/sales"),
    },
    {
      icon: CreditCard,
      label: "Wallet",
      href: "/profile/wallet",
      active: isActive("/wallet"),
    },
    {
      icon: HeadphonesIcon,
      label: "Support",
      href: "/profile/support",
      active: isActive("/support"),
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      href: "/profile/help",
      active: isActive("/help"),
    },
    {
      icon: Crown,
      label: "Premium",
      href: "/profile/premium",
      active: isActive("/premium"),
    },
  ];
  
  return (
    <aside className="w-60 border-r border-gray-200 bg-white h-screen flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {extendedUser?.profile?.avatar_url ? (
            <img
              src={extendedUser.profile.avatar_url}
              alt="Avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-md">
              {extendedUser?.profile?.full_name || "My Account"}
            </span>
            <div className="flex items-center text-xs text-gray-400">
              <span>{extendedUser?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                  item.active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
