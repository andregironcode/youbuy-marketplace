
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Define the Report type to match the data structure
type Report = {
  id: string;
  type: "User" | "Product";
  target_id: string;
  target_name: string;
  reporter_id: string;
  reporter_name: string;
  reason: string;
  created_at: string;
  status: "pending" | "under review" | "resolved";
  notes: string;
};

export const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [currentStatus, setCurrentStatus] = useState<"pending" | "under review" | "resolved">("pending");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      // This is a placeholder - in a real app this would fetch from the reports table
      // Mocking data for the UI demonstration
      const mockReports: Report[] = [
        {
          id: "1",
          type: "Product",
          target_id: "prod-1",
          target_name: "iPhone 13 Pro",
          reporter_id: "user-1",
          reporter_name: "John Doe",
          reason: "Counterfeit product",
          created_at: "2023-11-15T10:30:00Z",
          status: "pending",
          notes: ""
        },
        {
          id: "2",
          type: "User",
          target_id: "user-2",
          target_name: "Jane Smith",
          reporter_id: "user-3",
          reporter_name: "Alice Brown",
          reason: "Inappropriate behavior",
          created_at: "2023-11-14T14:20:00Z",
          status: "under review",
          notes: "Contacted user for explanation"
        },
        {
          id: "3",
          type: "Product",
          target_id: "prod-2",
          target_name: "Gaming Laptop",
          reporter_id: "user-4",
          reporter_name: "Bob Johnson",
          reason: "Misleading description",
          created_at: "2023-11-13T09:15:00Z",
          status: "resolved",
          notes: "Seller updated the description"
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reports"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleStatusChange = async (reportId: string, newStatus: "pending" | "under review" | "resolved") => {
    try {
      // In a real app, this would update the database
      const updatedReports = reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, notes: notes || report.notes } 
          : report
      );

      setReports(updatedReports);
      setOpenDialog(false);

      toast({
        title: "Status updated",
        description: `Report has been marked as ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating report status:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update report status"
      });
    }
  };

  const filteredReports = activeTab === "all" 
    ? reports 
    : reports.filter(report => report.status === activeTab);

  const getStatusBadge = (status: "pending" | "under review" | "resolved") => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "under review":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><AlertCircle className="w-3 h-3 mr-1" />Under Review</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Management</h1>
        <p className="text-muted-foreground">Review and manage user and product reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Review reports submitted by users about products or other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="under review">Under Review</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No reports found
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map(report => (
                        <TableRow key={report.id}>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>{report.target_name}</TableCell>
                          <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                          <TableCell>{report.reporter_name}</TableCell>
                          <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setNotes(report.notes);
                                setCurrentStatus(report.status);
                                setOpenDialog(true);
                              }}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              {selectedReport && `${selectedReport.type} report: "${selectedReport.reason}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Target</h4>
                <p className="text-sm">{selectedReport?.target_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Reported By</h4>
                <p className="text-sm">{selectedReport?.reporter_name}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Reason</h4>
              <p className="text-sm">{selectedReport?.reason}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <div className="flex gap-2">
                <Button 
                  variant={currentStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  className={currentStatus === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                  onClick={() => setCurrentStatus("pending")}
                >
                  Pending
                </Button>
                <Button 
                  variant={currentStatus === "under review" ? "default" : "outline"}
                  size="sm"
                  className={currentStatus === "under review" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => setCurrentStatus("under review")}
                >
                  Under Review
                </Button>
                <Button 
                  variant={currentStatus === "resolved" ? "default" : "outline"}
                  size="sm"
                  className={currentStatus === "resolved" ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setCurrentStatus("resolved")}
                >
                  Resolved
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Admin Notes</h4>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this report..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedReport && handleStatusChange(selectedReport.id, currentStatus)}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
