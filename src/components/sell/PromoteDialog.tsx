import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PromoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotionLevel: 'none' | 'basic' | 'premium' | 'featured';
  setPromotionLevel: (level: 'none' | 'basic' | 'premium' | 'featured') => void;
  onComplete: () => void;
}

export const PromoteDialog: React.FC<PromoteDialogProps> = ({
  open,
  onOpenChange,
  promotionLevel,
  setPromotionLevel,
  onComplete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Promote Your Listing</DialogTitle>
          <DialogDescription>
            Get more visibility for your listing with one of our promotion packages
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${promotionLevel === 'none' ? 'border-youbuy bg-muted/20' : ''}`}
            onClick={() => setPromotionLevel('none')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${promotionLevel === 'none' ? 'border-youbuy' : 'border-muted-foreground'}`}>
                  {promotionLevel === 'none' && <Check className="h-3 w-3 text-youbuy" />}
                </div>
                <h3 className="font-medium">Standard Listing</h3>
              </div>
              <span className="font-medium">Free</span>
            </div>
            <p className="text-sm text-muted-foreground ml-7 mt-1">
              Regular listing with standard visibility
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${promotionLevel === 'basic' ? 'border-youbuy bg-muted/20' : ''}`}
            onClick={() => setPromotionLevel('basic')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${promotionLevel === 'basic' ? 'border-youbuy' : 'border-muted-foreground'}`}>
                  {promotionLevel === 'basic' && <Check className="h-3 w-3 text-youbuy" />}
                </div>
                <h3 className="font-medium">Basic Promotion</h3>
              </div>
              <span className="font-medium">AED 10</span>
            </div>
            <p className="text-sm text-muted-foreground ml-7 mt-1">
              Featured in search results for 3 days
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${promotionLevel === 'premium' ? 'border-youbuy bg-muted/20' : ''}`}
            onClick={() => setPromotionLevel('premium')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${promotionLevel === 'premium' ? 'border-youbuy' : 'border-muted-foreground'}`}>
                  {promotionLevel === 'premium' && <Check className="h-3 w-3 text-youbuy" />}
                </div>
                <h3 className="font-medium">Premium Promotion</h3>
              </div>
              <span className="font-medium">AED 25</span>
            </div>
            <p className="text-sm text-muted-foreground ml-7 mt-1">
              Top of search results and homepage feature for 7 days
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${promotionLevel === 'featured' ? 'border-youbuy bg-muted/20' : ''}`}
            onClick={() => setPromotionLevel('featured')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${promotionLevel === 'featured' ? 'border-youbuy' : 'border-muted-foreground'}`}>
                  {promotionLevel === 'featured' && <Check className="h-3 w-3 text-youbuy" />}
                </div>
                <h3 className="font-medium">Featured Promotion</h3>
              </div>
              <span className="font-medium">AED 50</span>
            </div>
            <p className="text-sm text-muted-foreground ml-7 mt-1">
              Premium visibility plus category feature and alert notifications to potential buyers for 14 days
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onComplete}
            className="bg-youbuy hover:bg-youbuy-dark"
            variant="action"
          >
            {promotionLevel === 'none' ? 'Publish Without Promotion' : 'Confirm & Pay'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
