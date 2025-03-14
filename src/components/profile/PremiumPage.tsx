
import { useState } from "react";
import { Check, Star, Building2, Rocket } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const PremiumPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const handleSubscribe = (plan: "premium" | "enterprise") => {
    // This would integrate with Stripe in a real implementation
    toast.success(`You've selected the ${plan} plan. Redirecting to payment...`);
    // In a real implementation, this would redirect to Stripe checkout
    // navigate(`/checkout/subscription/${plan}/${billingPeriod}`);
  };

  return (
    <div className="container max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">YouBuy Premium</h1>
        <p className="text-muted-foreground mt-2">
          Unlock enhanced features and benefits to boost your buying and selling experience
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Tabs defaultValue="monthly" className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="monthly" 
              onClick={() => setBillingPeriod("monthly")}
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger 
              value="yearly" 
              onClick={() => setBillingPeriod("yearly")}
            >
              Yearly <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">Save 20%</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-gray-500" />
              Free
            </CardTitle>
            <CardDescription>Basic features for all users</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">AED 0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Standard listings</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Basic buyer & seller protection</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>In-app messaging</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Basic stats & insights</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-youbuy relative">
          <div className="absolute top-0 right-0 bg-youbuy text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            POPULAR
          </div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rocket className="mr-2 h-5 w-5 text-youbuy" />
              Premium
            </CardTitle>
            <CardDescription>Enhanced features for active users</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                AED {billingPeriod === "monthly" ? "199" : "1,910"}
              </span>
              <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "month" : "year"}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>All Free features</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Enhanced buyer & seller protection</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Free delivery for orders over 100 AED</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Advanced statistics & insights</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Ability to bid on listings</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>2 free featured listings per month</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-youbuy hover:bg-youbuy-dark" onClick={() => handleSubscribe("premium")}>
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-youbuy" />
              Enterprise
            </CardTitle>
            <CardDescription>Business-grade features</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                AED {billingPeriod === "monthly" ? "399" : "3,830"}
              </span>
              <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "month" : "year"}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>All Premium features</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Business account badge</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Advanced analytics dashboard</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Bulk listing management</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Priority customer support</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>5 free featured listings per month</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Custom brand page</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-youbuy hover:bg-youbuy-dark" onClick={() => handleSubscribe("enterprise")}>
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">How is the subscription billed?</h3>
            <p className="text-muted-foreground mt-1">Subscriptions are automatically renewed each period. You can cancel anytime from your profile settings.</p>
          </div>
          <div>
            <h3 className="font-medium">Can I switch between plans?</h3>
            <p className="text-muted-foreground mt-1">Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the next billing cycle.</p>
          </div>
          <div>
            <h3 className="font-medium">What payment methods are accepted?</h3>
            <p className="text-muted-foreground mt-1">We accept all major credit cards and debit cards. All payments are securely processed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
