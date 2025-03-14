
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  Settings, 
  LogOut,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: ShoppingCart, label: "Products", path: "/admin/products" },
  { icon: FileText, label: "Help Articles", path: "/admin/help-articles" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export const AdminSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "A";
  };
  
  const isPathActive = (itemPath: string) => {
    return location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);
  };

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      {/* Admin logo section */}
      <div className="p-4 border-b">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="bg-youbuy text-white p-2 rounded">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </Link>
      </div>
      
      {/* User profile section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
        </div>
      </div>
      
      {/* Navigation section */}
      <div className="flex-grow overflow-auto">
        <nav className="py-2">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = isPathActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 mx-2 text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "bg-youbuy text-white" 
                        : "text-gray-700 hover:bg-gray-100"
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
      </div>
      
      {/* Sign-out button section */}
      <div className="p-3 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Sign out</span>
        </Button>
        <div className="mt-3 px-4 py-2 text-xs text-center text-gray-500">
          YouBuy Admin v1.0
        </div>
      </div>
    </aside>
  );
};
