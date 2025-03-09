
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Share2, 
  MapPin, 
  MessageCircle, 
  ChevronLeft, 
  AlertCircle,
  Tag
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { Card, CardContent } from "@/components/ui/card";
import { ProductFields } from "@/components/product/ProductFields";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const product = products.find(p => p.id === id);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { isFavorite, toggleFavorite, isAdding, isRemoving } = useFavorites();
  
  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to message the seller",
      });
      return;
    }
    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !product) return;
    
    setIsSending(true);
    
    try {
      const sellerId = product.seller.userId;
      
      // Check if chat already exists
      const { data: existingChats, error: chatQueryError } = await supabase
        .from('chats')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId);
      
      if (chatQueryError) throw chatQueryError;
      
      let chatId;
      
      // If chat doesn't exist, create one
      if (!existingChats || existingChats.length === 0) {
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            product_id: product.id,
            seller_id: sellerId,
            buyer_id: user.id
          })
          .select('id')
          .single();
          
        if (chatError) throw chatError;
        chatId = newChat.id;
      } else {
        chatId = existingChats[0].id;
      }
      
      // Insert message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: sellerId,
          product_id: product.id,
          content: message,
        });
        
      if (msgError) throw msgError;
      
      // Update last_message_at in chat
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);
      
      toast({
        title: "Message sent!",
        description: "The seller will be notified of your message."
      });
      
      setMessage("");
      setIsMessageDialogOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-youbuy mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Determine if we should render the specific fields based on the product category
  const renderProductSpecificFields = () => {
    return (
      <div className="mt-6">
        <h2 className="font-medium mb-4">Product Specifications</h2>
        <div className="grid grid-cols-2 gap-4">
          {product.category === "electronics" && (
            <>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-medium">Samsung</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-medium">{product.title.split(' ')[0]} {product.title.split(' ')[1]}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="font-medium">{product.isNew ? 'New (never used)' : 'Excellent'}</p>
              </div>
              {product.title.includes("iPhone") && (
                <>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="font-medium">{product.title.includes("256GB") ? "256GB" : 
                      product.title.includes("512GB") ? "512GB" : "128GB"}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">Sierra Blue</p>
                  </div>
                </>
              )}
              {product.title.includes("MacBook") && (
                <>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">RAM</p>
                    <p className="font-medium">16GB</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="font-medium">512GB SSD</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Processor</p>
                    <p className="font-medium">M1 Pro</p>
                  </div>
                </>
              )}
              {product.title.includes("Canon") && (
                <>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Megapixels</p>
                    <p className="font-medium">45MP</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Lens</p>
                    <p className="font-medium">24-70mm f/2.8 L</p>
                  </div>
                </>
              )}
              {product.title.includes("PlayStation") && (
                <>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Edition</p>
                    <p className="font-medium">Digital Edition</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Includes</p>
                    <p className="font-medium">1 Controller, HDMI Cable, Power Cable</p>
                  </div>
                </>
              )}
              {product.title.includes("TV") && (
                <>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Screen Size</p>
                    <p className="font-medium">55 inches</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Resolution</p>
                    <p className="font-medium">4K Ultra HD</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Smart Features</p>
                    <p className="font-medium">Full Smart TV</p>
                  </div>
                </>
              )}
            </>
          )}
          
          {product.category === "furniture" && (
            <>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Material</p>
                <p className="font-medium">Wood</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="font-medium">{product.isNew ? 'New (never used)' : 'Good'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Dimensions</p>
                <p className="font-medium">
                  {product.title.includes("MALM") ? "140cm x 65cm x 75cm" : "180cm x 90cm x 45cm"}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">
                  {product.title.includes("White") ? "White" : product.title.includes("Black") ? "Black" : "Oak"}
                </p>
              </div>
            </>
          )}
          
          {product.category === "clothing" && (
            <>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-medium">
                  {product.title.includes("Nike") ? "Nike" : 
                   product.title.includes("Adidas") ? "Adidas" : "Unbranded"}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">
                  {product.title.includes("43") ? "EU 43 / US 9.5" : 
                   product.title.includes("42") ? "EU 42 / US 9" : "M"}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="font-medium">{product.isNew ? 'New with tags' : 'Like new'}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">
                  {product.title.includes("Blue") ? "University Blue" : 
                   product.title.includes("Red") ? "Red" : "Black"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-6">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Image */}
          <div className="lg:col-span-7">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full object-cover aspect-square sm:aspect-[4/3]"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">{product.title}</h1>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => toggleFavorite(product.id)}
                      disabled={isAdding || isRemoving}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-youbuy text-youbuy' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <p className="text-3xl font-bold text-youbuy">AED {product.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{product.location}</span>
                <span className="mx-2">•</span>
                <span>{product.timeAgo}</span>
                {product.isNew && (
                  <>
                    <span className="mx-2">•</span>
                    <Badge className="bg-youbuy">New</Badge>
                  </>
                )}
              </div>

              <Card className="border-dashed border-youbuy/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-youbuy" />
                    <span className="font-medium text-youbuy-dark">
                      Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              <div>
                <h2 className="font-medium mb-2">Description</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              
              {renderProductSpecificFields()}

              <Separator />

              <div>
                <h2 className="font-medium mb-4">Seller</h2>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={product.seller.avatar} alt={product.seller.name} />
                    <AvatarFallback>{product.seller.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{product.seller.name}</p>
                    <p className="text-sm text-muted-foreground">Member since {product.seller.joinedDate}</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-youbuy hover:bg-youbuy-dark"
                onClick={handleContactSeller}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact Seller
              </Button>

              <div className="text-sm text-muted-foreground">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                If you suspect this ad is a scam, please report it.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message about: {product.title}</DialogTitle>
            <DialogDescription>
              Send a message to the seller about this item
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-4 mb-4">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="font-medium">{product.title}</p>
              <p className="text-youbuy font-bold">AED {product.price.toFixed(2)}</p>
            </div>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              className="bg-youbuy hover:bg-youbuy-dark"
            >
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
