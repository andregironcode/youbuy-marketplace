import { ReactNode } from "react";
import { ProfileSidebar } from "./ProfileSidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

interface AccountLayoutProps {
  children: ReactNode;
  className?: string;
}

export const AccountLayout = ({ children, className }: AccountLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Only show sidebar on desktop AND not on the main profile page (which has its own layout)
  const isMainProfilePage = location.pathname === "/profile" || location.pathname === "/profile/";
  const showSidebar = !isMobile && !isMainProfilePage;
  
  // Determine container class based on path
  const containerClass = isMainProfilePage && isMobile 
    ? "container mx-auto px-4 py-3" 
    : "container mx-auto px-4 py-6";
  
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className={containerClass}>
        <div className="flex flex-col md:flex-row gap-6">
          {showSidebar && (
            <aside className="w-full md:w-72 flex-shrink-0 sticky top-4 h-fit">
              <ProfileSidebar />
            </aside>
          )}
          <main className={cn(
            "flex-1 min-w-0", 
            !showSidebar && "w-full", 
            className
          )}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}; 