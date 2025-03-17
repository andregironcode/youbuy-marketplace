
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, MapPin, Truck, Clock, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { OrderTracker } from "@/components/purchases/OrderTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackingUpdate } from "@/components/sales/TrackingUpdate";
import { format, addDays } from "date-fns";

type Order = {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_status: string;
  buyer_name?: string;
  seller_name?: string;
  product_title?: string;
  current_stage?: string;
  estimated_delivery?: string;
  delivery_details?: any;
};

export const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"details" | "tracking" | "update">("details");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "delivered" | "cancelled">("all");
  const { toast } = useToast();
  
  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Prepare filter condition based on selected filter
      let query = supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id (
            profiles:id (
              full_name
            )
          ),
          seller:seller_id (
            profiles:id (
              full_name
            )
          ),
          products:product_id (
            title
          )
        `);
      
      // Apply status filter if not "all"
      if (filter === "pending") {
        query = query.eq('status', 'pending');
      } else if (filter === "active") {
        query = query.in('status', ['processing', 'out_for_delivery', 'pickup_scheduled', 'picked_up', 'in_transit']);
      } else if (filter === "delivered") {
        query = query.eq('status', 'delivered');
      } else if (filter === "cancelled") {
        query = query.eq('status', 'cancelled');
      }
      
      // Execute query with order by created_at
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      console.log("Fetched orders data:", data);

      // Map the data to include names
      const ordersWithNames = data.map((order: any) => ({
        ...order,
        buyer_name: order.buyer?.profiles?.full_name || 'Unknown Buyer',
        seller_name: order.seller?.profiles?.full_name || 'Unknown Seller',
        product_title: order.products?.title || 'Unknown Product'
      }));

      setOrders(ordersWithNames);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Failed to load orders",
        description: "There was an error loading the order data."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setActiveDetailTab("details");
    
    try {
      // Fetch more detailed information about the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, delivery_details')
        .eq('id', order.id)
        .single();
      
      if (orderError) throw orderError;
      
      console.log("Fetched order details:", orderData);
      setOrderDetails(orderData);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        variant: "destructive",
        title: "Failed to load details",
        description: "There was an error loading the order details."
      });
    }
  };

  const handleOrderUpdateSuccess = () => {
    fetchOrders();
    setActiveDetailTab("tracking");
    toast({
      title: "Order updated",
      description: "Order status has been successfully updated."
    });
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    return `AED ${amount.toFixed(2)}`;
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'confirmed':
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
      case 'picked_up':
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="h-4 w-4" />;
      case 'processing':
      case 'preparing':
      case 'pickup_scheduled':
        return <Package className="h-4 w-4" />;
      case 'picked_up':
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
      case 'completed':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Function to set a future delivery date for unscheduled orders
  const setEstimatedDelivery = async (orderId: string) => {
    try {
      const deliveryDate = format(addDays(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss");
      
      const { error } = await supabase
        .from('orders')
        .update({ estimated_delivery: deliveryDate })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Delivery date set",
        description: "Estimated delivery date has been set."
      });
      
      fetchOrders();
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          estimated_delivery: deliveryDate
        });
      }
    } catch (error) {
      console.error("Error setting delivery date:", error);
      toast({
        variant: "destructive",
        title: "Failed to set delivery date",
        description: "There was an error setting the delivery date."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">View and manage platform orders</p>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Tabs 
              value={filter} 
              onValueChange={(value) => setFilter(value as "all" | "pending" | "active" | "delivered" | "cancelled")}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <Button onClick={fetchOrders} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh Orders"}
        </Button>
      </div>
      
      <div className="border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">Loading orders...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{order.id.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(order.created_at), "PPP")}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.buyer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.seller_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.product_title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatAmount(order.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span 
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* For orders without estimated delivery date */}
                      {['pending', 'processing', 'confirmed'].includes(order.status) && !order.estimated_delivery && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEstimatedDelivery(order.id)}
                        >
                          Set Delivery Date
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order Management</DialogTitle>
            <DialogDescription>
              Manage order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {orderDetails && (
            <div className="py-4">
              <Tabs
                value={activeDetailTab}
                onValueChange={(value) => setActiveDetailTab(value as "details" | "tracking" | "update")}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="tracking">Track Order</TabsTrigger>
                  <TabsTrigger value="update">Update Status</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Order Information</h3>
                      <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order ID:</span>
                          <span className="font-medium">{orderDetails.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created:</span>
                          <span>{format(new Date(orderDetails.created_at), "PPP")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Product:</span>
                          <span>{orders.find(o => o.id === orderDetails.id)?.product_title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(orderDetails.status)}`}>
                            {orderDetails.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Status:</span>
                          <span>{orderDetails.payment_status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-medium">{formatAmount(orderDetails.amount)}</span>
                        </div>
                        
                        {orderDetails.estimated_delivery && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Estimated Delivery:</span>
                            <span>{format(new Date(orderDetails.estimated_delivery), "PPP")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Delivery Information</h3>
                      <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                        {orderDetails.delivery_details && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Name:</span>
                              <span>{orderDetails.delivery_details.fullName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Phone:</span>
                              <span>{orderDetails.delivery_details.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Address:</span>
                              <span className="text-right">{orderDetails.delivery_details.formattedAddress || orderDetails.delivery_details.address || 'N/A'}</span>
                            </div>
                            {orderDetails.delivery_details.city && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">City:</span>
                                <span>{orderDetails.delivery_details.city || 'N/A'}</span>
                              </div>
                            )}
                            {orderDetails.delivery_details.postalCode && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Postal Code:</span>
                                <span>{orderDetails.delivery_details.postalCode || 'N/A'}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Delivery Time:</span>
                              <span>{orderDetails.delivery_details.deliveryTime || 'N/A'}</span>
                            </div>
                            {orderDetails.delivery_details.instructions && (
                              <div className="pt-2 border-t">
                                <p className="text-gray-500 mb-1">Instructions:</p>
                                <p className="text-sm">{orderDetails.delivery_details.instructions}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveDetailTab("tracking")}
                      >
                        Track Order
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveDetailTab("update")}
                      >
                        Update Status
                      </Button>
                    </div>
                    
                    {!orderDetails.estimated_delivery && ['pending', 'processing', 'confirmed'].includes(orderDetails.status) && (
                      <Button 
                        variant="outline" 
                        onClick={() => setEstimatedDelivery(orderDetails.id)}
                      >
                        Set Delivery Date
                      </Button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="tracking" className="mt-4">
                  <OrderTracker 
                    orderId={orderDetails.id}
                    currentStatus={orderDetails.current_stage || orderDetails.status}
                    orderDate={orderDetails.created_at}
                    estimatedDelivery={orderDetails.estimated_delivery}
                    orderAddress={orderDetails.delivery_details}
                  />
                </TabsContent>
                
                <TabsContent value="update" className="mt-4">
                  <TrackingUpdate 
                    orderId={orderDetails.id}
                    currentStatus={orderDetails.current_stage || orderDetails.status}
                    onUpdateSuccess={handleOrderUpdateSuccess}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
