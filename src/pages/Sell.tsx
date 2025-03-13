import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { SellStep, SellFormData } from "@/types/sellForm";
import { TitleStep } from "@/components/sell/TitleStep";
import { CategoryStep } from "@/components/sell/CategoryStep";
import { DetailsStep } from "@/components/sell/DetailsStep";
import { PhotosStep } from "@/components/sell/PhotosStep";
import { ShippingStep } from "@/components/sell/ShippingStep";
import { LocationStep } from "@/components/sell/LocationStep";
import { PreviewStep } from "@/components/sell/PreviewStep";
import { PromoteDialog } from "@/components/sell/PromoteDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Sell = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subSubcategory, setSubSubcategory] = useState("");
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [variations, setVariations] = useState<any[]>([]);
  const [specifications, setSpecifications] = useState<any>({});
  
  const [productStatus, setProductStatus] = useState<'available' | 'reserved'>('available');
  const [reservedUserId, setReservedUserId] = useState("");
  const [reservationDays, setReservationDays] = useState("3");
  
  const [showBulkListing, setShowBulkListing] = useState(false);
  const [isBulkListing, setIsBulkListing] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState("2");
  
  const [weight, setWeight] = useState("");
  const [shippingOptions, setShippingOptions] = useState({
    inPersonMeetup: true,
    platformShipping: true,
    shippingCost: 0
  });
  
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [promotionLevel, setPromotionLevel] = useState<'none' | 'basic' | 'premium' | 'featured'>('none');
  
  const [currentStep, setCurrentStep] = useState<SellStep>("title");
  const [uploading, setUploading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to list items for sale",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);

  const getStepProgress = () => {
    const steps: SellStep[] = ["title", "category", "details", "photos", "shipping", "location", "preview", "promote"];
    const currentIndex = steps.indexOf(currentStep);
    return Math.round((currentIndex / (steps.length - 1)) * 100);
  };

  const handleCategoryChange = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    setCategory(categoryId);
    setSubcategory(subcategoryId || "");
    setSubSubcategory(subSubcategoryId || "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 10) {
      toast({
        title: "Maximum 10 images allowed",
        description: "You can upload a maximum of 10 images per listing",
        variant: "destructive"
      });
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.size <= 5 * 1024 * 1024) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Some files are too large",
        description: `${invalidFiles.join(", ")} ${invalidFiles.length > 1 ? "are" : "is"} larger than 5MB`,
        variant: "destructive"
      });
    }

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      setImages(newImages);

      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  const uploadImages = async () => {
    if (!user) return [];
    
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-${i}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: "Upload error",
          description: "Failed to upload image: " + file.name,
          variant: "destructive"
        });
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
        
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to list items for sale",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please add at least one image of your item",
        variant: "destructive"
      });
      return;
    }

    if (!coordinates) {
      toast({
        title: "Location required",
        description: "Please set a location for your item",
        variant: "destructive"
      });
      return;
    }

    const listingsToCreate = isBulkListing ? parseInt(bulkQuantity) || 1 : 1;
    
    if (listingsToCreate > 1 && variations.length > 0) {
      toast({
        title: "Invalid configuration",
        description: "Bulk listings cannot contain variations. Please choose one or the other.",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const uploadedImageUrls = await uploadImages();
      setImageUrls(uploadedImageUrls);
      
      if (uploadedImageUrls.length === 0) {
        toast({
          title: "Upload error",
          description: "Failed to upload images. Please try again.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      
      const productData = {
        title,
        price,
        description,
        location,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        category,
        subcategory,
        sub_subcategory: subSubcategory,
        image_urls: uploadedImageUrls,
        variations,
        specifications,
        product_status: productStatus,
        reserved_user_id: reservedUserId || null,
        reservation_days: reservationDays,
        is_bulk_listing: isBulkListing,
        bulk_quantity: bulkQuantity,
        weight,
        shipping_options: shippingOptions,
        promotion_level: 'none',
        seller_id: user.id
      };
      
      const { error: insertError, data: insertedProduct } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
        
      if (insertError) {
        console.error('Error inserting product:', insertError);
        toast({
          title: "Error",
          description: "Failed to add product. Please try again.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      
      setShowPromoteDialog(true);
      
      toast({
        title: "Listing created",
        description: isBulkListing 
          ? `${listingsToCreate} items have been listed successfully` 
          : "Your item has been listed successfully",
      });
      
    } catch (error) {
      console.error("Error listing item:", error);
      toast({
        title: "Error",
        description: "Failed to list item for sale. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const completePromotion = async () => {
    setShowPromoteDialog(false);
    
    if (promotionLevel !== 'none') {
      const { error } = await supabase
        .from('products')
        .update({ promotion_level: promotionLevel })
        .eq('title', title)
        .eq('seller_id', user?.id);
        
      if (error) {
        console.error('Error updating promotion:', error);
      } else {
        toast({
          title: "Promotion applied",
          description: `Your listing has been promoted with the ${promotionLevel} package`,
        });
      }
    } else {
      toast({
        title: "Listing published",
        description: "Your item is now listed for sale",
      });
    }
    
    navigate("/profile/products");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "title":
        return (
          <TitleStep 
            title={title}
            setTitle={setTitle}
            setCurrentStep={setCurrentStep}
          />
        );
      case "category":
        return (
          <CategoryStep 
            title={title}
            category={category}
            subcategory={subcategory}
            subSubcategory={subSubcategory}
            handleCategoryChange={handleCategoryChange}
            setCurrentStep={setCurrentStep}
          />
        );
      case "details":
        return (
          <DetailsStep 
            price={price}
            setPrice={setPrice}
            description={description}
            setDescription={setDescription}
            category={category}
            subcategory={subcategory}
            subSubcategory={subSubcategory}
            variations={variations}
            setVariations={setVariations}
            specifications={specifications}
            setSpecifications={setSpecifications}
            showBulkListing={showBulkListing}
            setShowBulkListing={setShowBulkListing}
            isBulkListing={isBulkListing}
            setIsBulkListing={setIsBulkListing}
            bulkQuantity={bulkQuantity}
            setBulkQuantity={setBulkQuantity}
            setCurrentStep={setCurrentStep}
          />
        );
      case "photos":
        return (
          <PhotosStep 
            images={images}
            setImages={setImages}
            imagePreviewUrls={imagePreviewUrls}
            setImagePreviewUrls={setImagePreviewUrls}
            setCurrentStep={setCurrentStep}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
          />
        );
      case "shipping":
        return (
          <ShippingStep 
            weight={weight}
            setWeight={setWeight}
            shippingOptions={shippingOptions}
            setShippingOptions={setShippingOptions}
            setCurrentStep={setCurrentStep}
          />
        );
      case "location":
        return (
          <LocationStep 
            location={location}
            setLocation={setLocation}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            setCurrentStep={setCurrentStep}
          />
        );
      case "preview":
        return (
          <PreviewStep 
            title={title}
            price={price}
            description={description}
            location={location}
            imagePreviewUrls={imagePreviewUrls}
            specifications={specifications}
            weight={weight}
            coordinates={coordinates}
            shippingOptions={shippingOptions}
            setCurrentStep={setCurrentStep}
            handleSubmit={handleSubmit}
            uploading={uploading}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Sell an Item</h1>
              <span className="text-sm text-muted-foreground">{getStepProgress()}% complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
          
          {renderCurrentStep()}
          
          <PromoteDialog 
            open={showPromoteDialog}
            onOpenChange={setShowPromoteDialog}
            promotionLevel={promotionLevel}
            setPromotionLevel={setPromotionLevel}
            onComplete={completePromotion}
          />
        </div>
      </main>
    </div>
  );
};

export default Sell;
