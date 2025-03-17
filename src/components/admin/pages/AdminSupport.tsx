
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpDown, Filter, MessageSquare, RefreshCw, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for our tickets and replies
type SupportTicket = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_admin: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
  };
  replies_count?: number;
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

export const AdminSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState<string>("");
  const [updatedPriority, setUpdatedPriority] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data: ticketsData, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .order(sortColumn, { ascending: sortDirection === "asc" });
        
      if (error) throw error;

      // Get reply counts for each ticket
      const ticketsWithReplyCounts = await Promise.all(
        ticketsData.map(async (ticket) => {
          const { count, error: countError } = await supabase
            .from('ticket_replies')
            .select('id', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id);
            
          if (countError) throw countError;
          
          return {
            ...ticket,
            replies_count: count || 0
          };
        })
      );
      
      setTickets(ticketsWithReplyCounts);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        variant: "destructive",
        title: "Failed to load tickets",
        description: "There was an error loading the support tickets."
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
        description: "There was an error loading the ticket conversation."
      });
    } finally {
      setReplyLoading(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || !user) return;
    
    setReplyLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_replies')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: replyMessage,
          is_admin: true
        });
        
      if (error) throw error;
      
      // Update ticket status to in_progress if it's open
      if (selectedTicket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in_progress' })
          .eq('id', selectedTicket.id);
          
        setSelectedTicket({
          ...selectedTicket,
          status: 'in_progress'
        });
      }
      
      setReplyMessage("");
      await fetchTicketReplies(selectedTicket.id);
      
      toast({
        title: "Reply sent",
        description: "Your reply has been added to the ticket."
      });
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        variant: "destructive",
        title: "Failed to send reply",
        description: "There was an error sending your reply."
      });
    } finally {
      setReplyLoading(false);
    }
  };

  // Update ticket
  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: updatedStatus,
          priority: updatedPriority,
          assigned_admin: user?.id
        })
        .eq('id', selectedTicket.id);
        
      if (error) throw error;
      
      setSelectedTicket({
        ...selectedTicket,
        status: updatedStatus as any,
        priority: updatedPriority as any,
        assigned_admin: user?.id || null
      });
      
      setIsUpdateModalOpen(false);
      await fetchTickets();
      
      toast({
        title: "Ticket updated",
        description: "The ticket has been successfully updated."
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the ticket."
      });
    }
  };

  // Handle ticket selection
  const handleSelectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setUpdatedStatus(ticket.status);
    setUpdatedPriority(ticket.priority);
    setIsDetailModalOpen(true);
    await fetchTicketReplies(ticket.id);
  };

  // Handle sort change
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.profile?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setPriorityFilter(null);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
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

  // Load tickets on initial render and when sort changes
  useEffect(() => {
    fetchTickets();
  }, [sortColumn, sortDirection]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Manage customer support tickets and respond to inquiries</p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setStatusFilter('open')}>
                Open Tickets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in_progress')}>
                In Progress Tickets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('resolved')}>
                Resolved Tickets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('closed')}>
                Closed Tickets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter('urgent')}>
                Urgent Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter('high')}>
                High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetFilters}>
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={fetchTickets} variant="outline" className="gap-1 w-full sm:w-auto">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      {/* Applied filters */}
      {(statusFilter || priorityFilter) && (
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="text-muted-foreground">Filters:</div>
          {statusFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusFilter}
              <button 
                className="ml-1 hover:text-destructive" 
                onClick={() => setStatusFilter(null)}
              >
                ×
              </button>
            </Badge>
          )}
          {priorityFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Priority: {priorityFilter}
              <button 
                className="ml-1 hover:text-destructive" 
                onClick={() => setPriorityFilter(null)}
              >
                ×
              </button>
            </Badge>
          )}
          <Button 
            variant="link" 
            className="text-xs h-auto p-0" 
            onClick={resetFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Tickets table */}
      <div className="border rounded-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[250px] cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Title
                  {sortColumn === "title" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {sortColumn === "status" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center">
                  Priority
                  {sortColumn === "priority" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center">
                  Created
                  {sortColumn === "created_at" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Replies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Loading tickets...</div>
                </TableCell>
              </TableRow>
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No tickets found</p>
                    {(searchTerm || statusFilter || priorityFilter) && (
                      <Button variant="link" onClick={resetFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow 
                  key={ticket.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {ticket.profile?.avatar_url ? (
                        <img 
                          src={ticket.profile.avatar_url} 
                          alt={`${ticket.profile.full_name || 'User'}'s avatar`}
                          className="h-6 w-6 rounded-full mr-2 object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center mr-2">
                          <User className="h-3 w-3 text-neutral-500" />
                        </div>
                      )}
                      <span>{ticket.profile?.full_name || "Unnamed User"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{formatDate(ticket.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ticket.replies_count || 0}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ticket detail modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-start gap-4">
              <div>
                <div>{selectedTicket?.title}</div>
                <div className="flex gap-2 mt-1">
                  {selectedTicket && getStatusBadge(selectedTicket.status)}
                  {selectedTicket && getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUpdateModalOpen(true);
                }}
              >
                Update Ticket
              </Button>
            </DialogTitle>
            <DialogDescription className="flex justify-between items-center">
              <div>
                Ticket #{selectedTicket?.id.slice(0, 8)} • Created {selectedTicket && formatDate(selectedTicket.created_at)}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{selectedTicket?.profile?.full_name || "Unnamed User"}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto mt-2">
            {/* Original ticket description */}
            <Card className="mb-6">
              <CardHeader className="py-3">
                <CardTitle className="text-base">Original Request</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{selectedTicket?.description}</p>
              </CardContent>
            </Card>
            
            {/* Conversation thread */}
            <div className="space-y-4">
              {replyLoading && ticketReplies.length === 0 ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : ticketReplies.length > 0 ? (
                ticketReplies.map(reply => (
                  <div 
                    key={reply.id} 
                    className={`flex ${reply.is_admin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        reply.is_admin 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <div className="flex items-center text-xs text-gray-500">
                          {reply.profile?.full_name || "Unnamed User"}
                          {reply.is_admin && <Badge className="ml-2 bg-blue-500">Admin</Badge>}
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap">{reply.message}</div>
                      <div className="text-xs text-right mt-1 text-gray-500">
                        {formatDate(reply.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No replies yet
                </div>
              )}
            </div>
          </div>
          
          {/* Reply form */}
          <div className="mt-4 border-t pt-4">
            <Textarea
              placeholder="Type your reply..."
              className="resize-none"
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Button 
                onClick={handleSubmitReply} 
                disabled={!replyMessage.trim() || replyLoading}
              >
                {replyLoading ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update ticket modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Ticket</DialogTitle>
            <DialogDescription>
              Change the status and priority of this ticket.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={updatedStatus} 
                onValueChange={setUpdatedStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={updatedPriority} 
                onValueChange={setUpdatedPriority}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select a priority" />
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTicket}>
              Update Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
