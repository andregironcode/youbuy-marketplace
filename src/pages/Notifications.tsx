
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bell, AlertCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { markNotificationAsRead, deleteNotification } from "@/utils/notificationUtils";

// Define the notification type
interface NotificationType {
  id: string;
  type: "message" | "alert" | "system";
  title: string;
  description: string;
  time: string;
  created_at: string;
  read: boolean;
  user_id: string;
  related_id?: string;
}

const NotificationItem = ({ 
  notification, 
  onRead, 
  onDelete 
}: { 
  notification: NotificationType; 
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div 
      className={`p-4 hover:bg-muted/50 ${!notification.read ? 'bg-muted/30' : ''}`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className="flex">
        <div className="mr-4">
          {notification.type === "message" ? (
            <MessageSquare className="h-6 w-6 text-blue-500" />
          ) : notification.type === "alert" ? (
            <Bell className="h-6 w-6 text-amber-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-green-500" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h3>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground mr-2">{notification.time}</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this notification? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(notification.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
        </div>
      </div>
    </div>
  );
};

const formatNotificationTime = (createdAt: string): string => {
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const diffMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffMinutes < 10080) {
    const days = Math.floor(diffMinutes / 1440);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return notificationDate.toLocaleDateString();
  }
};

const NotificationsLoading = () => {
  return (
    <div className="divide-y">
      {[1, 2, 3].map((index) => (
        <div key={index} className="p-4">
          <div className="flex">
            <Skeleton className="h-6 w-6 rounded-full mr-4" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications = data.map(notification => ({
        ...notification,
        time: formatNotificationTime(notification.created_at)
      })) as NotificationType[];

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Failed to load notifications",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for new notifications
    if (user) {
      const channel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, payload => {
          const newNotification = {
            ...payload.new,
            time: formatNotificationTime(payload.new.created_at as string)
          } as NotificationType;
          
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: newNotification.title,
            description: newNotification.description.substring(0, 100)
          });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const success = await deleteNotification(notificationId);
    if (success) {
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );

      toast({
        title: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Failed to mark notifications as read",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                disabled={!notifications.some(n => !n.read)}
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <NotificationsLoading />
              ) : (
                <div className="divide-y">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                        onRead={handleMarkAsRead}
                        onDelete={handleDeleteNotification}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-1">No notifications yet</h3>
                      <p className="text-sm text-muted-foreground">
                        When you receive notifications, they'll appear here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
