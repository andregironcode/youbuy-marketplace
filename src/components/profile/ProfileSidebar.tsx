
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingBag, 
  Tag, 
  Package, 
  MessageCircle, 
  Heart, 
  BarChart2, 
  Wallet, 
  Settings, 
  HelpCircle,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarItem = {
  icon: React.ElementType;
  label: string;
  path: string;
};

const sidebarItems: SidebarItem[] = [
  { icon: ShoppingBag, label: "Purchases", path: "/profile/purchases" },
  { icon: Tag, label: "Sales", path: "/profile/sales" },
  { icon: Package, label: "Products", path: "/profile/products" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: Heart, label: "Favorites", path: "/profile/favorites" },
  { icon: BarChart2, label: "Stats", path: "/profile/stats" },
  { icon: Wallet, label: "Wallet", path: "/profile/wallet" },
  { icon: Settings, label: "Settings", path: "/profile/settings" },
  { icon: HelpCircle, label: "Help", path: "/profile/help" },
];

export const ProfileSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  // Extract first letter of name or email for avatar fallback
  const getInitials = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <aside className="w-60 bg-sidebar border-r h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold truncate max-w-[160px]">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </span>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Since {new Date(user.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-0">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Sign out button at the bottom */}
      <div className="p-3 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Sign out</span>
        </Button>
      </div>
    </aside>
  );
};
