import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, children, className }: PageHeaderProps) => {
  return (
    <div className={cn("mb-6 pb-4 border-b", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0 flex items-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}; 