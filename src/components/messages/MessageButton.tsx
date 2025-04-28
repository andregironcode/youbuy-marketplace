import { Button, ButtonProps } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ProductType } from "@/types/product";

interface MessageButtonProps extends ButtonProps {
  product: ProductType;
}

export function MessageButton({ product, ...props }: MessageButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to message the seller",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (user.id === product.seller?.id) {
      toast({
        title: "Cannot message yourself",
        description: "This is your own product",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we would create a chat or get an existing one
    // For now, we'll just navigate to the messages page
    navigate("/messages");
  };

  return (
    <Button onClick={handleClick} {...props}>
      <MessageSquare className="h-4 w-4 mr-1" />
      Message
    </Button>
  );
}