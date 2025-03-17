
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  onSuccess: () => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call onSuccess callback to complete the order
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-md space-y-4">
        <div className="flex items-center justify-between">
          <span>Cash on Delivery</span>
          <span className="text-green-600 font-medium">Selected</span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Pay when you receive the item. The seller will be notified of your order.
        </p>
      </div>
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full"
        variant="action"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Complete Order"
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        By completing this order, you agree to the terms of service and privacy policy.
      </p>
    </form>
  );
}
