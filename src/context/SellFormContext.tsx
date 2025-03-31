import React, { createContext, useContext, useState } from "react";
import { SellStep, SellFormData } from "@/types/sellForm";

interface SellFormContextType {
  formData: SellFormData;
  updateFormData: (data: Partial<SellFormData>) => void;
  currentStep: SellStep;
  setCurrentStep: (step: SellStep) => void;
  getStepProgress: () => number;
  showBulkListing: boolean;
  setShowBulkListing: (show: boolean) => void;
}

const SellFormContext = createContext<SellFormContextType | undefined>(undefined);

export const SellFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<SellStep>("title");
  const [showBulkListing, setShowBulkListing] = useState(false);
  
  const [formData, setFormData] = useState<SellFormData>({
    title: "",
    price: "",
    description: "",
    location: "",
    category: "",
    subcategory: "",
    subSubcategory: "",
    images: [],
    imagePreviewUrls: [],
    variations: [],
    specifications: {},
    productStatus: 'available',
    reservedUserId: "",
    reservationDays: "3",
    isBulkListing: false,
    bulkQuantity: "2",
    weight: "",
    shippingOptions: {
      inPersonMeetup: true,
      platformShipping: true,
      shippingCost: 0
    },
    promotionLevel: 'none',
    coordinates: null,
    locationDetails: undefined,
    showBulkListing: false
  });

  const updateFormData = (data: Partial<SellFormData>) => {
    setFormData(prev => {
      // If updating location details, ensure we don't duplicate data
      if (data.locationDetails) {
        return {
          ...prev,
          ...data,
          locationDetails: {
            type: data.locationDetails.type,
            houseNumber: data.locationDetails.houseNumber || undefined,
            buildingName: data.locationDetails.buildingName || undefined,
            apartmentNumber: data.locationDetails.apartmentNumber || undefined,
            floor: data.locationDetails.floor || undefined,
            additionalInfo: data.locationDetails.additionalInfo || undefined
          }
        };
      }
      return { ...prev, ...data };
    });
  };

  const getStepProgress = () => {
    const steps: SellStep[] = ["title", "category", "details", "photos", "shipping", "location", "preview", "promote"];
    const currentIndex = steps.indexOf(currentStep);
    return Math.round((currentIndex / (steps.length - 1)) * 100);
  };

  return (
    <SellFormContext.Provider value={{ 
      formData, 
      updateFormData, 
      currentStep, 
      setCurrentStep,
      getStepProgress,
      showBulkListing,
      setShowBulkListing
    }}>
      {children}
    </SellFormContext.Provider>
  );
};

export const useSellForm = () => {
  const context = useContext(SellFormContext);
  if (context === undefined) {
    throw new Error("useSellForm must be used within a SellFormProvider");
  }
  return context;
};
