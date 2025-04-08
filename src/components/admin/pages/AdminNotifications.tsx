import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { sendBulkSystemNotification } from "@/utils/notificationService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export const AdminNotifications = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [userType, setUserType] = useState<"all" | "sellers" | "buyers" | "specific">("all");
  const [specificUser, setSpecificUser] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Fetch all users for the select dropdown
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name");

      if (error) throw error;
      return data;
    },
  });

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and message.",
        variant: "destructive",
      });
      return;
    }

    setStatus("loading");

    try {
      let targetUserIds: string[] = [];

      // Determine which users should receive the notification
      // For simplicity, we'll just get all users and filter in code
      // In a production app, you'd want to query only the relevant users based on a role field
      const { data: allUsers, error: usersError } = await supabase
        .from("profiles")
        .select("id");

      if (usersError) throw usersError;

      if (userType === "all") {
        targetUserIds = allUsers.map(user => user.id);
      } else if (userType === "specific" && specificUser) {
        targetUserIds = [specificUser];
      } else {
        // In a real app, you would filter based on user type from database
        // For now, we'll just use all users for demo purposes
        targetUserIds = allUsers.map(user => user.id);
        
        toast({
          title: "Simplified Filter",
          description: "Filtering by seller/buyer status is simulated in this demo.",
        });
      }

      if (targetUserIds.length === 0) {
        toast({
          title: "No recipients",
          description: "No users match your selected criteria.",
          variant: "destructive",
        });
        setStatus("error");
        return;
      }

      // Send the notification
      const success = await sendBulkSystemNotification({
        userIds: targetUserIds,
        title,
        message,
        actionUrl: actionUrl || undefined,
      });

      if (success) {
        toast({
          title: "Notification sent",
          description: `Successfully sent to ${targetUserIds.length} users.`,
        });
        setTitle("");
        setMessage("");
        setActionUrl("");
        setStatus("success");
      } else {
        throw new Error("Failed to send notifications");
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive",
      });
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          Send notifications to users and manage notification settings
        </p>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList>
          <TabsTrigger value="send">Send Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Send New Notification</CardTitle>
              <CardDescription>
                Create and send notifications to all users or selected groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Select 
                  value={userType} 
                  onValueChange={(value) => setUserType(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="sellers">Sellers Only</SelectItem>
                    <SelectItem value="buyers">Buyers Only</SelectItem>
                    <SelectItem value="specific">Specific User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {userType === "specific" && (
                <div className="space-y-2">
                  <Label htmlFor="specific-user">Select User</Label>
                  <Select 
                    value={specificUser} 
                    onValueChange={setSpecificUser}
                    disabled={loadingUsers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user"} />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || "User " + user.id.substring(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-url">Action URL (Optional)</Label>
                <Input
                  id="action-url"
                  placeholder="e.g., /profile/purchases"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This is the page users will be directed to when they click on the notification.
                </p>
              </div>

              <Button 
                className="w-full"
                onClick={handleSendNotification}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                ) : status === "error" ? (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                ) : (
                  "Send Notification"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Analytics</CardTitle>
              <CardDescription>
                View metrics and performance data for your notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Notifications Today</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Read Rate</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Analytics dashboard is under development. More metrics coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure global notification settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Coming Soon</Label>
                <p className="text-sm text-muted-foreground">
                  Advanced notification settings and configurations will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 