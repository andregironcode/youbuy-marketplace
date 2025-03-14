
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, Bell, PlusCircle, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UnreadBadge } from "@/components/messages/UnreadBadge";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/search/SearchBar";
import { useLocation } from "react-router-dom";

export const Navbar = () => {
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleCategories = () => {
    // Dispatch a custom event that all pages can listen for
    const event = new CustomEvent('toggleCategories');
    window.dispatchEvent(event);
    
    // Log to verify the event is being dispatched
    console.log('Categories toggle event dispatched from Navbar');
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotificationCount(0);
      return;
    }

    const fetchUnreadCounts = async () => {
      try {
        // Fetch unread messages
        const { count: messageCount, error: messageError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false);
        
        if (messageError) throw messageError;
        setUnreadCount(messageCount || 0);
        
        // Fetch unread notifications
        const { count: notifCount, error: notifError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);
        
        if (notifError) throw notifError;
        setNotificationCount(notifCount || 0);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    fetchUnreadCounts();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        fetchUnreadCounts();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        fetchUnreadCounts();
      })
      .subscribe();
      
    // Subscribe to new notifications
    const notificationsChannel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadCounts();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-2 md:mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-youbuy" />
            <span className="font-bold text-xl hidden sm:inline-block">YouBuy</span>
          </Link>
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          className="mr-1 md:mr-2 whitespace-nowrap"
          onClick={toggleCategories}
        >
          <Menu className="h-4 w-4 mr-1" />
          <span className="text-xs md:text-sm">Categories</span>
        </Button>

        <div className="flex-1 mx-1 md:mx-2">
          <SearchBar />
        </div>

        <div className="flex items-center justify-end space-x-1 md:space-x-2">
          {isMobile ? (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleMobileMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-5 w-5" />
                  <UnreadBadge count={notificationCount} />
                </Button>
              </Link>
              {user ? (
                <div className="flex items-center gap-1">
                  <Link to="/messages">
                    <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Messages">
                      <MessageCircle className="h-5 w-5" />
                      <UnreadBadge count={unreadCount} />
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Link>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/sell">
                <Button className="bg-youbuy hover:bg-youbuy-dark h-9 text-sm">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Sell
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {isMobile && showMobileMenu && (
        <div className="container py-4 border-t">
          <nav className="flex flex-col space-y-3">
            <Link to="/sell" className="py-2 px-3 hover:bg-muted rounded-md">
              Sell an item
            </Link>
            <Link to="/notifications" className="py-2 px-3 hover:bg-muted rounded-md flex justify-between items-center">
              Notifications
              {notificationCount > 0 && (
                <Badge className="bg-youbuy">{notificationCount}</Badge>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/messages" className="py-2 px-3 hover:bg-muted rounded-md flex justify-between items-center">
                  Messages
                  {unreadCount > 0 && (
                    <Badge className="bg-youbuy">{unreadCount}</Badge>
                  )}
                </Link>
                <Link to="/profile" className="py-2 px-3 hover:bg-muted rounded-md">
                  Profile
                </Link>
                <button 
                  onClick={signOut}
                  className="flex items-center py-2 px-3 hover:bg-muted rounded-md text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" className="py-2 px-3 hover:bg-muted rounded-md">
                Sign in / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
