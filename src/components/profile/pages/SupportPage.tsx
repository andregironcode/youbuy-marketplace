import { PageHeader } from "../PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Headphones, Mail, MessageSquare, Phone } from "lucide-react";

export const SupportPage = () => {
  return (
    <>
      <PageHeader
        title="Support Center"
        description="Get help with your account, orders, or any other questions"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-youbuy/20 shadow-sm">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Choose your preferred contact method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
                <Phone className="h-8 w-8" />
                <span>Call Us</span>
                <span className="text-sm text-muted-foreground">+971 4 123 4567</span>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center gap-2 p-4">
                <Mail className="h-8 w-8" />
                <span>Email Us</span>
                <span className="text-sm text-muted-foreground">support@youbuy.com</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-youbuy/20 shadow-sm">
          <CardHeader>
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>Chat with our support team in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <Button className="bg-youbuy/50 hover:bg-youbuy/50 text-white cursor-not-allowed" disabled>
                <MessageSquare className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border border-youbuy/20 shadow-sm">
          <CardHeader>
            <CardTitle>Submit a Ticket</CardTitle>
            <CardDescription>Send us a message and we'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What's your question about?" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your issue in detail..."
                  className="min-h-[150px]"
                />
              </div>
              <Button className="bg-youbuy hover:bg-youbuy/90 text-white">
                <Headphones className="mr-2 h-4 w-4" />
                Submit Ticket
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border border-youbuy/20 shadow-sm">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium">How do I track my order?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You can track your order by going to the Purchases page and clicking on the order details. You'll find the tracking information there.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-medium">What is the return policy?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We offer a 14-day return policy for most items. Items must be in their original condition with all tags attached. Some items may have different return policies.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-medium">How do I become a seller?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  To become a seller, go to your account settings and click on "Become a Seller". You'll need to provide some basic information and agree to our seller terms.
                </p>
              </div>
              <div>
                <h3 className="font-medium">How do I contact a seller?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You can contact a seller by clicking the "Message" button on their product page or through the Messages section in your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
