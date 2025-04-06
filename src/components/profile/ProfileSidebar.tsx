import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  User,
  Package,
  ShoppingBag,
  Store,
  MessageCircle,
  BarChart2,
  CreditCard,
  HeadphonesIcon,
  HelpCircle,
  Crown,
  LogOut,
  Wallet,
  Heart,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  active: boolean;
  className?: string;
  onClick?: () => void;
}

export const ProfileSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return `${user.user_metadata.avatar_url}?t=${Date.now()}`;
    }
    return null;
  };

  const items: NavigationItem[] = [
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
      icon: Heart,
      label: "Favorites",
      href: "/profile/favorites",
      active: isActive("/favorites"),
    },
    {
      icon: MessageCircle,
      label: "Messages",
      href: "/messages",
      active: isActive("/messages"),
    },
    {
      icon: BarChart2,
      label: "Statistics",
      href: "/profile/statistics",
      active: isActive("/statistics"),
    },
    {
      icon: Wallet,
      label: "Wallet",
      href: "/wallet",
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
      className: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* User Profile */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={getAvatarUrl() || undefined} alt={user?.email || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="font-medium truncate">{user?.email}</h3>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 truncate",
                item.active && "bg-primary/10 text-primary hover:bg-primary/20",
                item.className
              )}
              onClick={() => item.href ? navigate(item.href) : item.onClick?.()}
            >
              <Icon className={cn("h-4 w-4 shrink-0", item.label === "Premium" && "text-amber-500")} />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <Separator />

      {/* Sign Out */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={signOut}
      >
        <LogOut className="h-4 w-4 shrink-0 text-red-500" />
        <span className="truncate">Sign Out</span>
      </Button>
    </div>
  );
};
