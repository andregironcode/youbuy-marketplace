
import { useState } from "react";
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  User, 
  HelpCircle, 
  Star,
  ChevronRight,
  Search,
  Mail,
  MessageCircle,
  Phone
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type SupportCategory = {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  faqs: {
    question: string;
    answer: string;
  }[];
};

const supportCategories: SupportCategory[] = [
  {
    id: "orders",
    title: "Orders",
    icon: ShoppingBag,
    description: "Get help with your purchases and order status",
    faqs: [
      {
        question: "How do I track my order?",
        answer: "You can track your order by visiting the 'Purchases' section in your profile. Each order has a status that indicates where it is in the delivery process."
      },
      {
        question: "Can I cancel my order?",
        answer: "Orders can be cancelled before the seller ships them. Go to 'Purchases', select the order you want to cancel, and click on the 'Cancel Order' button if it's still available."
      },
      {
        question: "I received the wrong item, what should I do?",
        answer: "If you received the wrong item, please contact the seller through the messaging system and explain the situation. If you can't resolve it directly, you can open a dispute through our resolution center."
      },
      {
        question: "How do I return an item?",
        answer: "To return an item, go to your 'Purchases', find the order, and click 'Return Item'. Follow the instructions to complete the return process. Remember that return policies may vary by seller."
      }
    ]
  },
  {
    id: "shipping",
    title: "Shipping",
    icon: Truck,
    description: "Information about shipping methods and delivery",
    faqs: [
      {
        question: "What shipping methods are available?",
        answer: "YouBuy supports both in-person meetups and platform shipping. Sellers can choose which shipping methods they offer for each product."
      },
      {
        question: "How long will shipping take?",
        answer: "Shipping times vary depending on the seller's location and the shipping method. Estimated delivery times are displayed on the product page before purchase."
      },
      {
        question: "Do you ship internationally?",
        answer: "International shipping depends on the individual seller. You can check if a product ships to your location on the product details page."
      },
      {
        question: "My package is delayed, what should I do?",
        answer: "If your package is delayed beyond the estimated delivery date, first check the tracking information. If it seems stuck, contact the seller directly through our messaging system."
      }
    ]
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    description: "Help with payment methods and transactions",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit and debit cards, as well as various digital payment methods like Apple Pay and Google Pay through our secure payment processor."
      },
      {
        question: "Is it safe to use my credit card on YouBuy?",
        answer: "Yes, all payment information is encrypted and processed securely. We never store your complete credit card details on our servers."
      },
      {
        question: "How do refunds work?",
        answer: "Refunds are processed back to your original payment method. Processing times vary by payment provider, but typically take 5-10 business days to appear in your account."
      },
      {
        question: "I was charged twice for my order, what should I do?",
        answer: "If you notice a duplicate charge, please contact our support team immediately with your order details and we'll investigate and resolve the issue."
      }
    ]
  },
  {
    id: "account",
    title: "Account",
    icon: User,
    description: "Managing your account settings and preferences",
    faqs: [
      {
        question: "How do I change my password?",
        answer: "You can change your password in the 'Settings' section of your profile. Look for the 'Security' tab to update your password."
      },
      {
        question: "Can I change my username or email address?",
        answer: "Yes, you can change both your username and email address in the 'Settings' section of your profile. Note that changing your email will require verification."
      },
      {
        question: "How do I delete my account?",
        answer: "To delete your account, go to 'Settings' and scroll to the bottom where you'll find the account deletion option. Please note that this action is permanent and cannot be undone."
      },
      {
        question: "How do I become a seller?",
        answer: "To start selling, click on the 'Sell' button in the navigation bar. You'll need to complete your profile information and set up a payment account to receive funds."
      }
    ]
  },
  {
    id: "general",
    title: "General Help",
    icon: HelpCircle,
    description: "Common questions about using YouBuy",
    faqs: [
      {
        question: "How does YouBuy work?",
        answer: "YouBuy is a peer-to-peer marketplace where users can buy and sell items. Sellers list their products, and buyers can browse, message sellers, and make purchases securely through our platform."
      },
      {
        question: "Is there a mobile app?",
        answer: "Currently, YouBuy is available as a web application optimized for both desktop and mobile browsers. A dedicated mobile app is under development."
      },
      {
        question: "How do I contact another user?",
        answer: "You can contact other users by clicking the 'Message' button on their profile or product listings. All communication happens through our secure messaging system."
      },
      {
        question: "Are there any fees for using YouBuy?",
        answer: "Basic buying and browsing is free. Sellers pay a small commission on each sale, with reduced fees for YouBuy Premium members."
      }
    ]
  },
  {
    id: "premium",
    title: "YouBuy Premium",
    icon: Star,
    description: "Features and benefits of YouBuy Premium subscription",
    faqs: [
      {
        question: "What is YouBuy Premium?",
        answer: "YouBuy Premium is our subscription service that offers benefits like reduced selling fees, featured listings, advanced analytics, and priority customer support."
      },
      {
        question: "How much does Premium cost?",
        answer: "YouBuy Premium is available for $9.99/month or $99/year (saving you over 17% compared to monthly billing)."
      },
      {
        question: "Can I cancel my Premium subscription?",
        answer: "Yes, you can cancel your Premium subscription at any time from the 'Premium' section in your profile settings. Your benefits will continue until the end of your current billing period."
      },
      {
        question: "What's the difference between regular and Premium?",
        answer: "Premium members enjoy lower selling fees (3% vs 5%), priority placement in search results, enhanced analytics, dedicated support, and the ability to promote more listings at once."
      }
    ]
  }
];

