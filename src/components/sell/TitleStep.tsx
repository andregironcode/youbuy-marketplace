
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { SellFormData, SellStep } from "@/types/sellForm";

interface TitleStepProps {
  title: string;
  setTitle: (title: string) => void;
  setCurrentStep: (step: SellStep) => void;
}

export const TitleStep: React.FC<TitleStepProps> = ({
  title,
  setTitle,
  setCurrentStep,
}) => {
  const isTitleValid = title.length >= 5 && title.length <= 50;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item details</CardTitle>
        <CardDescription>
          What are you selling? Provide a clear and concise title
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product title</Label>
            <Input
              id="title"
              placeholder="e.g., Samsung Galaxy S21 Ultra 5G 128GB"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={50}
              className={!isTitleValid && title.length > 0 ? "border-red-500" : ""}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Example: Three-seater red velvet sofa</span>
              <span className={title.length > 0 && !isTitleValid ? "text-red-500" : "text-muted-foreground"}>
                {title.length}/50
              </span>
            </div>
            {title.length > 0 && title.length < 5 && (
              <p className="text-xs text-red-500">Title must be at least 5 characters long</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          disabled={!isTitleValid}
          onClick={() => setCurrentStep("category")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
