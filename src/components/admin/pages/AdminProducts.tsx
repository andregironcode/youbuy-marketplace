
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Eye, Ban, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Product = {
  id: string;
  title: string;
  price: string;
  seller_id: string;
  product_status: string;
  category: string;
  created_at: string;
  seller_name?: string;
};

export const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch products with seller profiles
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:seller_id (
            full_name
          )
        `);
      
      if (error) throw error;

      // Map the data to include seller name
      const productsWithSellerNames = data.map((product: any) => ({
        ...product,
        seller_name: product.profiles?.full_name || 'Unknown Seller'
      }));

      setProducts(productsWithSellerNames);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Failed to load products",
        description: "There was an error loading the product data."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    // In a real application, this would navigate to a product detail view
    window.open(`/product/${product.id}`, '_blank');
  };

  const handleDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);
      
      if (error) throw error;
      
      toast({
        title: "Product deleted",
        description: "The product has been removed successfully."
      });
      
      // Update local state
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "There was an error deleting the product."
      });
    }
  };

  const handleStatusDialog = (product: Product, status: string) => {
    setSelectedProduct(product);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ product_status: newStatus })
        .eq('id', selectedProduct.id);
      
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Product is now ${newStatus}.`
      });
      
      // Update local state
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? {...p, product_status: newStatus} 
          : p
      ));
      
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error("Error updating product status:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the product status."
      });
    }
  };

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format price
  const formatPrice = (price: string) => {
    if (!price) return "$0";
    return price.startsWith("$") ? price : `$${price}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <p className="text-muted-foreground">Monitor and manage product listings on the platform</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={fetchProducts} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh Products"}
        </Button>
      </div>
      
      <div className="border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listed Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">Loading products...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">No products found</td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{product.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.seller_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        product.product_status === 'available' ? 'bg-green-100 text-green-800' : 
                        product.product_status === 'reserved' ? 'bg-blue-100 text-blue-800' : 
                        product.product_status === 'sold' ? 'bg-gray-100 text-gray-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {product.product_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewProduct(product)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {product.product_status !== 'blocked' ? (
                        <Button variant="ghost" size="icon" onClick={() => handleStatusDialog(product, 'blocked')}>
                          <Ban className="h-4 w-4 text-red-500" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleStatusDialog(product, 'available')}>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDialog(product)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Product Status</DialogTitle>
            <DialogDescription>
              {newStatus === 'blocked' 
                ? 'Are you sure you want to block this product? It will no longer be visible to users.'
                : 'Are you sure you want to unblock this product? It will become visible to users again.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmStatusChange}
              variant={newStatus === 'blocked' ? 'destructive' : 'default'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
