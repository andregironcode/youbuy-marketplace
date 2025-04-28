import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white h-16 z-50 md:hidden">
      <div className="flex h-full items-center justify-around">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center w-1/4 h-full",
            isActive("/") && !isActive("/profile") && !isActive("/upload") && "text-youbuy"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/profile/favorites"
          className={cn(
            "flex flex-col items-center justify-center w-1/4 h-full",
            isActive("/profile/favorites") && "text-youbuy"
          )}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Favorites</span>
        </Link>
        <Link
          to="/upload"
          className={cn(
            "flex flex-col items-center justify-center w-1/4 h-full",
            isActive("/upload") && "text-youbuy"
          )}
        >
          <div className="h-10 w-10 rounded-full bg-youbuy flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
        </Link>
        <Link
          to={user ? "/profile" : "/auth"}
          className={cn(
            "flex flex-col items-center justify-center w-1/4 h-full",
            isActive("/profile") && "text-youbuy"
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">You</span>
        </Link>
      </div>
    </div>
  );
} 
