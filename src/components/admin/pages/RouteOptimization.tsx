
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { CalendarIcon, Check, Clock, Play, RefreshCw, Route, Settings, Truck } from "lucide-react";

export const RouteOptimization = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon'>('morning');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningScheduleTest, setIsRunningScheduleTest] = useState(false);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(true);
  const [recentRoutes, setRecentRoutes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentRoutes();
  }, []);

  const fetchRecentRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_routes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentRoutes(data || []);
    } catch (error) {
      console.error("Error fetching recent routes:", error);
      toast({
        variant: "destructive",
        title: "Failed to load routes history",
        description: "Could not retrieve recent route optimization history."
      });
    }
  };

  const generateRoutes = async () => {
    setIsGenerating(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Call the route optimization edge function
      const response = await supabase.functions.invoke('route-optimization', {
        method: 'POST',
        body: {
          requestedTimeSlot: timeSlot,
          requestedDate: formattedDate
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      toast({
        title: "Routes Generated",
        description: `Successfully generated ${timeSlot} routes for ${format(date, 'MMMM d, yyyy')}`,
      });
      
      fetchRecentRoutes();
    } catch (error) {
      console.error("Error generating routes:", error);
      toast({
        variant: "destructive",
        title: "Route Generation Failed",
        description: "An error occurred while generating routes. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const runSchedulerTest = async () => {
    setIsRunningScheduleTest(true);
    try {
      // Call the route scheduler edge function
      const response = await supabase.functions.invoke('route-scheduler', {
        method: 'GET'
      });
      
      if (response.error) throw new Error(response.error.message);
      
      toast({
        title: "Scheduler Test Completed",
        description: response.data?.message || "Test completed successfully",
      });
      
      fetchRecentRoutes();
    } catch (error) {
      console.error("Error running scheduler test:", error);
      toast({
        variant: "destructive",
        title: "Scheduler Test Failed",
        description: "An error occurred while testing the scheduler. Please try again."
      });
    } finally {
      setIsRunningScheduleTest(false);
    }
  };

  const getRouteStatusBadge = (route: any) => {
    const pickupCount = route.pickup_route?.length || 0;
    const deliveryCount = route.delivery_route?.length || 0;
    
    if (pickupCount === 0 && deliveryCount === 0) {
      return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Empty</span>;
    }
    
    return (
      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
        {pickupCount} pickups, {deliveryCount} deliveries
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Route Optimization</h1>
        <p className="text-muted-foreground">
          Automatically generate optimized routes for delivery drivers
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Generate Routes</CardTitle>
            <CardDescription>Create optimized routes for delivery drivers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select value={timeSlot} onValueChange={(value) => setTimeSlot(value as 'morning' | 'afternoon')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (7PM previous day to 1PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (1PM to 7PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              onClick={generateRoutes} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Route className="mr-2 h-4 w-4" />
                  Generate Routes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Automation Settings</CardTitle>
            <CardDescription>Configure automatic route generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate routes</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate routes at 1PM and 7PM daily
                </p>
              </div>
              <Switch 
                checked={autoOptimizationEnabled} 
                onCheckedChange={setAutoOptimizationEnabled} 
              />
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm space-y-2">
              <p className="font-medium text-amber-800">Schedule Information</p>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="text-amber-700 text-xs">
                  <p><strong>Morning Routes:</strong> Generated at 1:00 PM for orders received between 7:00 PM (previous day) and 1:00 PM</p>
                  <p><strong>Afternoon Routes:</strong> Generated at 7:00 PM for orders received between 1:00 PM and 7:00 PM</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={runSchedulerTest}
              disabled={isRunningScheduleTest}
            >
              {isRunningScheduleTest ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Test Scheduler Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Routes</CardTitle>
            <CardDescription>Last 5 route optimizations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRoutes.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No route history available
              </div>
            ) : (
              <div className="space-y-2">
                {recentRoutes.map((route) => (
                  <div 
                    key={route.id} 
                    className="p-3 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{format(new Date(route.date), 'MMM d, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">
                        {route.time_slot === 'morning' ? 'Morning' : 'Afternoon'} shift
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {getRouteStatusBadge(route)}
                      <span className="text-xs text-muted-foreground mt-1">
                        {format(new Date(route.created_at), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/50 p-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={fetchRecentRoutes}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh History
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