export function ProfileHelp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [contactFormOpen, setContactFormOpen] = useState(false);
  
  // Filter FAQs based on search query
  const filteredCategories = supportCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    activeCategory === "all" || category.id === activeCategory
  );
  
  // Count total matching FAQs across all categories
  const totalResults = filteredCategories.reduce(
    (total, category) => total + category.faqs.length, 
    0
  );

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions or contact our support team
        </p>
      </div>
      
      {/* Search and Contact */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full"
          />
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {totalResults} results for "{searchQuery}"
            </p>
          )}
        </div>
        <Dialog open={contactFormOpen} onOpenChange={setContactFormOpen}>
          <DialogTrigger asChild>
            <Button className="whitespace-nowrap">
              <MessageCircle className="h-4 w-4 mr-2" /> Contact Support
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Support</DialogTitle>
              <DialogDescription>
                Our team is here to help. Please fill out the form below and we'll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input id="subject" placeholder="What do you need help with?" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <textarea 
                  id="message" 
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Please describe your issue in detail..."
                ></textarea>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Preferred Contact Method</label>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" /> Phone
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setContactFormOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => {
                setContactFormOpen(false);
                // Here you would normally submit the form
                // For now we'll just show a toast via alert
                alert("Your message has been sent! Our team will contact you shortly.");
              }}>
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Tab Navigation and Content */}
      <Tabs defaultValue="all" onValueChange={setActiveCategory} value={activeCategory}>
        <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap justify-start">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          {supportCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
              {category.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {/* Category Cards for All Topics View */}
          {!searchQuery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportCategories.map(category => (
                <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow text-left">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center">
                      <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <category.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Show filtered results when searching
            <div className="space-y-8">
              {filteredCategories.map(category => (
                category.faqs.length > 0 && (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center mb-2">
                      <category.icon className="h-5 w-5 mr-2 text-primary" />
                      <h2 className="text-xl font-semibold">{category.title}</h2>
                    </div>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.id}-${index}`} className="border rounded-md px-4">
                          <AccordionTrigger className="py-4 text-left">{faq.question}</AccordionTrigger>
                          <AccordionContent className="pt-0 pb-4 text-muted-foreground text-left">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )
              ))}
              {totalResults === 0 && (
                <div className="text-center py-10">
                  <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any answers matching your search.
                  </p>
                  <Button
                    onClick={() => setContactFormOpen(true)}
                    variant="outline"
                  >
                    Contact Support
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Individual Category Views */}
        {supportCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="flex items-center mb-4">
              <category.icon className="h-6 w-6 mr-2 text-primary" />
              <h2 className="text-2xl font-bold">{category.title}</h2>
            </div>
            <p className="text-muted-foreground mb-6">{category.description}</p>
            
            <Accordion type="single" collapsible className="space-y-3">
              {category.faqs
                .filter(faq => 
                  !searchQuery || 
                  faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((faq, index) => (
                  <AccordionItem key={index} value={`${category.id}-${index}`} className="border rounded-md px-4">
                    <AccordionTrigger className="py-4 text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="pt-0 pb-4 text-muted-foreground text-left">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))
              }
            </Accordion>
            
            {category.faqs.filter(faq => 
              !searchQuery || 
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-10">
                <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any answers matching your search.
                </p>
                <Button
                  onClick={() => setContactFormOpen(true)}
                  variant="outline"
                >
                  Contact Support
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Contact Options */}
      <div className="mt-12 p-6 border rounded-lg bg-muted/30">
        <h2 className="text-xl font-semibold mb-4 text-left">Still need help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => setContactFormOpen(true)}>
            <Mail className="h-8 w-8 mb-2" />
            <span className="font-medium">Email Support</span>
            <span className="text-xs text-muted-foreground mt-1">Response within 24 hours</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
            <MessageCircle className="h-8 w-8 mb-2" />
            <span className="font-medium">Live Chat</span>
            <span className="text-xs text-muted-foreground mt-1">Available 9AM-6PM</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
            <Phone className="h-8 w-8 mb-2" />
            <span className="font-medium">Phone Support</span>
            <span className="text-xs text-muted-foreground mt-1">Premium members only</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
