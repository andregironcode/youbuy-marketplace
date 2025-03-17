
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, RefreshCw, AlertCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type SupportTicket = {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
};

type TicketReply = {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

export const UserTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch user tickets
  const fetchTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        variant: "destructive",
        title: "Failed to load tickets",
        description: "There was a problem loading your support tickets."
      });
    } finally {
      setLoading(false);
    }
  };

  // Get ticket replies
  const fetchTicketReplies = async (ticketId: string) => {
    setReplyLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setTicketReplies(data || []);
    } catch (error) {
      console.error("Error fetching ticket replies:", error);
      toast({
        variant: "destructive",
        title: "Failed to load replies",
        description: "There was an error loading the conversation."
      });
    } finally {
      setReplyLoading(false);
    }
  };

  // Handle ticket click
  const handleTicketClick = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
    await fetchTicketReplies(ticket.id);
  };

  // Add reply to ticket
  const handleAddReply = async () => {
    if (!user || !selectedTicket || !replyMessage.trim()) return;
    
    setReplyLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_replies')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: replyMessage,
          is_admin: false
        });
        
      if (error) throw error;
      
      setReplyMessage("");
      await fetchTicketReplies(selectedTicket.id);
      
      toast({
        title: "Reply sent",
        description: "Your message has been added to the ticket."
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        variant: "destructive",
        title: "Failed to send reply",
        description: "There was an error sending your message."
      });
    } finally {
      setReplyLoading(false);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Load tickets on component mount
  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>You need to be logged in to view your support tickets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Support Tickets</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchTickets} 
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium">No tickets yet</h3>
          <p className="text-muted-foreground max-w-md mt-1">
            When you create support tickets, they will appear here. Use the form above to create your first ticket.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <Card 
              key={ticket.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTicketClick(ticket)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  {getStatusBadge(ticket.status)}
                </div>
                <CardDescription className="flex items-center text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(ticket.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-3">{ticket.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-1">
                {getPriorityBadge(ticket.priority)}
                <Button variant="ghost" size="sm">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedTicket?.title}</span>
              {selectedTicket && getStatusBadge(selectedTicket.status)}
            </DialogTitle>
            <DialogDescription className="flex justify-between">
              <span>Created on {selectedTicket && formatDate(selectedTicket.created_at)}</span>
              <span>Priority: {selectedTicket?.priority}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto my-2">
            {/* Original ticket */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <h4 className="font-medium text-sm mb-1">Original Request</h4>
              <p className="text-sm whitespace-pre-wrap">{selectedTicket?.description}</p>
            </div>
            
            {/* Replies */}
            <div className="space-y-3">
              {replyLoading && ticketReplies.length === 0 ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : ticketReplies.length > 0 ? (
                <>
                  <h4 className="font-medium text-sm">Conversation</h4>
                  {ticketReplies.map(reply => (
                    <div 
                      key={reply.id} 
                      className={`flex ${reply.is_admin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          reply.is_admin 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'bg-green-100 text-green-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                          <span>{reply.is_admin ? 'Support Team' : 'You'}</span>
                          <span>{formatDate(reply.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No replies yet. If your ticket is still open, our team will respond soon.
                </div>
              )}
            </div>
          </div>
          
          {/* Reply form - only show if ticket is not closed */}
          {selectedTicket && selectedTicket.status !== 'closed' && (
            <div className="mt-3 border-t pt-3">
              <Textarea
                placeholder="Type your reply here..."
                className="resize-none"
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleAddReply} 
                  disabled={!replyMessage.trim() || replyLoading}
                >
                  {replyLoading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          )}
          
          {selectedTicket && selectedTicket.status === 'closed' && (
            <div className="flex items-center justify-center gap-2 text-sm mt-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>This ticket is closed and cannot be replied to</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
