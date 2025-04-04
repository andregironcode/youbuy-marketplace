
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
      const { data: orderData, error: orderError } = await supabase.rpc('create_order', {
        p_product_id: id,
        p_buyer_id: user.id,
        p_seller_id: product.seller.id,
        p_amount: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        p_status: 'pending',
        p_delivery_details: deliveryDetails
      });

      if (orderError) throw orderError;

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
        related_id: orderData
      });

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

  const handlePaymentSuccess = async () => {
    const newOrderId = await createOrder();
    if (newOrderId) {
      setOrderId(newOrderId);
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

  if (isLoading) {
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
                {currentStep === 'delivery' && (
                  <CheckoutForm 
                    initialValues={deliveryDetails}
                    onSubmit={handleDeliveryDetailsChange}
                  />
                )}
                {currentStep === 'payment' && (
                  <div className="space-y-4">
                    {renderLocationDetails()}
                    
                    {deliveryDetails.latitude && deliveryDetails.longitude && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-red-500" />
                          Delivery Location
                        </h3>
                        <LocationMap 
                          latitude={deliveryDetails.latitude}
                          longitude={deliveryDetails.longitude}
                          height="250px"
                          zoom={15}
                          interactive={false}
                          showMarker={true}
                          className="mt-2 rounded-md overflow-hidden border border-gray-200"
                        />
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="mt-2" 
                      onClick={() => setCurrentStep('delivery')}
                    >
                      Edit Details
                    </Button>
                    
                    <div className="space-y-4 mt-6">
                      <h3 className="font-medium">Payment Method</h3>
                      <PaymentForm onSuccess={handlePaymentSuccess} />
                    </div>
                  </div>
                )}
                {currentStep === 'confirmation' && (
                  <div className="space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Thank You for Your Purchase!</h2>
                    <p className="text-muted-foreground">
                      Your order has been successfully placed and will be processed by the seller soon.
                    </p>
                    
                    {deliveryDetails.latitude && deliveryDetails.longitude && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2 flex items-center text-left">
                          <MapPin className="h-4 w-4 mr-1 text-red-500" />
                          Delivery Location
                        </h3>
                        <LocationMap 
                          latitude={deliveryDetails.latitude}
                          longitude={deliveryDetails.longitude}
                          height="200px"
                          zoom={15}
                          interactive={false}
                          showMarker={true}
                          className="mt-2 rounded-md overflow-hidden border border-gray-200"
                        />
                      </div>
                    )}
                    
                    <div className="p-4 bg-gray-50 rounded-md text-left mt-4">
                      <h3 className="font-medium mb-2">Delivery Information</h3>
                      <div className="flex items-center gap-2 mb-2">
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
                      {deliveryDetails.locationType === 'house' && deliveryDetails.houseNumber && (
                        <p><strong>House Number:</strong> {deliveryDetails.houseNumber}</p>
                      )}
                      {deliveryDetails.locationType === 'apartment' && (
                        <>
                          {deliveryDetails.buildingName && <p><strong>Building:</strong> {deliveryDetails.buildingName}</p>}
                          {deliveryDetails.floor && <p><strong>Floor:</strong> {deliveryDetails.floor}</p>}
                          {deliveryDetails.apartmentNumber && <p><strong>Apartment:</strong> #{deliveryDetails.apartmentNumber}</p>}
                        </>
                      )}
                      <p><strong>Delivery Time:</strong> {
                        deliveryDetails.deliveryTime === 'morning' ? 'Morning (9am - 12pm)' :
                        deliveryDetails.deliveryTime === 'afternoon' ? 'Afternoon (12pm - 5pm)' : 
                        'Evening (5pm - 9pm)'
                      }</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button asChild className="bg-youbuy hover:bg-youbuy-dark">
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

          <div>
            <OrderSummary product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default CheckoutPage;
