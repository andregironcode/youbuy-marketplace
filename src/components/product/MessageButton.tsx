
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductType } from "@/types/product";

interface MessageButtonProps {
  product: ProductType;
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export const MessageButton = ({ product, size = "md", fullWidth = false }: MessageButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
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
      setIsOpen(false);
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
        variant="outline"
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
