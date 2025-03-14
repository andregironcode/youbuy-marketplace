
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Users, 
  ShoppingBag, 
  Settings, 
  BarChart2,
  LogOut,
  Flag, 
  Box,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type SidebarItem = {
  icon: React.ElementType;
  label: string;
  path: string;
};

const adminSidebarItems: SidebarItem[] = [
  { icon: BarChart2, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: ShoppingBag, label: "Products", path: "/admin/products" },
  { icon: Box, label: "Orders", path: "/admin/orders" },
  { icon: Flag, label: "Reports", path: "/admin/reports" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export const AdminSidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isPathActive = (itemPath: string) => {
    return location.pathname === itemPath || 
           (itemPath !== "/admin/dashboard" && location.pathname.startsWith(itemPath));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <aside className="w-60 bg-gray-900 text-white h-screen flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-bold text-xl">
              YouBuy Admin
            </span>
            <div className="flex items-center text-xs text-gray-400">
              <span>Administration Panel</span>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {adminSidebarItems.map((item) => {
            const isActive = isPathActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-red-600 text-white" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
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
      
      <div className="p-3 border-t border-gray-800 mt-auto space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-gray-800 text-gray-300 hover:text-white"
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5 mr-3" />
          <span>Back to Site</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-gray-800 text-gray-300 hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Sign out</span>
        </Button>
      </div>
    </aside>
  );
};
