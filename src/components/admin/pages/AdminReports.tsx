
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Report = {
  id: string;
  type: 'Product' | 'User';
  target_id: string;
  target_name: string;
  reporter_id: string;
  reporter_name: string;
  reason: string;
  status: 'pending' | 'under review' | 'resolved';
  created_at: string;
  notes?: string;
};

export const AdminReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Mock data for demonstration - In real implementation, get from Supabase
  const [reports, setReports] = useState<Report[]>([
    { id: "1", type: "Product", target_id: "prod-1", target_name: "Fake Nike Shoes", reporter_id: "user-1", reporter_name: "Michael Brown", reason: "Counterfeit item", status: "pending", created_at: "2023-12-10" },
    { id: "2", type: "User", target_id: "user-2", target_name: "JohnDoe123", reporter_id: "user-3", reporter_name: "Sarah Miller", reason: "Harassment", status: "under review", created_at: "2023-12-09" },
    { id: "3", type: "Product", target_id: "prod-2", target_name: "iPhone 15 (Broken)", reporter_id: "user-4", reporter_name: "David Wilson", reason: "Misleading description", status: "resolved", created_at: "2023-12-08" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionAction, setResolutionAction] = useState<'approve' | 'reject'>("approve");
  const { toast } = useToast();
  
  // In a real implementation, we would fetch reports from Supabase
  useEffect(() => {
    // This would be uncommented and implemented with real data
    // fetchReports();
  }, []);

  const fetchReports = async () => {
    // This would be implemented to fetch real data from Supabase
    // setIsLoading(true);
    // try {
    //   const { data, error } = await supabase...
    //   if (error) throw error;
    //   setReports(data);
    // } catch (error) {
    //   console.error("Error fetching reports:", error);
    //   toast({
    //     variant: "destructive",
    //     title: "Failed to load reports",
    //     description: "There was an error loading the report data."
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsDetailDialogOpen(true);
  };

  const handleResolveDialog = (report: Report, action: 'approve' | 'reject') => {
    setSelectedReport(report);
    setResolutionAction(action);
    setResolutionNotes("");
    setIsResolveDialogOpen(true);
  };

  const handleConfirmResolve = () => {
    if (!selectedReport) return;
    
    // In a real implementation, this would update the report in Supabase
    // try {
    //   const { error } = await supabase...
    //   if (error) throw error;
    
    // Update local state for demonstration
    const updatedReports = reports.map(report => 
      report.id === selectedReport.id 
        ? { 
            ...report, 
            status: 'resolved', 
            notes: resolutionNotes 
          } 
        : report
    );
    
    setReports(updatedReports);
    
    toast({
      title: "Report resolved",
      description: `The report has been ${resolutionAction === 'approve' ? 'approved' : 'rejected'}.`
    });
    
    setIsResolveDialogOpen(false);
  };

  const filteredReports = reports.filter(report => 
    report.target_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Management</h1>
        <p className="text-muted-foreground">Review and resolve user reports</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">Loading reports...</td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">No reports found</td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">#{report.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        report.type === 'Product' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.target_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.reporter_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        report.status === 'under review' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{report.created_at}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewReport(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status !== 'resolved' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleResolveDialog(report, 'approve')}>
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleResolveDialog(report, 'reject')}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Complete information for report #{selectedReport?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="font-medium">Type:</span> {selectedReport.type}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span> {selectedReport.status}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Target:</span> {selectedReport.target_name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Reporter:</span> {selectedReport.reporter_name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Date:</span> {selectedReport.created_at}
                </div>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">Reason:</span>
                <p className="mt-1 p-3 bg-gray-50 rounded">{selectedReport.reason}</p>
              </div>
              
              {selectedReport.notes && (
                <div className="text-sm">
                  <span className="font-medium">Resolution Notes:</span>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedReport.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Report Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolutionAction === 'approve' ? 'Approve Report' : 'Reject Report'}
            </DialogTitle>
            <DialogDescription>
              {resolutionAction === 'approve'
                ? 'Approving this report will take action against the reported content or user.'
                : 'Rejecting this report will mark it as resolved without taking action.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                placeholder="Add notes about your decision..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmResolve}
              variant={resolutionAction === 'approve' ? 'default' : 'destructive'}
            >
              {resolutionAction === 'approve' ? 'Approve Report' : 'Reject Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
