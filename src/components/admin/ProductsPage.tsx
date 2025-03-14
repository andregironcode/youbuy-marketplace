
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ProductsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage all products on the YouBuy marketplace
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Listed Date</TableHead>
              <TableHead className="w-14"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { title: "iPhone 13 Pro Max", category: "Electronics", price: "$899", seller: "John Smith", status: "Available", date: "May 5, 2023" },
              { title: "Vintage Leather Jacket", category: "Clothing", price: "$120", seller: "Maria Garcia", status: "Available", date: "Jun 15, 2023" },
              { title: "Sony WH-1000XM4", category: "Electronics", price: "$249", seller: "Robert Johnson", status: "Sold", date: "Jul 22, 2023" },
              { title: "Coffee Table", category: "Home & Garden", price: "$189", seller: "Sarah Williams", status: "Available", date: "Aug 3, 2023" },
              { title: "Mountain Bike", category: "Sports", price: "$450", seller: "David Wilson", status: "Reserved", date: "Sep 18, 2023" },
            ].map((product, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-10 w-10 rounded-md flex items-center justify-center text-xs">
                      IMG
                    </div>
                    <span>{product.title}</span>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{product.seller[0]}</AvatarFallback>
                    </Avatar>
                    <span>{product.seller}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.status === "Available" ? "bg-green-100 text-green-800" : 
                    product.status === "Sold" ? "bg-gray-100 text-gray-800" : 
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {product.status}
                  </span>
                </TableCell>
                <TableCell>{product.date}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
