import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Tag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types/product";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderTracker } from "../purchases/OrderTracker";
import { TrackingUpdate } from "./TrackingUpdate";

type OrderStatus = "pending" | "paid" | "processing" | "out_for_delivery" | "delivered" | "cancelled" | "confirmed" | "preparing" | "pickup_scheduled" | "picked_up" | "in_transit" | "completed" | "returned";

interface Order {
  id: string;
  product_id: string;
  amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  buyer_id: string;
  buyer?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  delivery_details: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    deliveryTime: "morning" | "afternoon" | "evening";
    instructions?: string;
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  product?: ProductType;
  estimated_delivery?: string | null;
  current_stage?: string;
  last_status_change?: string;
  order_number?: string;
}

export const SalesHistory = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "cancelled">("active");
  const [selectedDetailTab, setSelectedDetailTab] = useState<"details" | "tracking" | "update">("details");

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["sales", user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];

      // Define status filter based on active tab
      let statusFilter: OrderStatus[];
      switch (activeTab) {
        case "active":
          statusFilter = [
            "pending", 
            "paid", 
            "processing", 
            "out_for_delivery",
            "confirmed",
            "preparing",
            "pickup_scheduled",
            "picked_up",
            "in_transit"
          ];
          break;
        case "completed":
          statusFilter = ["delivered", "completed"];
          break;
        case "cancelled":
          statusFilter = ["cancelled", "returned"];
          break;
        default:
          statusFilter = [
            "pending", 
            "paid", 
            "processing", 
            "out_for_delivery",
            "confirmed",
            "preparing",
            "pickup_scheduled",
            "picked_up",
            "in_transit"
          ];
      }

      // Fetch orders where user is the seller
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id, 
          product_id, 
          amount, 
          status, 
          created_at, 
          updated_at, 
          buyer_id,
          delivery_details,
          estimated_delivery,
          current_stage,
          last_status_change,
          order_number
        `)
        .eq("seller_id", user.id)
        .in("status", statusFilter)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      
      if (!orders || orders.length === 0) return [];

      // Fetch product details and buyer info for each order
      const ordersWithDetails = await Promise.all(
        orders.map(async (order: any) => {  // Type as any temporarily to handle the database response
          // Fetch product details
          const { data: productData, error: productError } = await supabase
            .from("products")
            .select(`
              id,
              title,
              price,
              image_urls
            `)
            .eq("id", order.product_id)
            .single();

          // Fetch buyer profile
          const { data: buyerData, error: buyerError } = await supabase
            .from("profiles")
            .select(`
              id,
              username,
              full_name,
              avatar_url
            `)
            .eq("id", order.buyer_id)
            .single();

          if (productError) {
            console.error("Error fetching product:", productError);
          }

          if (buyerError) {
            console.error("Error fetching buyer:", buyerError);
          }

          const product = productData ? {
            id: productData.id,
            title: productData.title,
            price: parseFloat(productData.price),
            image: productData.image_urls?.[0] || "",
            images: productData.image_urls || []
          } : undefined;

          const buyer = buyerData ? {
            id: buyerData.id,
            username: buyerData.username,
            full_name: buyerData.full_name,
            avatar_url: buyerData.avatar_url
          } : undefined;

          return {
            ...order,
            status: order.status as OrderStatus,
            product,
            buyer
          } as Order;
        })
      );

      return ordersWithDetails;
    },
    enabled: !!user,
  });

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-pink-100 text-pink-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "pickup_scheduled":
        return "bg-teal-100 text-teal-800";
      case "picked_up":
        return "bg-lime-100 text-lime-800";
      case "in_transit":
        return "bg-cyan-100 text-cyan-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "returned":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDeliveryTime = (time: string) => {
    switch (time) {
      case "morning":
        return "Morning (9am - 12pm)";
      case "afternoon":
        return "Afternoon (12pm - 5pm)";
      case "evening":
        return "Evening (5pm - 9pm)";
      default:
        return time;
    }
  };
  
  const handleOrderUpdateSuccess = () => {
    refetch();
    setSelectedDetailTab("tracking");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
        <p className="ml-2">Loading your sales history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading sales history. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Sales History</h2>
      </div>

      {!selectedOrder ? (
        <>
          <Tabs 
            defaultValue="active" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "active" | "completed" | "cancelled")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active Orders</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            {["active", "completed", "cancelled"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                {!orders || orders.length === 0 ? (
                  <div className="p-6 flex flex-col items-center justify-center h-48 bg-gray-50 rounded-md">
                    <Tag className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-2">No {tab} sales</h3>
                    <p className="text-muted-foreground text-center">
                      {tab === "active" 
                        ? "You don't have any active orders from buyers." 
                        : tab === "completed"
                          ? "You haven't completed any sales yet."
                          : "You don't have any cancelled orders."}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.order_number || order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{format(new Date(order.created_at), "PPP")}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.product?.image && (
                                <div className="h-8 w-8 rounded overflow-hidden">
                                  <img 
                                    src={order.product.image} 
                                    alt={order.product?.title || "Product"} 
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <span className="line-clamp-1">
                                {order.product?.title || "Product"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.buyer?.avatar_url && (
                                <div className="h-6 w-6 rounded-full overflow-hidden">
                                  <img 
                                    src={order.buyer.avatar_url} 
                                    alt={order.buyer?.full_name || order.buyer?.username || "Buyer"} 
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <span>
                                {order.buyer?.full_name || order.buyer?.username || "Anonymous"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>AED {order.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {activeTab === "active" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setSelectedDetailTab("update");
                                  }}
                                >
                                  Update
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setSelectedDetailTab("details");
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedOrder(null)}
            >
              Back to all orders
            </Button>
            
            <Tabs
              value={selectedDetailTab}
              onValueChange={(value) => setSelectedDetailTab(value as "details" | "tracking" | "update")}
            >
              <TabsList>
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="tracking">Track Order</TabsTrigger>
                {activeTab === "active" && (
                  <TabsTrigger value="update">Update Status</TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
          
          <TabsContent value="details" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Order details */}
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">Order Details</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {format(new Date(selectedOrder.created_at), "PPP")}
                        </p>
                      </div>
                      <Badge className={getStatusBadgeColor(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace("_", " ")}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Delivery Information</h4>
                        <div className="text-sm">
                          <p className="font-medium">{selectedOrder.delivery_details.fullName}</p>
                          <p>{selectedOrder.delivery_details.formattedAddress || selectedOrder.delivery_details.address}</p>
                          {!selectedOrder.delivery_details.formattedAddress && (
                            <p>{selectedOrder.delivery_details.city}, {selectedOrder.delivery_details.postalCode}</p>
                          )}
                          <p>Phone: {selectedOrder.delivery_details.phone}</p>
                          <p>Delivery Time: {formatDeliveryTime(selectedOrder.delivery_details.deliveryTime)}</p>
                          {selectedOrder.delivery_details.instructions && (
                            <p className="mt-2">
                              <span className="font-medium">Instructions:</span> {selectedOrder.delivery_details.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Buyer Information</h4>
                        <div className="text-sm">
                          {selectedOrder.buyer ? (
                            <div className="flex items-center gap-2 mb-3">
                              {selectedOrder.buyer.avatar_url && (
                                <div className="h-10 w-10 rounded-full overflow-hidden">
                                  <img 
                                    src={selectedOrder.buyer.avatar_url} 
                                    alt={selectedOrder.buyer?.full_name || selectedOrder.buyer?.username || "Buyer"} 
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{selectedOrder.buyer.full_name || selectedOrder.buyer.username || "Anonymous"}</p>
                                {selectedOrder.buyer.username && selectedOrder.buyer.full_name && (
                                  <p className="text-muted-foreground text-xs">@{selectedOrder.buyer.username}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p>No buyer information available</p>
                          )}
                          
                          <div className="mt-4">
                            <h5 className="font-medium mb-1">Order Summary</h5>
                            <div className="flex justify-between mb-1">
                              <span>Product Price:</span>
                              <span>AED {selectedOrder.product?.price.toFixed(2) || selectedOrder.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span>Your Earnings:</span>
                              <span className="text-green-600 font-medium">AED {(selectedOrder.amount * 0.95).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                              <span>Platform Fee (5%):</span>
                              <span>AED {(selectedOrder.amount * 0.05).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Product info */}
              {selectedOrder.product && (
                <div>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-3">Product</h3>
                      <div className="flex gap-3">
                        <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={selectedOrder.product.image || selectedOrder.product.images?.[0]} 
                            alt={selectedOrder.product.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2">{selectedOrder.product.title}</h4>
                          <p className="font-medium mt-1">AED {selectedOrder.product.price.toFixed(2)}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2" 
                            asChild
                          >
                            <Link to={`/product/${selectedOrder.product.id}`}>
                              View Product
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="tracking" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <OrderTracker 
                  orderId={selectedOrder.id}
                  currentStatus={selectedOrder.current_stage || selectedOrder.status}
                  orderDate={selectedOrder.created_at}
                  estimatedDelivery={selectedOrder.estimated_delivery}
                  orderAddress={selectedOrder.delivery_details}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="update" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <TrackingUpdate 
                  orderId={selectedOrder.id}
                  currentStatus={selectedOrder.current_stage || selectedOrder.status}
                  onUpdateSuccess={handleOrderUpdateSuccess}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      )}
    </div>
  );
};
