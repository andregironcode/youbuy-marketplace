
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/product";
import { useNavigate } from "react-router-dom";

interface MessageButtonProps {
  product: ProductType;
  size?: "sm" | "md";
  fullWidth?: boolean;
  id?: string;
  variant?: "outline" | "link" | "default" | "destructive" | "secondary" | "ghost"; // Fixed variant type
}

export const MessageButton = ({ product, size = "md", fullWidth = false, id, variant = "outline" }: MessageButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product detail
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to message the seller",
      });
      return;
    }
    setIsOpen(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    
    setIsSending(true);
    
    try {
      // Get the seller ID - check all possible places it could be
      let sellerId;
      
      // Check the different possible locations of the seller ID based on your data structure
      if (product.seller?.userId) {
        sellerId = product.seller.userId;
      } else if (product.seller?.id) {
        sellerId = product.seller.id;
      }
      
      // Log for debugging
      console.log("Product data:", product);
      console.log("Seller ID found:", sellerId);
      
      if (!sellerId) {
        throw new Error("Could not find seller information. Please try again later.");
      }
      
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
            buyer_id: user.id,
            last_message_at: new Date().toISOString()
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
      setIsOpen(false);
      
      // Navigate to the chat
      navigate(`/messages/${chatId}`);
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

  const buttonClass = size === "sm" 
    ? "h-8 text-xs px-2 py-1" 
    : "h-10 text-sm px-4 py-2";

  return (
    <>
      <Button
        id={id}
        variant={variant}
        className={`${buttonClass} ${fullWidth ? 'w-full' : ''}`}
        onClick={handleClick}
      >
        <MessageCircle className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
        Message
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message about: {product.title}</DialogTitle>
            <DialogDescription>
              Send a message to the seller about this item.
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>
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
    </>
  );
};
