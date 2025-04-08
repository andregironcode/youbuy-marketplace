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
import { useCurrency } from "@/context/CurrencyContext";

interface MessageButtonProps {
  product: ProductType;
  size?: "sm" | "md";
  fullWidth?: boolean;
  id?: string;
  variant?: "outline" | "link" | "default" | "destructive" | "secondary" | "ghost" | "success"; 
}

export const MessageButton = ({ product, size = "md", fullWidth = false, id, variant = "outline" }: MessageButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
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
      // Check if a chat already exists between these users for this product
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', product.seller.id)
        .maybeSingle();
      
      let chatId = existingChat?.id;
      
      // If no chat exists, create one
      if (!chatId) {
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            product_id: product.id,
            buyer_id: user.id,
            seller_id: product.seller.id,
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (chatError) throw chatError;
        chatId = newChat.id;
      }
      
      // Send the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          content: message,
          sender_id: user.id,
          receiver_id: product.seller.id,
          product_id: product.id,
          read: false
        });
      
      if (messageError) throw messageError;
      
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

  return (
    <>
      <Button
        id={id}
        variant={variant}
        className={`${fullWidth ? 'w-full' : ''}`}
        onClick={handleClick}
      >
        <MessageCircle className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
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
              src={product.image_urls?.[0] || '/placeholder-product.jpg'} 
              alt={product.title} 
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="font-medium">{product.title}</p>
              <p className="text-price font-bold">AED {formatCurrency(product.price)}</p>
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
              variant="success"
            >
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
