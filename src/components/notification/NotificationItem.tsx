import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { NotificationData } from "@/types/notification";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Heart,
  Package,
  MessageSquare,
  Bell,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "product_purchased":
      case "product_sold":
        return <ShoppingBag className="h-5 w-5" />;
      case "product_favorited":
        return <Heart className="h-5 w-5" />;
      case "seller_new_product":
        return <Package className="h-5 w-5" />;
      case "message_received":
        return <MessageSquare className="h-5 w-5" />;
      case "product_reserved":
        return <ShoppingBag className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Get icon color based on notification type
  const getIconColor = () => {
    switch (notification.type) {
      case "product_purchased":
      case "product_sold":
        return "text-green-500";
      case "product_favorited":
        return "text-red-500";
      case "seller_new_product":
        return "text-blue-500";
      case "message_received":
        return "text-youbuy";
      case "product_reserved":
        return "text-amber-500";
      default:
        return "text-gray-500";
    }
  };

  // Navigate to the appropriate page based on notification type
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    } else if (notification.metadata?.product_id) {
      navigate(`/product/${notification.metadata.product_id}`);
    } else if (notification.metadata?.chat_id) {
      navigate(`/messages/${notification.metadata.chat_id}`);
    } else if (notification.metadata?.seller_id) {
      navigate(`/seller/${notification.metadata.seller_id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    onDelete(notification.id);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border-b cursor-pointer transition-colors hover:bg-muted/50",
        notification.read ? "bg-white" : "bg-blue-50",
        isDeleting && "opacity-50 pointer-events-none"
      )}
      onClick={handleClick}
    >
      <div className={cn("rounded-full p-2 bg-opacity-20", getIconColor(), "bg-current")}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("font-medium", !notification.read && "font-semibold")}>
            {notification.title}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
          {notification.message}
        </p>
        {notification.action_url && (
          <div className="flex items-center text-xs text-youbuy mt-1">
            <span>View details</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}; 