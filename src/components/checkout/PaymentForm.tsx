import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, CreditCard, TruckIcon } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface PaymentFormProps {
  onSuccess: (paymentMethod: 'wallet' | 'cash') => void;
  totalAmount: number;
}

export function PaymentForm({ onSuccess, totalAmount }: PaymentFormProps) {
  const { balance, makePayment } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cash'>('cash');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(undefined);

    try {
      if (paymentMethod === 'wallet') {
        // Check if wallet has sufficient funds
        if (balance < totalAmount) {
          setErrorMessage(`Insufficient wallet balance. Available: $${balance.toFixed(2)}, Required: $${totalAmount.toFixed(2)}`);
          setIsProcessing(false);
          return;
        }

        // Process the payment directly here for wallet
        const paymentResult = await makePayment(totalAmount, `Order payment for $${totalAmount.toFixed(2)}`);
        
        if (!paymentResult) {
          setErrorMessage('Wallet payment failed. Please try again or use a different payment method.');
          setIsProcessing(false);
          return;
        }

        toast({
          title: "Payment Successful",
          description: `$${totalAmount.toFixed(2)} has been deducted from your wallet.`,
        });
      } else {
        // Simulate payment processing delay for cash on delivery
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Call onSuccess callback to complete the order
      onSuccess(paymentMethod);
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RadioGroup 
        value={paymentMethod} 
        onValueChange={(value) => setPaymentMethod(value as 'wallet' | 'cash')}
        className="space-y-4"
      >
        <div className={`p-4 border rounded-md space-y-3 transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wallet" id="wallet" />
            <Label htmlFor="wallet" className="flex items-center cursor-pointer">
              <Wallet className="h-4 w-4 mr-2" />
              <span className="font-medium">Pay with Wallet</span>
              <span className="ml-auto text-sm font-semibold">${balance.toFixed(2)} available</span>
            </Label>
          </div>
          
          {paymentMethod === 'wallet' && (
            <div className="pl-6 text-sm">
              <p className="text-muted-foreground">
                Pay directly from your YouBuy wallet balance. Fast and secure.
              </p>
              {balance < totalAmount && (
                <p className="text-red-500 mt-2 text-xs">
                  Insufficient balance. Please add funds to your wallet or select another payment method.
                </p>
              )}
            </div>
          )}
        </div>

        <div className={`p-4 border rounded-md space-y-3 transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="flex items-center cursor-pointer">
              <TruckIcon className="h-4 w-4 mr-2" />
              <span className="font-medium">Cash on Delivery</span>
            </Label>
          </div>
          
          {paymentMethod === 'cash' && (
            <div className="pl-6 text-sm text-muted-foreground">
              Pay when you receive the item. The seller will be notified of your order.
            </div>
          )}
        </div>
      </RadioGroup>
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full"
        variant="success" 
        disabled={
          isProcessing || 
          (paymentMethod === 'wallet' && balance < totalAmount)
        }
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
