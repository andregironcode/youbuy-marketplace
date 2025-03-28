import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { SellFormProvider, useSellForm } from "@/context/SellFormContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import { publishProduct, updatePromotionLevel } from "@/utils/productUtils";
import { SellFormSteps } from "@/components/sell/SellFormSteps";
import { PromoteDialog } from "@/components/sell/PromoteDialog";
import { useNavigate } from "react-router-dom";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { useCategoryToggle } from "@/hooks/useCategoryToggle";

const SellContent = () => {
  const { 
    formData, 
    updateFormData, 
    currentStep, 
    getStepProgress 
  } = useSellForm();
  
  const { 
    images, 
    setImages,
    imagePreviewUrls,
    setImagePreviewUrls,
    handleFileChange, 
    removeImage,
    uploadImages,
    uploading, 
    setUploading 
  } = useImageUpload();
  
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const { showCategories, setShowCategories } = useCategoryToggle();
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sync image state with form data
  useEffect(() => {
    updateFormData({ 
      images: images,
      imagePreviewUrls: imagePreviewUrls
    });
  }, [images, imagePreviewUrls, updateFormData]);

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

  const handleCategoryChange = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    updateFormData({
      category: categoryId,
      subcategory: subcategoryId || "",
      subSubcategory: subSubcategoryId || ""
    });
  };

  const handleCategorySelect = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    if (categoryId === "all") {
      navigate("/");
    } else if (subSubcategoryId) {
      navigate(`/category/${categoryId}/${subcategoryId}/${subSubcategoryId}`);
    } else if (subcategoryId) {
      navigate(`/category/${categoryId}/${subcategoryId}`);
    } else {
      navigate(`/category/${categoryId}`);
    }
    
    setShowCategories(false);
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

    if (!formData.coordinates) {
      toast({
        title: "Location required",
        description: "Please set a location for your item",
        variant: "destructive"
      });
      return;
    }

    const listingsToCreate = formData.isBulkListing ? parseInt(formData.bulkQuantity) || 1 : 1;
    
    if (listingsToCreate > 1 && formData.variations.length > 0) {
      toast({
        title: "Invalid configuration",
        description: "Bulk listings cannot contain variations. Please choose one or the other.",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const uploadedImageUrls = await uploadImages(user.id);
      
      if (uploadedImageUrls.length === 0) {
        toast({
          title: "Upload error",
          description: "Failed to upload images. Please try again.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      
      await publishProduct(formData, user.id, uploadedImageUrls);
      
      setShowPromoteDialog(true);
      
      toast({
        title: "Listing created",
        description: formData.isBulkListing 
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
    
    if (formData.promotionLevel !== 'none') {
      try {
        await updatePromotionLevel(formData.title, user?.id || "", formData.promotionLevel);
        
        toast({
          title: "Promotion applied",
          description: `Your listing has been promoted with the ${formData.promotionLevel} package`,
        });
      } catch (error) {
        console.error('Error updating promotion:', error);
        toast({
          title: "Promotion error",
          description: "Failed to apply promotion. Your listing is still published.",
          variant: "destructive"
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

  return (
    <div className="flex flex-col min-h-screen">
      <CategoryBrowser 
        open={showCategories} 
        onOpenChange={setShowCategories} 
        onSelectCategory={handleCategorySelect} 
      />
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Sell an Item</h1>
              <span className="text-sm text-muted-foreground">{getStepProgress()}% complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2 bg-gray-100" />
          </div>
          
          <SellFormSteps
            handleCategoryChange={handleCategoryChange}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
            handleSubmit={handleSubmit}
            uploading={uploading}
          />
          
          <PromoteDialog 
            open={showPromoteDialog}
            onOpenChange={setShowPromoteDialog}
            promotionLevel={formData.promotionLevel}
            setPromotionLevel={(level) => updateFormData({ promotionLevel: level })}
            onComplete={completePromotion}
          />
        </div>
      </main>
    </div>
  );
};

const Sell = () => {
  return (
    <SellFormProvider>
      <SellContent />
    </SellFormProvider>
  );
};

export default Sell;
