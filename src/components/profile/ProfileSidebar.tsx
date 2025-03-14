
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
  LogOut,
  Crown,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

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
  { icon: Heart, label: "Favorites", path: "/favorites" },
  { icon: BarChart2, label: "Stats", path: "/profile/stats" },
  { icon: Crown, label: "Premium", path: "/profile/premium" },
  { icon: Wallet, label: "Wallet", path: "/profile/wallet" },
  { icon: Settings, label: "Settings", path: "/profile/settings" },
  { icon: HelpCircle, label: "Help", path: "/profile/help" },
];

const adminItems: SidebarItem[] = [
  { icon: HelpCircle, label: "Help Articles", path: "/profile/admin/help" },
];

export const ProfileSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);
  
  // Mock admin check - in a real app, this would check admin status in the database
  const isAdmin = user?.email === "admin@youbuy.com";
  
  if (!user) return null;
  
  const getInitials = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || "U";
  };
  
  const isPathActive = (itemPath: string) => {
    return location.pathname.startsWith(itemPath);
  };

  return (
    <aside className="w-60 bg-sidebar border-r h-screen flex flex-col">
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
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-0.5">
            {sidebarItems.map((item) => {
              const isActive = isPathActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-youbuy text-white font-bold shadow-md" 
                        : "text-sidebar-foreground hover:bg-youbuy/20 hover:text-youbuy hover:font-semibold"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "")} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            
            {isAdmin && (
              <li>
                <Collapsible
                  open={adminOpen}
                  onOpenChange={setAdminOpen}
                  className="w-full"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium hover:bg-youbuy/20 hover:text-youbuy">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-5 w-5" />
                      <span>Admin Panel</span>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", adminOpen && "transform rotate-90")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="pl-4">
                      {adminItems.map((item) => {
                        const isActive = isPathActive(item.path);
                        return (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                                isActive 
                                  ? "bg-youbuy text-white font-bold shadow-md" 
                                  : "text-sidebar-foreground hover:bg-youbuy/20 hover:text-youbuy hover:font-semibold"
                              )}
                            >
                              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "")} />
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="p-3 border-t mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-red-100 hover:text-red-600 hover:font-semibold text-red-500 transition-all"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};
