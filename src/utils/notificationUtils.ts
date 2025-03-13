
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type NotificationType = "message" | "alert" | "system";

/**
 * Create a new notification for a user
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  description: string,
  relatedId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        description,
        read: false,
        related_id: relatedId
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
};

/**
 * Create a message notification
 */
export const createMessageNotification = async (
  userId: string,
  senderName: string,
  messageContent: string,
  productTitle: string,
  chatId: string
) => {
  return createNotification(
    userId,
    "message",
    `New message from ${senderName}`,
    `${messageContent}\n\nRegarding: ${productTitle}`,
    chatId
  );
};

/**
 * Create a system notification
 */
export const createSystemNotification = async (
  userId: string,
  title: string,
  description: string
) => {
  return createNotification(
    userId,
    "system",
    title,
    description
  );
};

/**
 * Create a price alert notification
 */
export const createPriceAlertNotification = async (
  userId: string,
  productTitle: string,
  oldPrice: number,
  newPrice: number,
  productId: string
) => {
  const percentageDrop = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  
  return createNotification(
    userId,
    "alert",
    `Price drop alert: ${productTitle}`,
    `The price has dropped by ${percentageDrop}% from $${oldPrice.toFixed(2)} to $${newPrice.toFixed(2)}.`,
    productId
  );
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};
