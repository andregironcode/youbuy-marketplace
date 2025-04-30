import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface MessageListProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function MessageList({ selectedChatId, onSelectChat }: MessageListProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { chats, loadingChats } = useMessages();
  const [activeTab, setActiveTab] = useState("all");

  // Filter chats based on search term and active tab
  const filteredChats = chats
    .filter(chat => {
      const matchesSearch = chat.other_user.full_name.toLowerCase().includes(searchTerm.toLowerCase());

      if (activeTab === "all") return matchesSearch;
      if (activeTab === "unread") return matchesSearch && (chat.unread_count > 0);
      if (activeTab === "selling") return matchesSearch && (chat.seller_id === user?.id);
      if (activeTab === "buying") return matchesSearch && (chat.buyer_id === user?.id);

      return matchesSearch;
    });

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format message preview (handle image messages)
  const formatMessagePreview = (content: string) => {
    if (content.startsWith("image:")) {
      return "📷 Photo";
    }
    return content;
  };

  // Get product status badge
  const getProductStatusBadge = (status: string) => {
    switch (status) {
      case "sold":
        return <Badge variant="destructive" className="text-xs">Sold</Badge>;
      case "reserved":
        return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Reserved</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9 rounded-full bg-muted/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
            <TabsTrigger value="selling" className="text-xs">Selling</TabsTrigger>
            <TabsTrigger value="buying" className="text-xs">Buying</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingChats ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredChats.length > 0 ? (
          <div className="divide-y">
            {filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedChatId === chat.id ? "bg-primary/5 hover:bg-primary/10" : ""
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={chat.other_user.avatar_url || undefined} alt={chat.other_user.full_name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(chat.other_user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    {chat.unread_count > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                        {chat.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{chat.other_user.full_name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {chat.last_message?.created_at && formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      <p className={`text-sm truncate ${
                        chat.last_message && !chat.last_message.read && chat.seller_id === user?.id 
                          ? "font-semibold" 
                          : "text-muted-foreground"
                      }`}>
                        {chat.last_message ? formatMessagePreview(chat.last_message.content) : "No messages yet"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={chat.product.image_urls?.[0] || '/placeholder-product.jpg'} 
                            alt={chat.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {chat.product.title}
                        </span>
                      </div>
                      {getProductStatusBadge(chat.product.product_status)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium mb-1">No conversations found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm 
                ? "Try a different search term" 
                : "Start messaging sellers about products you're interested in"}
            </p>
            <Button size="sm" variant="outline" onClick={() => setSearchTerm("")}>
              {searchTerm ? "Clear search" : "Browse products"}
            </Button>
          </div>
        )}
      </div>

      <TooltipProvider>
        <div className="p-3 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Message a seller from a product page</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

// Message icon component
function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
