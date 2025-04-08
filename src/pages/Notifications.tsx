import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/notification/NotificationItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Check, Loader2 } from "lucide-react";
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

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread") {
      return !notification.read;
    }
    return true;
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-youbuy mb-4" />
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with activity on your account
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4" />
            <span>Mark all as read</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-destructive"
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                <span className="md:inline hidden">Clear all</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All notifications will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    notifications.forEach((notification) => {
                      deleteNotification(notification.id);
                    });
                  }}
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-1">
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-youbuy text-white text-xs">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {filteredNotifications.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No notifications</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                You don't have any notifications yet. We'll notify you about important updates and activity related to your account.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          {filteredNotifications.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Check className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">All caught up!</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                You have no unread notifications. Any new notifications will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
