import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, MessageSquare, Search, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Type definitions
interface Profile {
  full_name: string;
  avatar_url: string;
  email?: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_admin: string | null;
  created_at: string;
  updated_at: string;
  replies_count: number;
  profile: Profile;
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

export const AdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
        toast({
          title: "Error fetching tickets",
          description: ticketsError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const ticketsWithProfiles = await Promise.all(
        ticketsData.map(async (ticket) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", ticket.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile for ticket:", profileError);
            return {
              ...ticket,
              profile: { full_name: "Unknown User", avatar_url: "" },
              replies_count: 0,
            };
          }

          const { count, error: countError } = await supabase
            .from("ticket_replies")
            .select("*", { count: "exact", head: true })
            .eq("ticket_id", ticket.id);

          if (countError) {
            console.error("Error counting replies:", countError);
          }

          return {
            ...ticket,
            profile: profileData || { full_name: "Unknown User", avatar_url: "" },
            replies_count: count || 0,
          };
        })
      );

      console.log("Tickets with profiles:", ticketsWithProfiles);

      setTickets(ticketsWithProfiles);
      setFilteredTickets(ticketsWithProfiles);
    } catch (error) {
      console.error("Error in fetchTickets:", error);
      toast({
        title: "Error fetching tickets",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchTicketReplies = async (ticketId: string) => {
    try {
      const { data: repliesData, error: repliesError } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (repliesError) {
        console.error("Error fetching replies:", repliesError);
        toast({
          title: "Error fetching replies",
          description: repliesError.message,
          variant: "destructive",
        });
        return;
      }

      const repliesWithProfiles = await Promise.all(
        repliesData.map(async (reply) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", reply.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile for reply:", profileError);
            return {
              ...reply,
              profile: { full_name: reply.is_admin ? "Admin" : "Unknown User", avatar_url: "" },
            };
          }

          return {
            ...reply,
            profile: profileData || { full_name: reply.is_admin ? "Admin" : "Unknown User", avatar_url: "" },
          };
        })
      );

      console.log("Replies with profiles:", repliesWithProfiles);

      setReplies(repliesWithProfiles);
    } catch (error) {
      console.error("Error in fetchTicketReplies:", error);
      toast({
        title: "Error fetching replies",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;

    const validStatus = ["open", "in_progress", "resolved", "closed"].includes(newStatus);
    if (!validStatus) {
      toast({
        title: "Invalid status",
        description: "The selected status is not valid.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus as "open" | "in_progress" | "resolved" | "closed" })
        .eq("id", selectedTicket.id);

      if (error) {
        console.error("Error updating ticket status:", error);
        toast({
          title: "Error updating ticket",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSelectedTicket({ ...selectedTicket, status: newStatus as "open" | "in_progress" | "resolved" | "closed" });

      const updatedTickets = tickets.map((ticket) =>
        ticket.id === selectedTicket.id
          ? { ...ticket, status: newStatus as "open" | "in_progress" | "resolved" | "closed" }
          : ticket
      );

      setTickets(updatedTickets);
      setFilteredTickets(
        updatedTickets.filter((ticket) => 
          applyFilters(ticket, searchQuery, statusFilter, priorityFilter)
        )
      );

      toast({
        title: "Ticket updated",
        description: `Ticket status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!selectedTicket) return;

    const validPriority = ["low", "medium", "high", "urgent"].includes(newPriority);
    if (!validPriority) {
      toast({
        title: "Invalid priority",
        description: "The selected priority is not valid.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ priority: newPriority as "low" | "medium" | "high" | "urgent" })
        .eq("id", selectedTicket.id);

      if (error) {
        console.error("Error updating ticket priority:", error);
        toast({
          title: "Error updating ticket",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSelectedTicket({ ...selectedTicket, priority: newPriority as "low" | "medium" | "high" | "urgent" });

      const updatedTickets = tickets.map((ticket) =>
        ticket.id === selectedTicket.id
          ? { ...ticket, priority: newPriority as "low" | "medium" | "high" | "urgent" }
          : ticket
      );

      setTickets(updatedTickets);
      setFilteredTickets(
        updatedTickets.filter((ticket) => 
          applyFilters(ticket, searchQuery, statusFilter, priorityFilter)
        )
      );

      toast({
        title: "Ticket updated",
        description: `Ticket priority changed to ${newPriority}`,
      });
    } catch (error) {
      console.error("Error in handlePriorityChange:", error);
    }
  };

  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedTicket) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const newReplyData = {
        ticket_id: selectedTicket.id,
        user_id: userData.user.id,
        message: newReply,
        is_admin: true,
      };

      const { data: replyData, error: replyError } = await supabase
        .from("ticket_replies")
        .insert(newReplyData)
        .select()
        .single();

      if (replyError) {
        console.error("Error sending reply:", replyError);
        toast({
          title: "Error sending reply",
          description: replyError.message,
          variant: "destructive",
        });
        return;
      }

      if (selectedTicket.status === "open") {
        await handleStatusChange("in_progress");
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", replyData.user_id)
        .single();

      const newReplyWithProfile = {
        ...replyData,
        profile: profileData || { full_name: "Admin", avatar_url: "" }
      } as TicketReply;

      setReplies([...replies, newReplyWithProfile]);
      setNewReply("");

      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      });
    } catch (error) {
      console.error("Error in handleSendReply:", error);
      toast({
        title: "Error sending reply",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchTicketReplies(ticket.id);
  };

  const applyFilters = (
    ticket: SupportTicket,
    query: string,
    status: string,
    priority: string
  ) => {
    const matchesSearch =
      query === "" ||
      ticket.title.toLowerCase().includes(query.toLowerCase()) ||
      ticket.description.toLowerCase().includes(query.toLowerCase()) ||
      ticket.profile.full_name.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = status === "all" || ticket.status === status;

    const matchesPriority = priority === "all" || ticket.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredTickets(
      tickets.filter((ticket) => 
        applyFilters(ticket, query, statusFilter, priorityFilter)
      )
    );
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setFilteredTickets(
      tickets.filter((ticket) => 
        applyFilters(ticket, searchQuery, status, priorityFilter)
      )
    );
  };

  const handlePriorityFilter = (priority: string) => {
    setPriorityFilter(priority);
    setFilteredTickets(
      tickets.filter((ticket) => 
        applyFilters(ticket, searchQuery, statusFilter, priority)
      )
    );
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-blue-500";
      case "high":
        return "bg-orange-500";
      case "urgent":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge
        className={`${getStatusColor(status)} text-white`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge
        className={`${getPriorityColor(priority)} text-white`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Ticket List</CardTitle>
                <CardDescription>Manage support requests</CardDescription>

                <div className="mt-2 space-y-2">
                  <div className="flex items-center border rounded-md px-3 py-2">
                    <Search className="h-4 w-4 mr-2 text-gray-500" />
                    <Input 
                      placeholder="Search tickets..."
                      className="border-0 p-0 shadow-none focus-visible:ring-0"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading tickets...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="font-medium text-gray-900">No tickets found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {tickets.length > 0
                        ? "Try adjusting your search or filters"
                        : "There are no support tickets in the system yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-3 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedTicket?.id === ticket.id ? "border-blue-500 bg-blue-50" : ""
                        }`}
                        onClick={() => handleSelectTicket(ticket)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium truncate">{ticket.title}</h3>
                          <div className="flex space-x-1">
                            {getStatusBadge(ticket.status)}
                          </div>
                        </div>

                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <User className="h-3 w-3 mr-1" />
                          <span>{ticket.profile.full_name}</span>
                          <span className="mx-1">•</span>
                          <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          {getPriorityBadge(ticket.priority)}
                          <div className="flex items-center text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            <span>{ticket.replies_count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{selectedTicket.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Opened by {selectedTicket.profile.full_name} •{" "}
                        {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedTicket.priority} onValueChange={handlePriorityChange}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                        className={`flex ${reply.is_admin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            reply.is_admin
                              ? "bg-blue-100 text-blue-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.profile.avatar_url} />
                              <AvatarFallback>
                                {reply.profile.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {reply.profile.full_name} {reply.is_admin && "(Admin)"}
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
      </Tabs>
    </div>
  );
};
