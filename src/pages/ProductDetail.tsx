
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Share2, 
  MapPin, 
  MessageCircle, 
  ChevronLeft, 
  AlertCircle,
  Tag,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Eye
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { Card, CardContent } from "@/components/ui/card";
import { SellerReviews } from "@/components/product/SellerReviews";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductType, convertToProductType } from "@/types/product";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { isFavorite, toggleFavorite, isAdding, isRemoving } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const productIsFavorite = isFavorite(id || '');

  // Fetch product data from Supabase
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        console.log("Fetching product with ID:", id);
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            profiles:seller_id(
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching product details:', error);
          setLoading(false);
          return;
        }
        
        console.log("Fetched product data:", data);
        
        if (data) {
          const productData = convertToProductType(data, true);
          setProduct(productData);
          setLikeCount(productData.likeCount || 0);
          setViewCount(productData.viewCount || 0);
        }
      } catch (err) {
        console.error('Error in product fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const productImages = product ? [
    product.image,
    ...(product.images || []),
    ...((!product.images || product.images.length < 3) ? [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca6",
      "https://images.unsplash.com/photo-1507646227500-4d389b0012be"
    ].slice(0, 3 - (product.images?.length || 0)) : [])
  ] : [];

  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to message the seller",
      });
      return;
    }
    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !product) return;
    
    setIsSending(true);
    
    try {
      const sellerId = product.seller.userId;
      
      const { data: existingChats, error: chatQueryError } = await supabase
        .from('chats')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId);
      
      if (chatQueryError) throw chatQueryError;
      
      let chatId;
      
      if (!existingChats || existingChats.length === 0) {
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            product_id: product.id,
            seller_id: sellerId,
            buyer_id: user.id
          })
          .select('id')
          .single();
          
        if (chatError) throw chatError;
        chatId = newChat.id;
      } else {
        chatId = existingChats[0].id;
      }
      
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: sellerId,
          product_id: product.id,
          content: message,
        });
        
      if (msgError) throw msgError;
      
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);
      
      toast({
        title: "Message sent!",
        description: "The seller will be notified of your message."
      });
      
      setMessage("");
      setIsMessageDialogOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    const incrementViewCount = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('view_count')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        const currentViews = data?.view_count || 0;
        setViewCount(currentViews + 1);
        
        await supabase
          .from('products')
          .update({ view_count: currentViews + 1 })
          .eq('id', id);
      } catch (error) {
        console.error('Error updating view count:', error);
      }
    };
    
    incrementViewCount();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!id) return;
    
    try {
      toggleFavorite(id);
      
      if (!productIsFavorite) {
        setLikeCount(prev => prev + 1);
        await supabase
          .from('products')
          .update({ like_count: likeCount + 1 })
          .eq('id', id);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
        await supabase
          .from('products')
          .update({ like_count: Math.max(0, likeCount - 1) })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-pulse space-y-6 w-full max-w-4xl">
              <div className="h-64 bg-gray-200 rounded-lg w-full"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-youbuy mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-6">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={productImages[currentImageIndex]} 
                  alt={`${product.title} - image ${currentImageIndex + 1}`} 
                  className="w-full object-cover aspect-square sm:aspect-[4/3]"
                />
                
                {productImages.length > 1 && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              </div>
              
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-youbuy' : 'border-transparent'
                      }`}
                      onClick={() => selectImage(index)}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <ProductDetails 
                    product={product} 
                    onAddToCart={handleContactSeller}
                  />
                  
                  <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" /> 
                      <span>{viewCount} views</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className={`h-4 w-4 mr-1 ${productIsFavorite ? 'fill-youbuy text-youbuy' : ''}`} /> 
                      <span>{likeCount} likes</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleLikeToggle}
                    disabled={isAdding || isRemoving}
                  >
                    <Heart className={`h-5 w-5 ${productIsFavorite ? 'fill-youbuy text-youbuy' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{product.location}</span>
                <span className="mx-2">•</span>
                <span>{product.timeAgo}</span>
                {product.isNew && (
                  <>
                    <span className="mx-2">•</span>
                    <Badge className="bg-youbuy">New</Badge>
                  </>
                )}
              </div>

              <Card className="border-dashed border-youbuy/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-youbuy" />
                    <span className="font-medium text-youbuy-dark">
                      Category: {product?.category.charAt(0).toUpperCase() + product?.category.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              <div>
                <h2 className="font-medium mb-4">Seller</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={product?.seller.avatar} alt={product?.seller.name} />
                      <AvatarFallback>{product?.seller.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        to={`/seller/${product?.seller.userId || product?.seller.id}`}
                        className="font-medium hover:text-youbuy"
                      >
                        {product?.seller.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">Member since {product?.seller.joinedDate}</p>
                      
                      {product?.seller.rating && (
                        <div className="flex items-center mt-1">
                          <div className="flex mr-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${
                                  star <= product.seller.rating! 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({product.seller.totalReviews || 0})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Link to={`/seller/${product?.seller.userId || product?.seller.id}`}>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </Link>
                </div>
              </div>

              {(product?.seller.userId || product?.seller.id) && (
                <div className="pt-4">
                  <Link 
                    to={`/seller/${product.seller.userId || product.seller.id}?tab=reviews`} 
                    className="flex items-center justify-center text-sm font-medium text-youbuy hover:underline"
                  >
                    <span>View all seller reviews</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                If you suspect this ad is a scam, please report it.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {product.seller.name}</DialogTitle>
            <DialogDescription>
              Send a message about {product.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea 
              placeholder="Write your message here..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-32"
            />
            <Button 
              className="w-full bg-youbuy hover:bg-youbuy-dark"
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
            >
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
