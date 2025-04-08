import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NotificationData } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';

// Adjust the interface to match the database schema
interface DatabaseNotification {
  id: string;
  created_at: string;
  user_id: string;
  type: string;
  title: string;
  description: string;  // Database uses 'description' instead of 'message'
  read: boolean;
  related_id?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Convert database notification format to our app format
  const convertToNotificationData = (dbNotification: DatabaseNotification): NotificationData => {
    return {
      id: dbNotification.id,
      created_at: dbNotification.created_at,
      user_id: dbNotification.user_id,
      type: dbNotification.type as NotificationData['type'],
      title: dbNotification.title,
      message: dbNotification.description,  // Map description to message
      read: dbNotification.read,
      action_url: dbNotification.action_url,
      metadata: dbNotification.metadata
    };
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert database format to app format
      const notificationsData = (data as DatabaseNotification[]).map(convertToNotificationData);
      setNotifications(notificationsData);
      
      // Count unread notifications
      const unread = notificationsData.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification.',
        variant: 'destructive',
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      toast({
        title: 'Success',
        description: 'All notifications marked as read.',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notifications.',
        variant: 'destructive',
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );

      // Update unread count if necessary
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast({
        title: 'Success',
        description: 'Notification deleted.',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive',
      });
    }
  };

  // Set up real-time updates for notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to notifications table changes
    const channel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification change received:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  };
}; 