import { ReactNode } from "react";
import { ProfileSidebar } from "./ProfileSidebar";
import { cn } from "@/lib/utils";

interface AccountLayoutProps {
  children: ReactNode;
  className?: string;
}

export const AccountLayout = ({ children, className }: AccountLayoutProps) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-72 flex-shrink-0 sticky top-4 h-fit">
            <ProfileSidebar />
          </aside>
          <main className={cn("flex-1 min-w-0", className)}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}; 