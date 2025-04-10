import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  Package, 
  Truck, 
  Check, 
  AlertCircle,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { TrackingUpdate } from "@/components/sales/TrackingUpdate";
import { Database } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types";

// Define more specific interfaces
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface Product {
  id: string;
  title: string;
  image_urls?: string[] | null;
}

// Raw order from database - without joined relationships
interface OrderRaw {
  id: string;
  order_number?: number;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  current_stage: string | null;
  delivery_details: Json;
  // Additional properties from the database schema
  payment_status?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_transfer_id?: string | null;
  estimated_delivery?: string | null;
  last_status_change?: string | null;
  last_updated_by?: string | null;
  delivery_confirmed_at?: string | null;
  dispute_deadline?: string | null;
  dispute_reason?: string | null;
  dispute_status?: string | null;
}

// Processed order with derived properties
interface ProcessedOrder {
  id: string;
  order_number?: number;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  current_stage: string | null;
  buyer_name: string;
  seller_name: string;
  product_title: string;
  product_image: string | null;
}

interface OrderDetails {
  order_id: string;
  order_number?: number;
  buyer_name?: string;
  seller_name?: string;
  product_title?: string;
  product_images?: string[];
  current_stage?: string;
  status?: string;
  stage_name?: string;
  order_date?: string;
  estimated_delivery?: string;
  product_id?: string;
}

