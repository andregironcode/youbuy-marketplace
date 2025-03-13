
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
import { Loader2, ArrowLeft, ShoppingBag, CreditCard, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "@/components/checkout/PaymentForm";

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY");

const CheckoutPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [deliveryDetails, setDeliveryDetails] = useState<CheckoutFormValues>({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    deliveryTime: "afternoon",
    instructions: ""
  });
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  // Fetch product details
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

  // Check if seller has a Stripe account
  const { data: sellerAccount, isLoading: checkingSellerAccount } = useQuery({
    queryKey: ["sellerAccount", product?.seller?.id],
    queryFn: async () => {
      if (!product?.seller?.id) throw new Error("Seller ID is required");

      const { data, error } = await supabase
        .from("seller_accounts")
        .select("*")
        .eq("user_id", product.seller.id)
        .maybeSingle();

      if (error) throw error;
      
      return data;
    },
    enabled: !!product?.seller?.id,
  });

  const handleDeliveryDetailsChange = (details: CheckoutFormValues) => {
    setDeliveryDetails(details);
    setStep('payment');
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
      // 1. Create order record
      const { data: orderData, error: orderError } = await supabase.rpc('create_order', {
        p_product_id: id,
        p_buyer_id: user.id,
        p_seller_id: product.seller.id,
        p_amount: parseFloat(product.price),
        p_status: 'pending',
        p_delivery_details: deliveryDetails
      });

      if (orderError) throw orderError;

      return orderData;
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

  const initializePaymentIntent = async (newOrderId: string) => {
    try {
      const response = await supabase.functions.invoke('stripe-payment/create-payment-intent', {
        body: {
          orderId: newOrderId,
          amount: parseFloat(product!.price),
          buyerId: user!.id,
          sellerId: product!.seller.id,
          productId: id
        }
      });

      if (response.error) throw new Error(response.error);
      
      setClientSecret(response.data.clientSecret);
      return true;
    } catch (error) {
      console.error("Error initializing payment:", error);
      toast({
        title: "Payment Error",
        description: "Could not initialize payment. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (step === 'payment' && product && user && !clientSecret) {
      const setupPayment = async () => {
        const newOrderId = await createOrder();
        if (newOrderId) {
          setOrderId(newOrderId);
          await initializePaymentIntent(newOrderId);
        }
      };
      setupPayment();
    }
  }, [step, product, user]);

  const handlePaymentSuccess = async () => {
    // Update product status to sold
    if (id) {
      const { error: productError } = await supabase
        .from("products")
        .update({ product_status: "sold" })
        .eq("id", id);

      if (productError) {
        console.error("Error updating product status:", productError);
      }
    }

    // Move to confirmation step
    setStep('confirmation');
    
    toast({
      title: "Purchase successful!",
      description: "Your order has been placed successfully.",
    });
  };

  const handleBackToProduct = () => {
    navigate(`/product/${id}`);
  };

  if (isLoading || checkingSellerAccount) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-youbuy" />
            <p className="ml-2">Loading checkout...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The product you're trying to purchase doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/">Browse More Products</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
                <Link to="/auth?redirect=/checkout/${id}">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show message if seller hasn't set up Stripe
  if (sellerAccount === null) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <h2 className="text-2xl font-bold mb-2">Payment Not Available</h2>
              <p className="text-muted-foreground mb-4">
                This seller hasn't set up payments yet. You can contact them through messages.
              </p>
              <div className="flex gap-4">
                <Button asChild variant="outline">
                  <Link to={`/product/${id}`}>Back to Product</Link>
                </Button>
                <Button asChild>
                  <Link to={`/messages?product=${id}`}>Message Seller</Link>
                </Button>
              </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Checkout form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {step === 'address' && <><ShoppingBag className="mr-2 h-5 w-5" />Delivery Details</>}
                  {step === 'payment' && <><CreditCard className="mr-2 h-5 w-5" />Payment Information</>}
                  {step === 'confirmation' && <><CheckCircle className="mr-2 h-5 w-5" />Order Confirmation</>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 'address' && (
                  <CheckoutForm 
                    initialValues={deliveryDetails}
                    onSubmit={handleDeliveryDetailsChange}
                  />
                )}
                {step === 'payment' && clientSecret && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h3 className="font-medium mb-2">Delivery Details</h3>
                      <p><strong>Name:</strong> {deliveryDetails.fullName}</p>
                      <p><strong>Address:</strong> {deliveryDetails.address}</p>
                      <p><strong>City:</strong> {deliveryDetails.city}</p>
                      <p><strong>Postal Code:</strong> {deliveryDetails.postalCode}</p>
                      <p><strong>Phone:</strong> {deliveryDetails.phone}</p>
                      <p><strong>Delivery Time:</strong> {
                        deliveryDetails.deliveryTime === 'morning' ? 'Morning (9am - 12pm)' :
                        deliveryDetails.deliveryTime === 'afternoon' ? 'Afternoon (12pm - 5pm)' : 
                        'Evening (5pm - 9pm)'
                      }</p>
                      {deliveryDetails.instructions && (
                        <p><strong>Instructions:</strong> {deliveryDetails.instructions}</p>
                      )}
                      <Button 
                        variant="outline" 
                        className="mt-2" 
                        onClick={() => setStep('address')}
                      >
                        Edit Details
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Payment Method</h3>
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm onSuccess={handlePaymentSuccess} />
                      </Elements>
                    </div>
                  </div>
                )}
                {step === 'confirmation' && (
                  <div className="space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Thank You for Your Purchase!</h2>
                    <p className="text-muted-foreground">
                      Your order has been successfully placed and will be processed by the seller soon.
                    </p>
                    <div className="p-4 bg-gray-50 rounded-md text-left">
                      <h3 className="font-medium mb-2">Delivery Information</h3>
                      <p><strong>Name:</strong> {deliveryDetails.fullName}</p>
                      <p><strong>Address:</strong> {deliveryDetails.address}</p>
                      <p><strong>Delivery Time:</strong> {
                        deliveryDetails.deliveryTime === 'morning' ? 'Morning (9am - 12pm)' :
                        deliveryDetails.deliveryTime === 'afternoon' ? 'Afternoon (12pm - 5pm)' : 
                        'Evening (5pm - 9pm)'
                      }</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button asChild>
                        <Link to="/">Continue Shopping</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/profile/purchases">View Your Purchases</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Order summary */}
          <div>
            <OrderSummary product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CheckoutPage;
