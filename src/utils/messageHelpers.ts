
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ChatType, MessageType } from "@/types/message";
import { products } from "@/data/products";
import { createMessageNotification } from "./notificationUtils";

/**
 * Fetch product information by product ID
 */
export const fetchProductInfo = async (productId: string) => {
  try {
    // First try to get from database
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      return {
        id: data.id,
        title: data.title,
        price: parseFloat(data.price),
        image: data.image_urls?.[0] || '/placeholder.svg',
      };
    }
    
    // Fallback to local data if not found in database
    const localProduct = products.find(p => p.id === productId);
    if (localProduct) {
      return {
        id: localProduct.id,
        title: localProduct.title,
        price: localProduct.price,
        image: localProduct.image,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching product info:", error);
    return null;
  }
};

/**
 * Marks messages as read for a specific chat and user
 */
export const markMessagesAsRead = async (userId: string, productId: string) => {
  try {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', userId)
      .eq('product_id', productId)
      .eq('read', false);
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

/**
 * Delete a message by ID
 */
export const deleteMessage = async (messageId: string, userId: string) => {
  try {
    // First check if the message belongs to the current user
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .maybeSingle();
    
    if (messageError) throw messageError;
    
    if (!messageData) {
      toast({
        title: "Message not found",
        description: "The message no longer exists."
      });
      return false;
    }
    
    // Verify that the current user is the sender
    if (messageData.sender_id !== userId) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own messages."
      });
      return false;
    }
    
    // Delete the message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
      
    if (deleteError) throw deleteError;
    
    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    toast({
      title: "Failed to delete message",
      description: "Please try again later."
    });
    return false;
  }
};

/**
 * Send a text message
 */
export const sendTextMessage = async (
  userId: string, 
  receiverId: string, 
  productId: string,
  chatId: string,
  content: string
) => {
  try {
    // Insert message
    const { data: messageData, error: msgError } = await supabase
      .from('messages')
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        product_id: productId,
        content,
      })
      .select()
      .single();
      
    if (msgError) throw msgError;
    
    // Update last_message_at in chat
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId);
    
    // Create notification for the receiver
    // Get sender name
    const { data: senderData } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', userId)
      .single();
    
    // Get product info
    const productInfo = await fetchProductInfo(productId);
    
    if (senderData && productInfo) {
      const senderName = senderData.full_name || senderData.username || "Someone";
      await createMessageNotification(
        receiverId,
        senderName,
        content,
        productInfo.title,
        chatId
      );
    }
    
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    toast({
      title: "Failed to send message",
      description: "Please try again later."
    });
    return false;
  }
};

/**
 * Get chat unread count
 */
export const getChatUnreadCount = async (userId: string, productId: string) => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false)
      .eq('product_id', productId);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};
