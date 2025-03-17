
import { Link, useLocation } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingCart,
  BarChart2,
  Settings,
  HelpCircle,
  Home,
  Truck,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

export const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <Home size={20} />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <Package size={20} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <ShoppingCart size={20} />,
    },
    {
      name: "Delivery Routes",
      path: "/admin/delivery-routes",
      icon: <Truck size={20} />,
    },
    {
      name: "Driver Accounts",
      path: "/admin/driver-accounts",
      icon: <UserCog size={20} />,
    },
    {
      name: "Driver Panel",
      path: "/admin/driver-panel",
      icon: <Truck size={20} />,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: <BarChart2 size={20} />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings size={20} />,
    },
    {
      name: "Support",
      path: "/admin/support",
      icon: <HelpCircle size={20} />,
    },
  ];

  return (
    <aside className="h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Admin Portal</h1>
        <p className="text-sm text-muted-foreground">Wallapop Platform</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  currentPath === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-border mt-auto">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Wallapop
        </p>
      </div>
    </aside>
  );
};
