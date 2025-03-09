
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bell, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const notifications = [
  {
    id: "1",
    type: "message",
    title: "New message from Sarah",
    description: "I'm interested in your iPhone. Is it still available?",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "alert",
    title: "Price drop alert",
    description: "A product on your wishlist has dropped in price by 15%",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "3",
    type: "system",
    title: "Welcome to YouBuy!",
    description: "Thanks for joining our marketplace. Start buying and selling today!",
    time: "2 days ago",
    read: true,
  },
];

const NotificationItem = ({ notification }: { notification: typeof notifications[0] }) => {
  return (
    <div className={`p-4 hover:bg-muted/50 ${!notification.read ? 'bg-youbuy-muted' : ''}`}>
      <div className="flex">
        <div className="mr-4">
          {notification.type === "message" ? (
            <MessageSquare className="h-6 w-6 text-youbuy" />
          ) : notification.type === "alert" ? (
            <Bell className="h-6 w-6 text-youbuy" />
          ) : (
            <AlertCircle className="h-6 w-6 text-youbuy" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-muted-foreground">{notification.time}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
