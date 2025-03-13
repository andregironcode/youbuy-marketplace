
import { useAuth } from "@/context/AuthContext";
import { products } from "@/data/products";
import { ProductType } from "@/types/product";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, DollarSign } from "lucide-react";

export const TopProducts = () => {
  const { user } = useAuth();
  const [topProducts, setTopProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real application, this would fetch data from Supabase
    const fetchTopProducts = () => {
      setIsLoading(true);
      
      // Use the mock products data for now
      const userProducts = products.filter(product => 
        product.seller.userId === user?.id || 
        product.seller.id === user?.id
      );
      
      // Sort by view count (in a real app, this could be by various metrics)
      const sorted = [...userProducts].sort((a, b) => 
        (b.viewCount || 0) - (a.viewCount || 0)
      ).slice(0, 5); // Get top 5
      
      setTopProducts(sorted);
      setIsLoading(false);
    };

    if (user) {
      fetchTopProducts();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (topProducts.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No products found. Start listing to see stats!
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Likes</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 rounded">
                    <AvatarImage src={product.image} alt={product.title} />
                    <AvatarFallback>{product.title.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="truncate max-w-[150px]">
                    <p className="truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{product.price}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{product.viewCount || 0}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>{product.likeCount}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <StatusBadge status={product.status || 'available'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'sold':
      return <Badge variant="default" className="bg-green-500">Sold</Badge>;
    case 'reserved':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Reserved</Badge>;
    default:
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Available</Badge>;
  }
};
