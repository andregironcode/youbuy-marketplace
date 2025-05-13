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
  Pencil,
  Tag,
  ShoppingBag,
  X,
  Maximize
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
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const location = window.location;

  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is undefined');
      const result = await getProductById(id);
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

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase this item",
        variant: "destructive"
      });
      navigate("/auth?redirect=/product/" + product.id);
      return;
    }

    if (product.id) {
      navigate(`/checkout/${product.id}`);
    }
  };

  const handleMessageClick = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to message the seller",
      });
      return;
    }

    try {
      // Check if a chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .single();

      if (existingChat) {
        // Navigate to existing chat
        navigate(`/messages/${existingChat.id}`);
        return;
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          product_id: product.id,
          seller_id: product.seller?.id,
          buyer_id: user.id,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to new chat
      navigate(`/messages/${newChat.id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (product?.image_urls && product.image_urls.length > 0) {
      setCurrentImage(product.image_urls[0]);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navigation and Breadcrumbs */}
      <div className="mb-6 w-full">
        <div className="flex flex-wrap items-center justify-between w-full">
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
            <Link 
              to={`/category/${product.category}`} 
              className="hover:underline"
            >
              {product.subcategory || "Subcategory"}
            </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {product.title}
          </span>
          </div>

          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 px-3 py-1 text-xs font-medium">
            <Tag className="h-3 w-3 mr-1.5" />
            FEATURED
          </Badge>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Product Images */}
        <div className="flex-1 md:max-w-[55%]">
          {/* Image Container with Outside Arrows */}
          <div className="relative max-w-lg mx-auto">
            {/* Left Arrow - Outside */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -left-10 md:-left-16 top-1/2 -translate-y-1/2 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md z-10"
              onClick={() => {
                if (product.image_urls && product.image_urls.length > 1) {
                  const currentIndex = product.image_urls.findIndex(img => img === currentImage);
                  const prevIndex = currentIndex <= 0 ? product.image_urls.length - 1 : currentIndex - 1;
                  setCurrentImage(product.image_urls[prevIndex]);
                }
              }}
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>

            {/* Main Product Image */}
            <div 
              className="relative aspect-square overflow-hidden rounded-xl border bg-white mb-4 cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            >
            <img
              src={currentImage || product.image_urls?.[0] || '/placeholder-product.jpg'}
              alt={product.title}
              className="h-full w-full object-contain"
            />
            {product.product_status === 'sold' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SOLD</span>
              </div>
            )}

              {/* Enlarge Button */}
              <Button 
                variant="secondary"
                size="icon"
                className="absolute bottom-2 right-2 bg-pink-500 hover:bg-pink-600 rounded-full shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
              >
                <Maximize className="h-4 w-4 text-white" />
              </Button>
            </div>

            {/* Right Arrow - Outside */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -right-10 md:-right-16 top-1/2 -translate-y-1/2 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md z-10"
              onClick={() => {
                if (product.image_urls && product.image_urls.length > 1) {
                  const currentIndex = product.image_urls.findIndex(img => img === currentImage);
                  const nextIndex = currentIndex >= product.image_urls.length - 1 ? 0 : currentIndex + 1;
                  setCurrentImage(product.image_urls[nextIndex]);
                }
              }}
            >
              <ArrowLeft className="h-5 w-5 text-white transform rotate-180" />
            </Button>
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-5 gap-3 mb-8 max-w-lg mx-auto">
            {product.image_urls && product.image_urls.map((image, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg border cursor-pointer overflow-hidden transition-colors ${
                  currentImage === image ? 'ring-2 ring-pink-500' : 'hover:border-pink-500/50'
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

          {/* Product Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{product.title}</h2>
            <p className="text-muted-foreground whitespace-pre-line mb-4">{product.description}</p>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Details</h3>
                <div className="space-y-3">
                  {Object.entries(product.specifications)
                    .filter(([key, value]) => value)
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Seller Info, Price, Actions */}
        <div className="md:max-w-[35%] space-y-6">
          {/* Offer Header */}
          <div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Offered by</h3>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <img 
                  src={product.seller?.avatar || "https://via.placeholder.com/64"} 
                  alt={product.seller?.name || "Seller"} 
                  className="h-16 w-16 rounded-full object-cover border"
                />
              </div>
              <div>
                <div className="font-semibold text-lg">{product.seller?.name || "Seller Name"}</div>
                {/* Star Rating */}
                <div className="flex items-center mt-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        product.seller?.rating && star <= Math.floor(product.seller.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      } mr-0.5`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {product.seller?.rating ? product.seller.rating.toFixed(1) : "No rating"} 
                    {product.seller?.totalReviews ? ` (${product.seller.totalReviews})` : ""}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Usually responds in 30 min
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center py-6"
              onClick={handleMessageClick}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Message
            </Button>

            <Button 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center py-6" 
              disabled={isOwnProduct || product.product_status === 'sold' || product.product_status === 'reserved'}
              onClick={handleBuyNow}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Buy Now
            </Button>
          </div>

          {/* Price and Shipping Info */}
          <Card className="border rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold text-youbuy">
                  AED {formatCurrency(product.price)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">With secure shipping and payment</span>
                </div>

                <div className="text-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Receive it in 3-7 days</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Delivered directly to your home</span>
              </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span>Home delivery available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{product.location || "Valencia (Valencia)"}</span>
            </div>

            {/* Map */}
            <div className="h-40 w-full overflow-hidden rounded-lg border">
              {product.coordinates && product.coordinates.latitude && product.coordinates.longitude ? (
                <LocationMap 
                  latitude={product.coordinates.latitude} 
                  longitude={product.coordinates.longitude} 
                  zoom={13}
                  height="160px"
                  interactive={false}
                  approximate={true}
                      />
                    ) : (
                <div className="h-full w-full bg-muted/30 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Map location unavailable</p>
                    </div>
                    )}
                  </div>
                </div>

          {/* Sharing Options */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Share this listing</div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleShare}
                className="bg-muted hover:bg-muted/80 rounded-full p-2 transition-colors"
              >
                <Share className="h-5 w-5" />
              </button>

              <button 
                  onClick={() => {
                      toast({
                    title: "Link copied!",
                  });
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="bg-muted hover:bg-muted/80 rounded-full p-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </button>

              <button
                onClick={handleToggleFavorite}
                className={`${
                  isFavorite ? 'bg-pink-100 text-pink-500' : 'bg-muted hover:bg-muted/80'
                } rounded-full p-2 transition-colors`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <h2 className="text-xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
          <div className="relative w-full max-w-4xl h-full max-h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={currentImage || product.image_urls?.[0] || '/placeholder-product.jpg'}
                alt={product.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.image_urls && product.image_urls.length > 1) {
                    const currentIndex = product.image_urls.findIndex(img => img === currentImage);
                    const prevIndex = currentIndex <= 0 ? product.image_urls.length - 1 : currentIndex - 1;
                    setCurrentImage(product.image_urls[prevIndex]);
                  }
                }}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>

            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.image_urls && product.image_urls.length > 1) {
                    const currentIndex = product.image_urls.findIndex(img => img === currentImage);
                    const nextIndex = currentIndex >= product.image_urls.length - 1 ? 0 : currentIndex + 1;
                    setCurrentImage(product.image_urls[nextIndex]);
                  }
                }}
              >
                <ArrowLeft className="h-6 w-6 transform rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
