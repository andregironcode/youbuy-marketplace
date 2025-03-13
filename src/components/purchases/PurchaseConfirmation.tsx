
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Check, AlertTriangle } from "lucide-react";

interface PurchaseConfirmationProps {
  orderId: string;
  onConfirm: () => void;
}

export function PurchaseConfirmation({ orderId, onConfirm }: PurchaseConfirmationProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleConfirmDelivery = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await supabase.functions.invoke('order-management/confirm-delivery', {
        body: { orderId, userId: user.id }
      });
      
      if (response.error) throw new Error(response.error);
      
      toast({
        title: "Delivery confirmed",
        description: "Payment will be released to the seller after 12 hours if no disputes are raised.",
      });
      
      onConfirm();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast({
        title: "Error",
        description: "Could not confirm delivery. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDispute = async () => {
    if (!user || !disputeReason.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await supabase.functions.invoke('order-management/submit-dispute', {
        body: { 
          orderId, 
          userId: user.id,
          reason: disputeReason.trim()
        }
      });
      
      if (response.error) throw new Error(response.error);
      
      toast({
        title: "Dispute submitted",
        description: "Your dispute has been submitted and will be reviewed by our team.",
      });
      
      onConfirm();
      setIsDisputeDialogOpen(false);
    } catch (error) {
      console.error("Error submitting dispute:", error);
      toast({
        title: "Error",
        description: "Could not submit dispute. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex space-x-2">
      {/* Confirm Delivery Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            <Check className="mr-1 h-4 w-4" />
            Confirm Receipt
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Receipt of Order</DialogTitle>
            <DialogDescription>
              By confirming receipt, you acknowledge that you've received the item in acceptable condition.
              The payment will be held for 12 hours to allow you to raise any disputes if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-amber-50 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              After 12 hours, the payment will be automatically released to the seller
              and you won't be able to raise disputes for this order.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmDelivery}
              disabled={isSubmitting}
            >
              Yes, Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Report Issue Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50">
            <AlertTriangle className="mr-1 h-4 w-4" />
            Report Issue
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Please describe the issue you're experiencing with this order.
              This will initiate the dispute process and our team will review it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="Describe your issue in detail (e.g., item damaged, not as described, etc.)"
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisputeDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={handleSubmitDispute}
              disabled={isSubmitting || !disputeReason.trim()}
            >
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
