
import { Button } from "@/components/ui/button";
import { Calendar, Download, RefreshCw } from "lucide-react";
import { useState } from "react";

export const StatsHeader = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1500);
  };
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between text-left">
      <div>
        <h1 className="text-2xl font-bold">Statistics & Insights</h1>
        <p className="text-muted-foreground">
          Track your selling and buying activity
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Last 30 days</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
};
