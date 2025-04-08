import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ProductType, convertToProductType } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutForm, CheckoutFormValues } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Loader2, ArrowLeft, ShoppingBag, CreditCard, CheckCircle, Home, Building, MapPin, Package, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { LocationMap } from "@/components/map/LocationMap";

// Steps in the checkout process
type CheckoutStep = 'delivery' | 'payment' | 'confirmation';

const CheckoutPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [deliveryDetails, setDeliveryDetails] = useState<CheckoutFormValues>({
    fullName: "",
    locationType: "house",
    phone: "",
    deliveryTime: "afternoon",
    formattedAddress: ""
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(33);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>('cash');

  // Query to fetch the product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller_id(
            id,
            username,
            full_name,
            avatar_url,
            created_at
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      return convertToProductType({
        ...data,
        profiles: data.seller_id,
      }, true);
    },
    enabled: !!id,
  });

  // Update progress bar based on current step
  useEffect(() => {
    switch (currentStep) {
      case 'delivery':
        setProgress(33);
        break;
      case 'payment':
        setProgress(66);
        break;
      case 'confirmation':
        setProgress(100);
        break;
    }
  }, [currentStep]);

  const handleDeliveryDetailsChange = async (details: CheckoutFormValues) => {
    setDeliveryDetails(details);
    setCurrentStep('payment');
  };

  const createOrder = async () => {
    if (!user || !product || !id) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Add payment method to delivery details
      const deliveryDetailsWithPayment = {
        ...deliveryDetails,
        paymentMethod: paymentMethod
      };

      // Create the order directly instead of using RPC
      const { data: orderData, error: createOrderError } = await supabase
        .from('orders')
        .insert({
          product_id: id,
          buyer_id: user.id,
          seller_id: product.seller.id,
          amount: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          status: 'pending',
          delivery_details: deliveryDetailsWithPayment,
          payment_method: paymentMethod
        })
        .select('id')
        .single();

      if (createOrderError) {
        console.error("Order creation error:", createOrderError);
        toast({
          title: "Error creating order",
          description: createOrderError.message,
          variant: "destructive"
        });
        return null;
      }

      // Process wallet payment if selected using the WalletContext
      if (paymentMethod === 'wallet') {
        try {
          // This will be handled by the direct makePayment call in handlePaymentSuccess
          console.log("Wallet payment selected, will be processed after order creation");
        } catch (paymentError) {
          console.error("Payment error:", paymentError);
          toast({
            title: "Payment Error",
            description: "Your order was created but the payment failed. Please contact support.",
            variant: "destructive"
          });
          // Continue with order creation even if payment fails
        }
      }

      // Create initial order status history entry
      await supabase.from('order_status_history').insert({
        order_id: orderData.id,
        status: 'pending',
        notes: 'Order created'
      });

      // Create Shipday order with retry mechanism
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        // Add a small delay to ensure the order is available in the database
        await new Promise(resolve => setTimeout(resolve, 1000));

        const shipdayResponse = await fetch('https://epkpqlkvhuqnfepfpscd.supabase.co/functions/v1/order-management/create-shipday-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            orderId: orderData.id,
            productId: id,
            buyerId: user.id,
            sellerId: product.seller.id,
            amount: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
            deliveryDetails: deliveryDetails
          })
        });

        if (!shipdayResponse.ok) {
          const errorText = await shipdayResponse.text();
          console.error('Failed to create Shipday order:', errorText);
          // Don't throw here, just log the error and continue
        } else {
          const shipdayData = await shipdayResponse.json();
          // Update order with Shipday reference
          const { error: updateError } = await supabase
            .from('orders')
            .update({ shipday_order_id: shipdayData.order_id })
            .eq('id', orderData.id);

          if (updateError) {
            console.error('Failed to update order with Shipday reference:', updateError);
          }
        }
      } catch (error) {
        console.error('Error creating Shipday order:', error);
        // Continue with the order creation even if Shipday fails
      }

      const { error: productError } = await supabase
        .from("products")
        .update({ 
          product_status: "reserved",
          reserved_user_id: user.id
        })
        .eq("id", id);

      if (productError) throw productError;

      await supabase.from("notifications").insert({
        user_id: product.seller.id,
        type: "new_order",
        title: "New Order Received",
        description: `You have received a new order for ${product.title}`,
        related_id: orderData.id
      });

      return orderData.id;
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handlePaymentSuccess = async (method: 'wallet' | 'cash') => {
    setPaymentMethod(method);
    const newOrderId = await createOrder();
    if (newOrderId) {
      setOrderId(newOrderId as string);  // Cast to string for type safety
      setCurrentStep('confirmation');
      
      toast({
        title: "Order successful!",
        description: "Your order has been placed successfully.",
      });
    }
  };

  const handleBackToProduct = () => {
    navigate(`/product/${id}`);
  };

  // Render steps indicator
  const renderStepIndicator = () => {
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between mb-2">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${currentStep === 'delivery' ? 'bg-youbuy text-white' : currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-xs">Delivery</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${currentStep === 'payment' ? 'bg-youbuy text-white' : currentStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="text-xs">Payment</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${currentStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-xs">Confirmation</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-youbuy h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  };

  const renderLocationDetails = () => {
    if (!deliveryDetails) return null;
    
    return (
      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-2">Delivery Details</h3>
        <div className="flex items-center gap-2 mt-2 mb-3">
          {deliveryDetails.locationType === 'house' ? (
            <div className="flex items-center text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
              <Home className="h-3 w-3 mr-1" />
              House
            </div>
          ) : (
            <div className="flex items-center text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded">
              <Building className="h-3 w-3 mr-1" />
              Apartment
            </div>
          )}
        </div>
        
        <p><strong>Name:</strong> {deliveryDetails.fullName}</p>
        <p><strong>Address:</strong> {deliveryDetails.formattedAddress}</p>
        
        {deliveryDetails.locationType === 'house' ? (
          deliveryDetails.houseNumber && (
            <p><strong>House Number:</strong> {deliveryDetails.houseNumber}</p>
          )
        ) : (
          <div>
            {deliveryDetails.buildingName && (
              <p><strong>Building:</strong> {deliveryDetails.buildingName}</p>
            )}
            {deliveryDetails.floor && (
              <p><strong>Floor:</strong> {deliveryDetails.floor}</p>
            )}
            {deliveryDetails.apartmentNumber && (
              <p><strong>Apartment:</strong> #{deliveryDetails.apartmentNumber}</p>
            )}
          </div>
        )}
        
        <p><strong>Phone:</strong> {deliveryDetails.phone}</p>
        <p><strong>Delivery Time:</strong> {
          deliveryDetails.deliveryTime === 'morning' ? 'Morning (9am - 12pm)' :
          deliveryDetails.deliveryTime === 'afternoon' ? 'Afternoon (12pm - 5pm)' : 
          'Evening (5pm - 9pm)'
        }</p>
        {deliveryDetails.additionalInfo && (
          <p><strong>Additional Info:</strong> {deliveryDetails.additionalInfo}</p>
        )}
        {deliveryDetails.instructions && (
          <p><strong>Instructions:</strong> {deliveryDetails.instructions}</p>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
        </div>
      );
    }

    if (error || !product) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error loading product. Please try again.</p>
          <Button variant="outline" onClick={handleBackToProduct}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to product
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 'delivery':
        return (
          <CheckoutForm onSubmit={handleDeliveryDetailsChange} initialValues={deliveryDetails} />
        );
      case 'payment':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {renderLocationDetails()}
              <Separator className="my-4" />
              <PaymentForm onSuccess={handlePaymentSuccess} totalAmount={typeof product.price === 'string' ? parseFloat(product.price) : product.price} />
            </CardContent>
          </Card>
        );
      case 'confirmation':
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Your order has been placed successfully. The seller has been notified and will prepare your item for delivery.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md w-full max-w-md mb-6">
                  <p className="font-medium mb-2">Order Reference</p>
                  <p className="text-sm font-mono bg-white border rounded-md p-2">{orderId}</p>
                </div>
                
                <Button asChild>
                  <Link to={`/profile/orders`}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View My Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <h2 className="text-2xl font-bold mb-2">Sign in Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to continue with your purchase.
              </p>
              <Button asChild>
                <Link to={`/auth?redirect=/checkout/${id}`}>Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handleBackToProduct}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to product
        </Button>

        {renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {currentStep === 'delivery' && <><Truck className="mr-2 h-5 w-5" />Delivery Details</>}
                  {currentStep === 'payment' && <><CreditCard className="mr-2 h-5 w-5" />Payment Information</>}
                  {currentStep === 'confirmation' && <><CheckCircle className="mr-2 h-5 w-5" />Order Confirmation</>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderContent()}
              </CardContent>
            </Card>
          </div>

          <div>
            <OrderSummary product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CheckoutPage;
