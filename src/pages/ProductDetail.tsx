
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
  AlertCircle 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const product = products.find(p => p.id === id);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite 
        ? "This item has been removed from your favorites" 
        : "This item has been added to your favorites",
    });
  };

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
      // Check if chat already exists
      const { data: existingChats } = await supabase
        .from('chats')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', product.seller.userId)
        .single();
      
      let chatId = existingChats?.id;
      
      // If chat doesn't exist, create one
      if (!chatId) {
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            product_id: product.id,
            seller_id: product.seller.userId,
            buyer_id: user.id
          })
          .select('id')
          .single();
          
        if (chatError) throw chatError;
        chatId = newChat.id;
      }
      
      // Insert message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: product.seller.userId,
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
                      onClick={toggleFavorite}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-youbuy text-youbuy' : ''}`} />
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

              <Separator />

              <div>
                <h2 className="font-medium mb-2">Description</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

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
