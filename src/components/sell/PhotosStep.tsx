
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Image as ImageIcon, X, Info } from "lucide-react";
import { SellStep } from "@/types/sellForm";

interface PhotosStepProps {
  images: File[];
  setImages: (images: File[]) => void;
  imagePreviewUrls: string[];
  setImagePreviewUrls: (urls: string[]) => void;
  setCurrentStep: (step: SellStep) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export const PhotosStep: React.FC<PhotosStepProps> = ({
  images,
  imagePreviewUrls,
  setCurrentStep,
  handleFileChange,
  removeImage,
}) => {
  const isPhotosValid = images.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          Add photos of your item from different angles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-youbuy" />
              Upload at least 4 photos
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              When you show the item from different angles, people appreciate it.
            </p>
          </div>
          
          <div className="border-2 border-dashed rounded-lg p-4">
            {imagePreviewUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={url} 
                      alt={`Product preview ${index + 1}`} 
                      className="h-full w-full object-cover rounded-md"
                    />
                    <Button 
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                        Main photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop images here or click to browse
                </p>
              </div>
            )}
            <div className="mt-2 text-center">
              <input
                type="file"
                id="imageUpload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2"
                onClick={() => document.getElementById('imageUpload')?.click()}
                disabled={images.length >= 10}
              >
                <Upload className="h-4 w-4 mr-2" />
                {imagePreviewUrls.length > 0 ? "Add More Images" : "Upload Images"}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>You can upload up to 10 images (max 5MB each)</p>
            <p>We accept JPG, JPEG, PNG and WebP formats</p>
            <p>You can drag to reorder images - the first image will be the main photo</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("details")}
        >
          Back
        </Button>
        <Button 
          disabled={!isPhotosValid} 
          onClick={() => setCurrentStep("shipping")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
