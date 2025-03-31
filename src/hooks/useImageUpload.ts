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
    if (!files || files.length === 0) return;

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
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  const uploadImages = async (userId: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to upload images",
        variant: "destructive"
      });
      return [];
    }
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw bucketsError;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'product-images');
      
      // Only try to create bucket if it doesn't exist
      if (!bucketExists) {
        console.log('Creating product-images bucket');
        const { error } = await supabase.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        });
        
        // If error is not "already exists", then it's a real error
        if (error && !error.message.includes('already exists')) {
          console.error('Error creating bucket:', error);
          throw error;
        }
      }
      
      // Upload each image
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const filePath = `${userId}/${timestamp}-${i}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
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
