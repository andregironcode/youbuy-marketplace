
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button-extended";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  PackageCheck, 
  Truck, 
  CheckCircle, 
  Navigation, 
  Clock, 
  Calendar 
} from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DeliveryRoute {
  id: string;
  date: string;
  time_slot: string;
  status: string;
  pickup_route: any;
  delivery_route: any;
  created_at: string;
  updated_at: string;
}

interface RouteStop {
  id: string;
  route_id: string;
  stop_type: 'pickup' | 'delivery';
  order_id: string;
  status: 'pending' | 'completed' | 'failed';
  address: string;
  latitude: number;
  longitude: number;
  scheduled_time: string;
  completed_time: string | null;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  position: number;
}

export function DriverRoutes() {
  const { user } = useAuth();
  const [activeRoutes, setActiveRoutes] = useState<DeliveryRoute[]>([]);
  const [completedRoutes, setCompletedRoutes] = useState<DeliveryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    
    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    
    try {
      // Query delivery_routes table directly instead of using RPC
      const { data, error } = await supabase
        .from('delivery_routes')
        .select('*')
        .eq('driver_id', user.id);
        
      if (error) throw error;
      
      if (!data) {
        setActiveRoutes([]);
        setCompletedRoutes([]);
        setLoading(false);
        return;
      }
      
      // Filter routes by status
      const active = data.filter(route => route.status !== 'completed');
      const completed = data.filter(route => route.status === 'completed');
      
      setActiveRoutes(active);
      setCompletedRoutes(completed);
    } catch (err: any) {
      console.error('Error fetching routes:', err);
      setError(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const updateStopStatus = async (stopId: string, status: 'completed' | 'failed', notes: string = '') => {
    try {
      // Update route_stops table directly
      const { error } = await supabase
        .from('route_stops')
        .update({ 
          status: status,
          completed_time: new Date().toISOString(),
          notes: notes
        })
        .eq('id', stopId);
        
      if (error) throw error;
      
      // Refresh routes after update
      fetchRoutes();
      
      return true;
    } catch (err: any) {
      console.error('Error updating stop status:', err);
      setError(err.message || 'Failed to update stop');
      return false;
    }
  };

  const updateRouteStatus = async (routeId: string, status: string) => {
    try {
      // Update delivery_routes table directly
      const { error } = await supabase
        .from('delivery_routes')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId);
        
      if (error) throw error;
      
      // Refresh routes after update
      fetchRoutes();
      
      return true;
    } catch (err: any) {
      console.error('Error updating route status:', err);
      setError(err.message || 'Failed to update route');
      return false;
    }
  };
  
  const getRouteProgress = (route: DeliveryRoute) => {
    const pickupStops = route.pickup_route ? route.pickup_route.length : 0;
    const deliveryStops = route.delivery_route ? route.delivery_route.length : 0;
    const totalStops = pickupStops + deliveryStops;
    
    let completedStops = 0;
    
    if (route.pickup_route) {
      completedStops += route.pickup_route.filter((stop: any) => stop.status === 'completed').length;
    }
    
    if (route.delivery_route) {
      completedStops += route.delivery_route.filter((stop: any) => stop.status === 'completed').length;
    }
    
    return totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
  };
  
  useEffect(() => {
    fetchRoutes();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading driver routes...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md mx-auto my-4 max-w-xl text-center">
        <p className="text-destructive font-medium">Error: {error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={fetchRoutes}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-6 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Your Delivery Routes</h1>
        <p className="text-muted-foreground">
          Manage your pickups and deliveries for today
        </p>
      </header>
      
      <Tabs defaultValue="active" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active Routes ({activeRoutes.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Routes ({completedRoutes.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeRoutes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  You have no active routes. Check back later for new assignments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeRoutes.map((route) => (
                <Card key={route.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Route #{route.id.substring(0, 8)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(route.date), 'PPP')}
                          <Clock className="h-3.5 w-3.5 ml-2" />
                          {route.time_slot}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        route.status === 'in_progress' ? 'success' :
                        route.status === 'pending' ? 'outline' : 'secondary'
                      }>
                        {route.status === 'in_progress' ? 'In Progress' :
                         route.status === 'pending' ? 'Pending' : 
                         route.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={getRouteProgress(route)} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {getRouteProgress(route)}% complete
                      </p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    <div className="space-y-6">
                      {route.status === 'pending' && (
                        <div className="flex justify-center">
                          <Button
                            variant="success"
                            onClick={() => updateRouteStatus(route.id, 'in_progress')}
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Start Route
                          </Button>
                        </div>
                      )}
                      
                      {route.pickup_route && route.pickup_route.length > 0 && (
                        <div>
                          <h3 className="font-semibold flex items-center mb-3">
                            <PackageCheck className="mr-1.5 h-4 w-4 text-orange-500" />
                            Pickups
                          </h3>
                          <div className="space-y-3">
                            {route.pickup_route.map((stop: RouteStop, index: number) => (
                              <div 
                                key={stop.id} 
                                className={`p-3 border rounded-md ${
                                  stop.status === 'completed' ? 'bg-green-50 border-green-200' : 
                                  'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium flex items-center">
                                      <span className="bg-gray-200 text-gray-800 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">
                                        {index + 1}
                                      </span>
                                      {stop.customer_name}
                                    </h4>
                                    <p className="text-sm flex items-center mt-1 text-muted-foreground">
                                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                      {stop.address}
                                    </p>
                                  </div>
                                  
                                  <Badge variant={
                                    stop.status === 'completed' ? 'success' : 'outline'
                                  } className="ml-2">
                                    {stop.status === 'completed' ? 'Completed' : 'Pending'}
                                  </Badge>
                                </div>
                                
                                {route.status === 'in_progress' && stop.status !== 'completed' && (
                                  <div className="mt-3 flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(`https://maps.google.com/?q=${stop.latitude},${stop.longitude}`, '_blank')}
                                    >
                                      <Navigation className="mr-1 h-3.5 w-3.5" />
                                      Navigate
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="success"
                                      onClick={() => updateStopStatus(stop.id, 'completed')}
                                    >
                                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                      Complete
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {route.delivery_route && route.delivery_route.length > 0 && (
                        <div>
                          <h3 className="font-semibold flex items-center mb-3">
                            <Truck className="mr-1.5 h-4 w-4 text-blue-500" />
                            Deliveries
                          </h3>
                          <div className="space-y-3">
                            {route.delivery_route.map((stop: RouteStop, index: number) => (
                              <div 
                                key={stop.id} 
                                className={`p-3 border rounded-md ${
                                  stop.status === 'completed' ? 'bg-green-50 border-green-200' : 
                                  'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium flex items-center">
                                      <span className="bg-gray-200 text-gray-800 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">
                                        {index + 1}
                                      </span>
                                      {stop.customer_name}
                                    </h4>
                                    <p className="text-sm flex items-center mt-1 text-muted-foreground">
                                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                      {stop.address}
                                    </p>
                                  </div>
                                  
                                  <Badge variant={
                                    stop.status === 'completed' ? 'success' : 'outline'
                                  } className="ml-2">
                                    {stop.status === 'completed' ? 'Completed' : 'Pending'}
                                  </Badge>
                                </div>
                                
                                {route.status === 'in_progress' && stop.status !== 'completed' && (
                                  <div className="mt-3 flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(`https://maps.google.com/?q=${stop.latitude},${stop.longitude}`, '_blank')}
                                    >
                                      <Navigation className="mr-1 h-3.5 w-3.5" />
                                      Navigate
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="success"
                                      onClick={() => updateStopStatus(stop.id, 'completed')}
                                    >
                                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                      Complete
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {route.status === 'in_progress' && getRouteProgress(route) === 100 && (
                        <div className="mt-4 flex justify-center">
                          <Button
                            variant="success"
                            onClick={() => updateRouteStatus(route.id, 'completed')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Route
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedRoutes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  You haven't completed any routes yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedRoutes.map((route) => (
                <Card key={route.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Route #{route.id.substring(0, 8)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(route.date), 'PPP')}
                          <Clock className="h-3.5 w-3.5 ml-2" />
                          {route.time_slot}
                        </CardDescription>
                      </div>
                      <Badge variant="success">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        {route.pickup_route ? route.pickup_route.length : 0} pickups and {' '}
                        {route.delivery_route ? route.delivery_route.length : 0} deliveries
                      </p>
                      <p>
                        Completed on {format(new Date(route.updated_at), 'PPP')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
