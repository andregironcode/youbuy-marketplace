
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
import { Loader2, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types/product";
import { Link } from "react-router-dom";
import { OrderTracker } from "./OrderTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OrderStatus = "pending" | "paid" | "processing" | "out_for_delivery" | "delivered" | "cancelled";

interface Order {
  id: string;
  product_id: string;
  amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
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
}

export const PurchaseHistory = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "tracking">("orders");

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch orders where user is the buyer
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id, 
          product_id, 
          amount, 
          status, 
          created_at, 
          updated_at, 
          delivery_details,
          estimated_delivery,
          current_stage,
          last_status_change
        `)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      
      if (!orders || orders.length === 0) return [];

      // Fetch product details for each order
      const ordersWithProducts = await Promise.all(
        orders.map(async (order) => {
          const { data: productData, error: productError } = await supabase
            .from("products")
            .select(`
              id,
              title,
              price,
              image_urls,
              seller_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq("id", order.product_id)
            .single();

          if (productError) {
            console.error("Error fetching product:", productError);
            return order as Order; // Cast to Order type
          }

          const product = {
            id: productData.id,
            title: productData.title,
            price: parseFloat(productData.price),
            image: productData.image_urls?.[0] || "",
            images: productData.image_urls || [],
            seller: {
              id: productData.seller_id.id,
              name: productData.seller_id.full_name || productData.seller_id.username,
              avatar: productData.seller_id.avatar_url
            }
          };

          return {
            ...order,
            status: order.status as OrderStatus, // Cast string to OrderStatus
            product
          } as Order;
        })
      );

      return ordersWithProducts;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
        <p className="ml-2">Loading your purchase history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading purchase history. Please try again later.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-medium mb-2">No purchases yet</h3>
        <p className="text-muted-foreground mb-4">You haven't made any purchases yet.</p>
        <Button asChild>
          <Link to="/">Discover Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Purchase History</h2>
      </div>

      {selectedOrder ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedOrder(null)}
            >
              Back to all orders
            </Button>
            
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "orders" | "tracking")}
            >
              <TabsList>
                <TabsTrigger value="orders">Order Details</TabsTrigger>
                <TabsTrigger value="tracking">Track Order</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <TabsContent value="orders" className="mt-0">
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
                        <h4 className="font-medium mb-2">Order Summary</h4>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Product Price:</span>
                            <span>AED {selectedOrder.product?.price.toFixed(2) || selectedOrder.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Delivery Fee:</span>
                            <span>AED {(selectedOrder.amount - (selectedOrder.product?.price || 0)).toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                            <span>Total:</span>
                            <span>AED {selectedOrder.amount.toFixed(2)}</span>
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
                          <p className="text-sm text-muted-foreground">Seller: {selectedOrder.product.seller.name}</p>
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
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.id.substring(0, 8)}...
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
                <TableCell>AED {order.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedOrder(order);
                      setActiveTab("tracking");
                    }}
                  >
                    Track Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