export const AdminOrders = () => {
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Helper functions for UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'confirmed':
      case 'preparing':
        return "bg-blue-100 text-blue-800";
      case 'pickup_scheduled':
      case 'picked_up':
      case 'in_transit':
        return "bg-purple-100 text-purple-800";
      case 'out_for_delivery':
        return "bg-indigo-100 text-indigo-800";
      case 'delivered':
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'cancelled':
      case 'returned':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
      case 'pickup_scheduled':
        return <Package className="h-4 w-4" />;
      case 'picked_up':
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'cancelled':
      case 'returned':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };
  
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching orders data...");
      
      // First fetch the orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          buyer_id,
          seller_id,
          product_id,
          amount,
          status,
          created_at,
          updated_at,
          current_stage,
          delivery_details,
          payment_status,
          stripe_payment_intent_id,
          stripe_transfer_id,
          estimated_delivery,
          last_status_change,
          last_updated_by,
          delivery_confirmed_at,
          dispute_deadline,
          dispute_reason,
          dispute_status
        `)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        throw ordersError;
      }

      console.log("Fetched orders data:", ordersData);
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      
      // Process the raw orders with additional data
      const processedOrders: ProcessedOrder[] = await Promise.all(
        ordersData.map(async (orderData: any) => {  // Type as any temporarily to handle the database response
          // Explicitly cast to ensure TypeScript knows this matches our OrderRaw interface
          const order = orderData as OrderRaw;
          
          // Fetch buyer profile
          const { data: buyerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', order.buyer_id)
            .single();
          
          // Fetch seller profile
          const { data: sellerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', order.seller_id)
            .single();
          
          // Fetch product
          const { data: productData } = await supabase
            .from('products')
            .select('*')
            .eq('id', order.product_id)
            .single();
          
          return {
            ...order,
            buyer_name: buyerData?.full_name || buyerData?.username || "Unknown Buyer",
            seller_name: sellerData?.full_name || sellerData?.username || "Unknown Seller",
            product_title: productData?.title || "Unknown Product",
            product_image: productData?.image_urls?.[0] || null
          };
        })
      );
      
      console.log("Processed orders:", processedOrders);
      setOrders(processedOrders);
    } catch (error: any) {
      console.error("Error in fetchOrders:", error);
      setError("Failed to load orders. Please try again.");
      toast({
        variant: "destructive",
        title: "Error loading orders",
        description: "Failed to load order data. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const viewOrderDetails = async (orderId: string) => {
    try {
      setIsLoading(true);
      console.log("Fetching order details for order ID:", orderId);
      
      // Get the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          buyer_id,
          seller_id,
          product_id,
          amount,
          status,
          created_at,
          updated_at,
          current_stage,
          delivery_details,
          payment_status,
          stripe_payment_intent_id,
          stripe_transfer_id,
          estimated_delivery,
          last_status_change,
          last_updated_by,
          delivery_confirmed_at,
          dispute_deadline,
          dispute_reason,
          dispute_status
        `)
        .eq('id', orderId)
        .single();
      
      if (orderError) {
        throw new Error("Could not load order details");
      }
      
      console.log("Order data fetched:", orderData);
      
      // Cast orderData to unknown first, then to OrderRaw type
      const typedOrderData = orderData as unknown as OrderRaw;
      
      // Get associated buyer
      const { data: buyerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', typedOrderData.buyer_id)
        .single();
      
      // Get associated seller
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', typedOrderData.seller_id)
        .single();
      
      // Get associated product
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', typedOrderData.product_id)
        .single();
      
      const formattedData: OrderDetails = {
        order_id: typedOrderData.id,
        order_number: typedOrderData.order_number,
        buyer_name: buyerData?.full_name || buyerData?.username || "Unknown Buyer",
        seller_name: sellerData?.full_name || sellerData?.username || "Unknown Seller",
        product_title: productData?.title || "Unknown Product",
        product_images: productData?.image_urls || [],
        product_id: productData?.id,
        current_stage: typedOrderData.current_stage || typedOrderData.status,
        status: typedOrderData.status,
        order_date: typedOrderData.created_at,
        estimated_delivery: typedOrderData.estimated_delivery
      };
      
      console.log("Formatted order details:", formattedData);
      setOrderDetails(formattedData);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error("Error in viewOrderDetails:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportOrders = () => {
    try {
      // Create CSV content
      const headers = ["Order ID", "Product", "Buyer", "Seller", "Amount", "Status", "Date"];
      const csvRows = [headers];
      
      const filteredOrders = filterOrders();
      
      filteredOrders.forEach(order => {
        csvRows.push([
          order.id,
          order.product_title,
          order.buyer_name,
          order.seller_name,
          `$${Number(order.amount).toFixed(2)}`,
          order.status,
          new Date(order.created_at).toLocaleDateString()
        ]);
      });
      
      // Create CSV string
      const csvContent = csvRows.map(row => row.join(",")).join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Orders data has been exported to CSV."
      });
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export orders data."
      });
    }
  };

  const handleStatusUpdate = () => {
    // Refresh the data after a status update
    fetchOrders();
    setIsDetailDialogOpen(false);
    
    toast({
      title: "Order updated",
      description: "The order status has been updated successfully."
    });
  };
  
  const filterOrders = () => {
    return orders.filter(order => {
      // Search filter
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      
      // Time filter
      let matchesTime = true;
      if (timeFilter) {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        
        switch (timeFilter) {
          case 'today':
            matchesTime = orderDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            matchesTime = orderDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            matchesTime = orderDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesTime;
    });
  };
  
  const filteredOrders = filterOrders();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage all orders on the platform
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter by Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('confirmed')}>
                Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in_transit')}>
                In Transit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('delivered')}>
                Delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Clock className="mr-2 h-4 w-4" />
                Time Period
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeFilter(null)}>
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('week')}>
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('month')}>
                Last 30 Days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={exportOrders} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={fetchOrders} className="w-full sm:w-auto">
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-600">Error loading orders</p>
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-2 h-8 text-red-600 border-red-300 hover:bg-red-100"
                onClick={fetchOrders}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {filteredOrders.length > 0 && !error && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
          {statusFilter && ` • Status: ${statusFilter}`}
          {timeFilter && ` • Period: ${timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}`}
        </div>
      )}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Loading orders...</div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <p className="text-muted-foreground">No orders found</p>
                  {(searchTerm || statusFilter || timeFilter) && (
                    <Button variant="link" onClick={() => {
                      setSearchTerm("");
                      setStatusFilter(null);
                      setTimeFilter(null);
                    }} className="mt-2">
                      Clear filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    #{order.order_number || order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {order.product_title}
                  </TableCell>
                  <TableCell>
                    ${Number(order.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {order.buyer_name}
                  </TableCell>
                  <TableCell>
                    {order.seller_name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost" 
                      size="icon"
                      onClick={() => viewOrderDetails(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>
          
          {orderDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-mono">#{orderDetails.order_number || orderDetails.order_id?.substring(0, 12)}...</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{orderDetails.order_date ? format(new Date(orderDetails.order_date), "PPP") : "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(orderDetails.current_stage || "pending")}>
                          {orderDetails.stage_name || orderDetails.current_stage || "Pending"}
                        </Badge>
                      </div>
                      {orderDetails.estimated_delivery && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Est. Delivery:</span>
                          <span>{format(new Date(orderDetails.estimated_delivery), "PPP")}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Product</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {orderDetails.product_images?.[0] && (
                        <img 
                          src={orderDetails.product_images[0]} 
                          alt={orderDetails.product_title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{orderDetails.product_title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Product ID: {orderDetails.product_id?.substring(0, 8) || "N/A"}...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Parties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Buyer:</p>
                        <div className="font-medium">{orderDetails.buyer_name}</div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Seller:</p>
                        <div className="font-medium">{orderDetails.seller_name}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Update Status</CardTitle>
                    <CardDescription>
                      Change the status of this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orderDetails.order_id ? (
                      <TrackingUpdate 
                        orderId={orderDetails.order_id}
                        currentStatus={orderDetails.current_stage || "pending"}
                        onUpdateSuccess={handleStatusUpdate}
                      />
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>Could not load tracking information</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
