
import { CalendarDays, ShieldCheck, Star, Truck, Clock, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SellerInformation = () => {
  return (
    <div className="space-y-6">
      {/* Seller policies */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Seller Policies</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-youbuy flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Shipping Options</h4>
                <p className="text-sm text-muted-foreground">
                  This seller offers both local pickup and shipping services.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-youbuy flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Response Time</h4>
                <p className="text-sm text-muted-foreground">
                  Usually responds within 24 hours.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-youbuy flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Return Policy</h4>
                <p className="text-sm text-muted-foreground">
                  Returns accepted within 7 days of purchase. Buyer pays return shipping.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Seller stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Seller Stats</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-youbuy" />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">March 2023</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-youbuy" />
                <span className="text-sm font-medium">Average Rating</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">4.5 out of 5</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-youbuy" />
                <span className="text-sm font-medium">Verification</span>
              </div>
              <div className="pl-6">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ID Verified
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center">
                <Truck className="h-4 w-4 mr-2 text-youbuy" />
                <span className="text-sm font-medium">Fast Shipper</span>
              </div>
              <div className="pl-6">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Quick Delivery
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* About section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">About This Seller</h3>
          <p className="text-sm text-muted-foreground">
            I sell quality items at fair prices. I'm always happy to answer questions about my 
            products and negotiate reasonable offers. All my items come from a smoke-free, 
            pet-free home. I ship items quickly and package them carefully to ensure they 
            arrive in perfect condition.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
