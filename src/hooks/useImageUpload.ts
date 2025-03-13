
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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

  const uploadImages = async (userId: string) => {
    if (!userId) return [];
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}-${i}.${fileExt}`;
        
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
      
      setImageUrls(uploadedUrls);
      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  return { 
    images, 
    setImages, 
    imagePreviewUrls, 
    setImagePreviewUrls,
    imageUrls,
    setImageUrls, 
    uploading,
    setUploading,
    handleFileChange, 
    removeImage,
    uploadImages
  };
};
