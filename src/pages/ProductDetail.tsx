import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  MapPin, 
  Clock, 
  User, 
  Star, 
  MessageCircle, 
  ShieldCheck,
  Info
} from "lucide-react";
import { ProductType } from "@/types/product";
import { getProductById } from "@/data/products";
import { ProductDetails } from "@/components/product/ProductDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { MessageButton } from "@/components/product/MessageButton";

const placeholderImages = [
  "https://via.placeholder.com/400x400?text=Placeholder+Image",
  "https://via.placeholder.com/400x400?text=Another+Image",
];

const relatedProducts = [
  {
    id: "rp1",
    title: "Related Product 1",
    price: 49.99,
    imageUrl: "https://via.placeholder.com/200x200?text=Related+1",
  },
  {
    id: "rp2",
    title: "Related Product 2",
    price: 79.99,
    imageUrl: "https://via.placeholder.com/200x200?text=Related+2",
  },
  {
    id: "rp3",
    title: "Related Product 3",
    price: 29.99,
    imageUrl: "https://via.placeholder.com/200x200?text=Related+3",
  },
];

const getCategoryById = (categoryId: string) => {
  return {
    id: categoryId,
    name: "Electronics",
  };
};

export default function ProductDetail() {
  const { productId } = useParams();
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const location = window.location;

  useEffect(() => {
    // Simulate fetching favorite status from local storage or API
    const storedFavorite = localStorage.getItem(`favorite-${productId}`);
    setIsFavorite(storedFavorite === 'true');
  }, [productId]);

  const handleToggleFavorite = () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    localStorage.setItem(`favorite-${productId}`, newFavoriteStatus.toString());

    toast({
      title: newFavoriteStatus ? "Product saved to favorites!" : "Product removed from favorites.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || 'Check out this product!',
          text: product?.description || 'A great product you might like.',
          url: window.location.href,
        });
        toast({
          title: "Product shared successfully!",
        });
      } catch (error) {
        toast({
          title: "Sharing failed!",
          description: "Could not share the product. Please try again later.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser does not support the sharing API.",
        variant: "destructive",
      });
    }
  };

  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId as string),
    enabled: !!productId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Error: Could not load product details.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link 
            to={`/category/${product.categoryId}`} 
            className="hover:underline"
          >
            {getCategoryById(product.categoryId)?.name || "Category"}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {product.title}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
            <img
              src={currentImage || product.images[0]}
              alt={product.title}
              className="h-full w-full object-contain"
            />
            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SOLD</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`aspect-square rounded-md border cursor-pointer overflow-hidden ${
                  currentImage === image ? 'ring-2 ring-youbuy' : ''
                }`}
                onClick={() => setCurrentImage(image)}
              >
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleFavorite}
              className={isFavorite ? "text-youbuy" : ""}
            >
              <Heart className={`mr-1 h-4 w-4 ${isFavorite ? "fill-youbuy" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
            >
              <Share className="mr-1 h-4 w-4" />
              Share
            </Button>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Location</span>
                </div>
                <span className="text-right">{product.location || "Not specified"}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Posted</span>
                </div>
                <span className="text-right">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "Recently"}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Seller</span>
                </div>
                <Link 
                  to={`/seller/${product.seller.id}`}
                  className="text-right text-youbuy hover:underline"
                >
                  {product.seller.name}
                </Link>
              </div>
              
              {product.views && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span>Views</span>
                  </div>
                  <span className="text-right">{product.views}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {product.seller && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full bg-muted overflow-hidden">
                    {product.seller.avatar ? (
                      <img
                        src={product.seller.avatar}
                        alt={product.seller.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{product.seller.name}</h3>
                      {product.seller.rating && product.seller.rating > 4.5 && (
                        <Badge variant="outline" className="ml-2 bg-pink-50 text-pink-700 border-pink-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {product.seller.memberSince && (
                      <p className="text-xs text-muted-foreground">
                        Member since {product.seller.memberSince}
                      </p>
                    )}
                  </div>
                </div>
                
                {product.seller.rating && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.seller.rating)
                                ? "fill-youbuy text-youbuy"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {product.seller.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({product.seller.totalRatings || 0} reviews)
                      </span>
                    </div>
                    <Progress 
                      value={
                        ((product.seller.rating || 0) / 5) * 100
                      } 
                      className="h-1"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  variant="default"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Sign in required",
                        description: "Please sign in to message this seller",
                        variant: "destructive"
                      });
                      navigate("/auth?redirect=" + encodeURIComponent(location.pathname));
                      return;
                    }
                    navigate(`/messages?userId=${product.seller.id}&productId=${product.id}`);
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Seller
                </Button>
                
                <Link 
                  to={`/seller/${product.seller.id}`}
                  className="text-sm text-youbuy hover:underline w-full text-center"
                >
                  View Seller Profile
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <ProductDetails product={product} />
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard 
                key={relatedProduct.id} 
                product={relatedProduct} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
