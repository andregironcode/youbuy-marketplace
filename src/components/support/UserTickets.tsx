
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  full_name: string;
  avatar_url: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  profile: Profile;
}

export const UserTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserTickets();
    }
  }, [user]);

  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        throw error;
      }

      console.log("Fetched tickets:", data);
      setTickets(data || []);
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load your support tickets: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketReplies = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching replies:", error);
        throw error;
      }

      console.log("Fetched replies:", data);

      // Transform the data to match our TicketReply type
      const transformedData = data.map((reply: any) => ({
        ...reply,
        profile: reply.profile || { full_name: "Unknown User", avatar_url: "" }
      })) as TicketReply[];

      setReplies(transformedData);
    } catch (error: any) {
      console.error("Error fetching replies:", error);
      toast({
        title: "Error",
        description: "Failed to load ticket replies: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !newReply.trim() || !user) return;

    try {
      const newReplyData = {
        ticket_id: selectedTicket.id,
        user_id: user.id,
        message: newReply,
        is_admin: false,
      };

      const { error } = await supabase
        .from("ticket_replies")
        .insert(newReplyData);

      if (error) throw error;

      // Refresh the replies
      fetchTicketReplies(selectedTicket.id);
      setNewReply("");

      toast({
        title: "Reply sent",
        description: "Your message has been sent successfully",
      });
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send your reply: " + error.message,
        variant: "destructive",
      });
    }
  };

  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchTicketReplies(ticket.id);
  };

  const getStatusBadge = (status: string) => {
    let color;
    switch (status) {
      case "open":
        color = "bg-blue-500";
        break;
      case "in_progress":
        color = "bg-yellow-500";
        break;
      case "resolved":
        color = "bg-green-500";
        break;
      case "closed":
        color = "bg-gray-500";
        break;
      default:
        color = "bg-gray-500";
    }

    return (
      <Badge className={`${color} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    let color;
    switch (priority) {
      case "low":
        color = "bg-green-500";
        break;
      case "medium":
        color = "bg-blue-500";
        break;
      case "high":
        color = "bg-orange-500";
        break;
      case "urgent":
        color = "bg-red-500";
        break;
      default:
        color = "bg-gray-500";
    }

    return (
      <Badge className={`${color} text-white`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="py-8 text-center">Loading your tickets...</div>;
  }

  return (
    <div className="space-y-6">
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No support tickets found</h3>
            <p className="text-sm text-gray-500 mt-2">
              You haven't created any support tickets yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Tickets</CardTitle>
                <CardDescription>View and manage your support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedTicket?.id === ticket.id ? "border-blue-500 bg-blue-50" : ""
                      }`}
                      onClick={() => selectTicket(ticket)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium truncate">{ticket.title}</h3>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            {selectedTicket ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedTicket.title}</CardTitle>
                  <div className="flex space-x-2 mt-2">
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                    <span className="text-sm text-gray-500">
                      Created {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-md mb-6">
                    <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`flex ${!reply.is_admin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            !reply.is_admin
                              ? "bg-blue-100 text-blue-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.profile.avatar_url} />
                              <AvatarFallback>
                                {reply.profile.full_name ? reply.profile.full_name.charAt(0) : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {reply.profile.full_name || "User"} {reply.is_admin && "(Support Team)"}
                            </span>
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {(selectedTicket.status === "open" || selectedTicket.status === "in_progress") && (
                    <div className="mt-4">
                      <Textarea
                        placeholder="Type your reply here..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        rows={3}
                        className="mb-2"
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!newReply.trim()}
                        className="w-full"
                      >
                        Send Reply
                      </Button>
                    </div>
                  )}
                  
                  {(selectedTicket.status === "resolved" || selectedTicket.status === "closed") && (
                    <div className="bg-gray-100 p-4 rounded-md text-center">
                      <p className="text-gray-500">
                        This ticket is {selectedTicket.status}. You cannot respond to it anymore.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No ticket selected</h3>
                  <p className="text-gray-500 mt-1">
                    Select a ticket from the list to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
