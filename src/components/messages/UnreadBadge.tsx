
import { Badge } from "@/components/ui/badge";

interface UnreadBadgeProps {
  count: number;
}

export const UnreadBadge = ({ count }: UnreadBadgeProps) => {
  if (count === 0) return null;
  
  return (
    <Badge 
      className="absolute -top-1 -right-1 bg-youbuy text-white min-w-[18px] h-[18px] flex items-center justify-center p-0 text-xs rounded-full"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};
