import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ProductType } from "@/types/product";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface ReserveProductDialogProps {
  product: ProductType;
  isOpen: boolean;
  onClose: () => void;
  onReserved: () => void;
}

interface ChatUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  chat_id: string;
}

export function ReserveProductDialog({
  product,
  isOpen,
  onClose,
  onReserved
}: ReserveProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [reservationDays, setReservationDays] = useState<string>("7");
  const [isExternalReservation, setIsExternalReservation] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      fetchChatUsers();
    }
  }, [isOpen, product.id, user]);

  const fetchChatUsers = async () => {
    if (!user || !product.id) return;
    
    setIsLoading(true);
    try {
      // Fetch all chats for this product where the current user is the seller
      const { data: chats, error } = await supabase
        .from('chats')
        .select('id, buyer_id')
        .eq('product_id', product.id)
        .eq('seller_id', user.id);
      
      if (error) throw error;
      
      if (!chats || chats.length === 0) {
        setChatUsers([]);
        return;
      }
      
      // Get all buyer IDs
      const buyerIds = chats.map(chat => chat.buyer_id);
      
      // Now fetch the profiles for these buyers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', buyerIds);
        
      if (profilesError) throw profilesError;
      
      // Map the chats to a list of users with profile information
      const users: ChatUser[] = chats.map(chat => {
        const profile = profiles?.find(p => p.id === chat.buyer_id);
        return {
          id: chat.buyer_id,
          full_name: profile?.full_name || "Unknown User",
          avatar_url: profile?.avatar_url,
          chat_id: chat.id
        };
      });
      
      setChatUsers(users);
    } catch (error) {
      console.error("Error fetching chat users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load buyers. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserveProduct = async () => {
    if (!user || !product.id) return;
    
    if (!isExternalReservation && !selectedUserId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a buyer or choose external reservation.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Update the product status to reserved
      const { error: updateError } = await supabase
        .from('products')
        .update({
          product_status: 'reserved',
          reserved_user_id: isExternalReservation ? null : selectedUserId,
          reservation_days: reservationDays
        })
        .eq('id', product.id);
      
      if (updateError) throw updateError;
      
      // If this is for a specific user, send them a notification
      if (!isExternalReservation && selectedUserId) {
        // Find the chat ID for this user
        const chatUser = chatUsers.find(u => u.id === selectedUserId);
        
        // Create a notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: selectedUserId,
            type: 'product_reserved',
            title: "Product Reserved",
            description: `The item "${product.title}" has been reserved for you.`,
            read: false,
            related_id: product.id
          });
        
        if (notifError) console.error("Error creating notification:", notifError);
        
        // Send a message in the chat
        if (chatUser?.chat_id) {
          const { error: msgError } = await supabase
            .from('messages')
            .insert({
              chat_id: chatUser.chat_id,
              sender_id: user.id,
              receiver_id: selectedUserId,
              content: `I've reserved this item for you! It will be held for ${reservationDays} days.`,
              read: false,
              product_id: product.id
            });
          
          if (msgError) console.error("Error sending message:", msgError);
        }
      }
      
      toast({
        title: "Success",
        description: "Product has been marked as reserved.",
      });
      
      onReserved();
      onClose();
    } catch (error) {
      console.error("Error reserving product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reserve product. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reserve Product</DialogTitle>
          <DialogDescription>
            Reserve this product for a specific buyer or mark it as reserved outside the platform.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src={product.image_urls?.[0] || '/placeholder.svg'} 
              alt={product.title} 
              className="w-16 h-16 rounded-md object-cover"
            />
            <div>
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-sm text-muted-foreground">Make this product reserved</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="external-reservation" 
              checked={isExternalReservation}
              onCheckedChange={(checked) => {
                setIsExternalReservation(checked as boolean);
                if (checked) setSelectedUserId("");
              }}
            />
            <label
              htmlFor="external-reservation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Reserved outside the platform
            </label>
          </div>
          
          {!isExternalReservation && (
            <div className="space-y-2">
              <Label htmlFor="buyer">Reserve for</Label>
              <Select
                disabled={isLoading || chatUsers.length === 0}
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="buyer">
                  <SelectValue placeholder="Select a buyer" />
                </SelectTrigger>
                <SelectContent>
                  {chatUsers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No buyers available
                    </SelectItem>
                  ) : (
                    chatUsers.map((chatUser) => (
                      <SelectItem key={chatUser.id} value={chatUser.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={chatUser.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(chatUser.full_name)}</AvatarFallback>
                          </Avatar>
                          <span>{chatUser.full_name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {chatUsers.length === 0 && !isLoading && (
                <p className="text-xs text-muted-foreground">
                  No buyers have messaged you about this product yet.
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="days">Reserve for (days)</Label>
            <Input
              id="days"
              type="number"
              min="1"
              max="30"
              value={reservationDays}
              onChange={(e) => setReservationDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The item will be reserved for this many days before returning to available status.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleReserveProduct} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reserving...
              </>
            ) : (
              "Reserve Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 