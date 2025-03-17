
import { useState } from "react";
import { TicketForm } from "@/components/support/TicketForm";
import { UserTickets } from "@/components/support/UserTickets";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Plus } from "lucide-react";

export const SupportPage = () => {
  const [activeTab, setActiveTab] = useState("tickets");
  
  const handleTicketCreated = () => {
    setActiveTab("tickets");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Support Center</h1>
        <p className="text-muted-foreground mt-1">
          Get help with your orders or report issues with the platform
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="tickets" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> Your Tickets
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Create Ticket
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-4">
          <UserTickets />
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Submit a new support request and our team will get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TicketForm onSuccess={handleTicketCreated} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
