
import React from "react";
import { TitleStep } from "@/components/sell/TitleStep";
import { CategoryStep } from "@/components/sell/CategoryStep";
import { DetailsStep } from "@/components/sell/DetailsStep";
import { PhotosStep } from "@/components/sell/PhotosStep";
import { ShippingStep } from "@/components/sell/ShippingStep";
import { LocationStep } from "@/components/sell/LocationStep";
import { PreviewStep } from "@/components/sell/PreviewStep";
import { useSellForm } from "@/context/SellFormContext";

interface SellFormStepsProps {
  handleCategoryChange: (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
}

export const SellFormSteps: React.FC<SellFormStepsProps> = ({
  handleCategoryChange,
  handleFileChange,
  removeImage,
  handleSubmit,
  uploading
}) => {
  const { 
    currentStep, 
    setCurrentStep, 
    formData, 
    updateFormData 
  } = useSellForm();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "title":
        return (
          <TitleStep 
            title={formData.title}
            setTitle={(title) => updateFormData({ title })}
            setCurrentStep={setCurrentStep}
          />
        );
      case "category":
        return (
          <CategoryStep 
            title={formData.title}
            category={formData.category}
            subcategory={formData.subcategory}
            subSubcategory={formData.subSubcategory}
            handleCategoryChange={handleCategoryChange}
            setCurrentStep={setCurrentStep}
          />
        );
      case "details":
        return (
          <DetailsStep 
            price={formData.price}
            setPrice={(price) => updateFormData({ price })}
            description={formData.description}
            setDescription={(description) => updateFormData({ description })}
            category={formData.category}
            subcategory={formData.subcategory}
            subSubcategory={formData.subSubcategory}
            variations={formData.variations}
            setVariations={(variations) => updateFormData({ variations })}
            specifications={formData.specifications}
            setSpecifications={(specifications) => updateFormData({ specifications })}
            showBulkListing={formData.showBulkListing || false}
            setShowBulkListing={(showBulkListing) => updateFormData({ showBulkListing })}
            isBulkListing={formData.isBulkListing}
            setIsBulkListing={(isBulkListing) => updateFormData({ isBulkListing })}
            bulkQuantity={formData.bulkQuantity}
            setBulkQuantity={(bulkQuantity) => updateFormData({ bulkQuantity })}
            setCurrentStep={setCurrentStep}
          />
        );
      case "photos":
        return (
          <PhotosStep 
            images={formData.images}
            setImages={(images) => updateFormData({ images })}
            imagePreviewUrls={formData.imagePreviewUrls}
            setImagePreviewUrls={(imagePreviewUrls) => updateFormData({ imagePreviewUrls })}
            setCurrentStep={setCurrentStep}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
          />
        );
      case "shipping":
        return (
          <ShippingStep 
            weight={formData.weight}
            setWeight={(weight) => updateFormData({ weight })}
            shippingOptions={formData.shippingOptions}
            setShippingOptions={(shippingOptions) => updateFormData({ shippingOptions })}
            setCurrentStep={setCurrentStep}
          />
        );
      case "location":
        return (
          <LocationStep 
            location={formData.location}
            setLocation={(location) => updateFormData({ location })}
            coordinates={formData.coordinates}
            setCoordinates={(coordinates) => updateFormData({ coordinates })}
            setCurrentStep={setCurrentStep}
          />
        );
      case "preview":
        return (
          <PreviewStep 
            title={formData.title}
            price={formData.price}
            description={formData.description}
            location={formData.location}
            imagePreviewUrls={formData.imagePreviewUrls}
            specifications={formData.specifications}
            weight={formData.weight}
            coordinates={formData.coordinates}
            shippingOptions={formData.shippingOptions}
            setCurrentStep={setCurrentStep}
            handleSubmit={handleSubmit}
            uploading={uploading}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return renderCurrentStep();
};
