
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
};

export const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch orders
      const { data, error } = await supabase
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
      
      if (error) throw error;

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
    
    try {
      // Fetch more detailed information about the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, delivery_details')
        .eq('id', order.id)
        .single();
      
      if (orderError) throw orderError;
      
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

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">View and manage platform orders</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center">Loading orders...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{order.id.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.buyer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.seller_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.product_title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatAmount(order.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                      {order.payment_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {orderDetails && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Order Information</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Order ID:</span>
                      <span>{orderDetails.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(orderDetails.created_at).toLocaleString()}</span>
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
                      <span>{formatAmount(orderDetails.amount)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Delivery Information</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    {orderDetails.delivery_details && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span>{orderDetails.delivery_details.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Address:</span>
                          <span>{orderDetails.delivery_details.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">City:</span>
                          <span>{orderDetails.delivery_details.city || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Zip Code:</span>
                          <span>{orderDetails.delivery_details.zipCode || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Method:</span>
                          <span>{orderDetails.delivery_details.method || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {orderDetails.dispute_reason && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium">Dispute Information</h3>
                  <div className="mt-2 p-3 bg-red-50 rounded-md">
                    <div className="text-sm text-red-800">
                      <div className="font-medium">Reason: {orderDetails.dispute_status}</div>
                      <p>{orderDetails.dispute_reason}</p>
                      {orderDetails.dispute_deadline && (
                        <div className="mt-2">
                          <span className="font-medium">Deadline: </span>
                          {new Date(orderDetails.dispute_deadline).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
