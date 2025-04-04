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
  Info,
  Pencil
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
import { LocationMap } from "@/components/map/LocationMap";

const placeholderImages = [
  "https://via.placeholder.com/400x400?text=Placeholder+Image",
  "https://via.placeholder.com/400x400?text=Another+Image",
];

const relatedProducts: ProductType[] = [
  {
    id: "rp1",
    title: "Related Product 1",
    description: "A related product description",
    price: 49.99,
    image: "https://via.placeholder.com/200x200?text=Related+1",
    images: ["https://via.placeholder.com/200x200?text=Related+1"],
    location: "Dubai",
    timeAgo: "2 days ago",
    createdAt: new Date().toISOString(),
    seller: {
      id: "seller1",
      name: "Seller Name",
      avatar: "https://i.pravatar.cc/150?img=1",
      joinedDate: "Jan 2023"
    },
    category: "electronics"
  },
  {
    id: "rp2",
    title: "Related Product 2",
    description: "Another related product description",
    price: 79.99,
    image: "https://via.placeholder.com/200x200?text=Related+2",
    images: ["https://via.placeholder.com/200x200?text=Related+2"],
    location: "Abu Dhabi",
    timeAgo: "3 days ago",
    createdAt: new Date().toISOString(),
    seller: {
      id: "seller2",
      name: "Another Seller",
      avatar: "https://i.pravatar.cc/150?img=2",
      joinedDate: "Feb 2023"
    },
    category: "electronics"
  },
  {
    id: "rp3",
    title: "Related Product 3",
    description: "A third related product description",
    price: 29.99,
    image: "https://via.placeholder.com/200x200?text=Related+3",
    images: ["https://via.placeholder.com/200x200?text=Related+3"],
    location: "Sharjah",
    timeAgo: "1 week ago",
    createdAt: new Date().toISOString(),
    seller: {
      id: "seller3",
      name: "Third Seller",
      avatar: "https://i.pravatar.cc/150?img=3",
      joinedDate: "Mar 2023"
    },
    category: "electronics"
  },
];

const getCategoryById = (categoryId: string) => {
  return {
    id: categoryId,
    name: "Electronics",
  };
};

export default function ProductDetail() {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const location = window.location;

  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is undefined');
      console.log("Fetching product with ID:", id);
      const result = await getProductById(id);
      console.log("Query result:", result);
      if (!result) throw new Error('Product not found');
      return result as ProductType;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isOwnProduct = user && product?.seller?.id === user.id;

  useEffect(() => {
    const storedFavorite = localStorage.getItem(`favorite-${id}`);
    setIsFavorite(storedFavorite === 'true');
  }, [id]);

  const handleToggleFavorite = () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    localStorage.setItem(`favorite-${id}`, newFavoriteStatus.toString());

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

  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setCurrentImage(product.images[0]);
    } else if (product?.image) {
      setCurrentImage(product.image);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    console.error("Error loading product:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-xl font-semibold text-red-500 mb-2">Error: Could not load product details</p>
          <p className="text-muted-foreground mb-4">The product you're looking for might not exist or there was an issue loading it. ProductID: {id}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link 
            to={`/category/${product.category}`} 
            className="hover:underline"
          >
            {getCategoryById(product.category)?.name || "Category"}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {product.title}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-white max-w-2xl mx-auto">
            <img
              src={currentImage || product.images?.[0] || product.image}
              alt={product.title}
              className="h-full w-full object-contain"
            />
            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SOLD</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {product.images && product.images.map((image, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg border cursor-pointer overflow-hidden transition-colors ${
                  currentImage === image ? 'ring-2 ring-youbuy' : 'hover:border-youbuy/50'
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
          
          <div className="flex gap-2">
            {!isOwnProduct && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleToggleFavorite}
                className={isFavorite ? "text-pink-600" : ""}
              >
                <Heart className={`mr-1 h-4 w-4 ${isFavorite ? "fill-pink-600" : ""}`} />
                {isFavorite ? "Saved" : "Save"}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
            >
              <Share className="mr-1 h-4 w-4" />
              Share
            </Button>

            {isOwnProduct && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate(`/profile/edit-product/${product.id}`)}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Edit Product
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              {!isOwnProduct && (
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
              )}
              
              {product.viewCount && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span>Views</span>
                  </div>
                  <span className="text-right">{product.viewCount}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Price, Actions, and Seller Info */}
        <div className="space-y-6">
          {/* Product Description */}
          <ProductDetails product={product} isOwnProduct={isOwnProduct} />
          
          {/* Map showing product location */}
          {product.coordinates && product.coordinates.latitude && product.coordinates.longitude && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <LocationMap 
                  latitude={product.coordinates.latitude} 
                  longitude={product.coordinates.longitude} 
                  zoom={14}
                  height="200px"
                  interactive={false}
                  approximate={true}
                />
                <p className="text-sm text-muted-foreground mt-2">{product.location}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Seller Information */}
          {!isOwnProduct && product.seller && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-base mb-0">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 rounded-full bg-muted overflow-hidden">
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold leading-none mb-0">{product.seller.name}</h3>
                      {product.seller.rating && product.seller.rating > 4.5 && (
                        <Badge variant="outline" className="bg-youbuy/10 text-youbuy border-youbuy/20">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              product.seller.rating && i < Math.floor(product.seller.rating)
                                ? "fill-youbuy text-youbuy"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.seller.totalReviews || 0} reviews)
                      </span>
                    </div>
                    {product.seller.joinedDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Member since {new Date(product.seller.joinedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  variant="default"
                  className="w-full bg-youbuy hover:bg-youbuy/90 text-white"
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
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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
