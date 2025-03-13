import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ProductType, ProductSpecifications } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info, ArrowUpToLine, X, Ruler, Shield, TruckReturn, AlertCircle } from "lucide-react";
import { ProductFields } from "@/components/product/ProductFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const productSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price must be a positive number"),
  description: z.string().min(20, "Description must be at least 20 characters").max(640, "Description cannot exceed 640 characters"),
  condition: z.string().optional(),
  width: z.string().optional(),
  depth: z.string().optional(),
  height: z.string().optional(),
  returnPolicy: z.string().optional(),
  warranty: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("€");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [returnPolicy, setReturnPolicy] = useState("");
  const [warranty, setWarranty] = useState("");
  
  // Item measurements
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [height, setHeight] = useState("");
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Specifications
  const [specifications, setSpecifications] = useState<ProductSpecifications>({});
  
  // Setup form with validation
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      price: "",
      description: "",
      condition: "",
      width: "",
      depth: "",
      height: "",
      returnPolicy: "",
      warranty: "",
    },
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to edit products",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          toast({
            title: "Product not found",
            description: "The product you're trying to edit doesn't exist",
            variant: "destructive"
          });
          navigate("/profile/products");
          return;
        }
        
        // Check if user is the owner
        if (data.seller_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You can only edit your own products",
            variant: "destructive"
          });
          navigate("/profile/products");
          return;
        }
        
        // Safely parse specifications - ensure it's an object
        let parsedSpecifications: ProductSpecifications = {};
        if (data.specifications && typeof data.specifications === 'object' && !Array.isArray(data.specifications)) {
          parsedSpecifications = data.specifications as ProductSpecifications;
        }
        
        // Transform database product to match ProductType
        const transformedProduct: ProductType = {
          id: data.id,
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          image: data.image_urls && data.image_urls.length > 0 ? data.image_urls[0] : '/placeholder.svg',
          images: data.image_urls || [],
          location: data.location,
          timeAgo: new Date(data.created_at).toLocaleDateString(),
          status: data.product_status as "available" | "reserved" | "sold",
          createdAt: data.created_at,
          category: data.category,
          subcategory: data.subcategory,
          specifications: parsedSpecifications,
          seller: {
            id: data.seller_id,
            name: "You",
            avatar: "/placeholder.svg",
            joinedDate: new Date().toLocaleDateString(),
          }
        };
        
        setProduct(transformedProduct);
        setSpecifications(parsedSpecifications);
        
        // Set form values
        setTitle(transformedProduct.title);
        setCategory(`${transformedProduct.category}${transformedProduct.subcategory ? ` > ${transformedProduct.subcategory}` : ''}`);
        setSubcategory(transformedProduct.subcategory || "");
        setPrice(transformedProduct.price.toString());
        setDescription(transformedProduct.description);
        setImages(transformedProduct.images || []);
        
        // Set specifications if available
        if (parsedSpecifications) {
          setCondition(parsedSpecifications.condition || "");
          
          if (parsedSpecifications.dimensions) {
            setWidth(parsedSpecifications.dimensions.width?.toString() || "");
            setDepth(parsedSpecifications.dimensions.length?.toString() || "");
            setHeight(parsedSpecifications.dimensions.height?.toString() || "");
          }
          
          // Set return policy and warranty if they exist
          setReturnPolicy(parsedSpecifications.returnPolicy || "");
          setWarranty(parsedSpecifications.warranty || "");
        }

        // Update form values
        form.reset({
          title: transformedProduct.title,
          price: transformedProduct.price.toString(),
          description: transformedProduct.description,
          condition: parsedSpecifications.condition || "",
          width: parsedSpecifications.dimensions?.width?.toString() || "",
          depth: parsedSpecifications.dimensions?.length?.toString() || "",
          height: parsedSpecifications.dimensions?.height?.toString() || "",
          returnPolicy: parsedSpecifications.returnPolicy || "",
          warranty: parsedSpecifications.warranty || "",
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, user, navigate, toast, form]);
  
  // Handle specifications change from ProductFields component
  const handleSpecificationsChange = (newSpecifications: ProductSpecifications) => {
    setSpecifications(newSpecifications);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    if (images.length + newImages.length + files.length > 10) {
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
      const newFileList = [...newImages, ...validFiles];
      setNewImages(newFileList);
      
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setNewImagePreviews([...newImagePreviews, ...newPreviewUrls]);
    }
  };
  
  const removeExistingImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
    
    const updatedPreviews = [...newImagePreviews];
    updatedPreviews.splice(index, 1);
    setNewImagePreviews(updatedPreviews);
  };
  
  const uploadNewImages = async () => {
    if (!user || newImages.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-${i}.${fileExt}`;
      
      try {
        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error in image upload:', error);
      }
    }
    
    return uploadedUrls;
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim() || title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    
    if (description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = form.handleSubmit(async (data) => {
    if (!product || !user) return;
    
    setSaving(true);
    
    try {
      // Upload any new images
      const newUploadedImageUrls = await uploadNewImages();
      
      // Combine existing and new images
      const allImageUrls = [...images, ...newUploadedImageUrls];
      
      // Update specifications with dimensions, return policy, and warranty
      const updatedSpecifications = {
        ...specifications,
        condition: data.condition,
        returnPolicy: data.returnPolicy,
        warranty: data.warranty,
        dimensions: {
          width: data.width ? parseFloat(data.width) : undefined,
          length: data.depth ? parseFloat(data.depth) : undefined,
          height: data.height ? parseFloat(data.height) : undefined
        }
      };
      
      const { error } = await supabase
        .from('products')
        .update({
          title: data.title,
          description: data.description,
          price: data.price,
          image_urls: allImageUrls,
          specifications: updatedSpecifications
        })
        .eq('id', product.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully"
      });
      
      // Clean up image preview URLs
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      navigate("/profile/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  });
  
  const handleSave = () => {
    form.handleSubmit(onSubmit)();
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium">Product not found</h2>
        <p className="text-muted-foreground mt-2">This product may have been removed</p>
        <Button className="mt-4" onClick={() => navigate("/profile/products")}>
          Back to products
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Edit Product</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate("/profile/products")}>
            Cancel
          </Button>
          <Button 
            className="bg-youbuy hover:bg-youbuy/90" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Item information</CardTitle>
                <CardDescription>Edit the basic details of your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Samsung Galaxy S21 Ultra 5G 128GB"
                          error={form.formState.errors.title?.message}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a title that will help buyers find your product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category and subcategory</Label>
                  <Select disabled value="category">
                    <SelectTrigger id="category">
                      <SelectValue placeholder={category || "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">{category}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    To change category, please create a new listing
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            error={form.formState.errors.price?.message}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="€">€ (Euro)</SelectItem>
                        <SelectItem value="$">$ (USD)</SelectItem>
                        <SelectItem value="£">£ (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your item in detail"
                          rows={4}
                          error={form.formState.errors.description?.message}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Add relevant information such as condition, model, color...</span>
                        <span>{field.value?.length || 0}/640</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Item specifications</CardTitle>
                <CardDescription>Add detailed specifications about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Condition</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like new</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="salvage">For parts or not working</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <Label>Item dimensions</Label>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Width in cm</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              placeholder="Width"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="depth"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Depth in cm</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              placeholder="Depth"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Height in cm</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              placeholder="Height"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Category-specific fields rendered by ProductFields component */}
                <ProductFields 
                  category={product.category} 
                  subcategory={subcategory}
                  onSpecificationsChange={handleSpecificationsChange}
                  initialSpecifications={specifications}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>Upload clear photos from different angles</CardDescription>
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
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {/* Existing images */}
                    {images.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group aspect-square">
                        <img 
                          src={url} 
                          alt={`Product ${index + 1}`} 
                          className="h-full w-full object-cover rounded-md"
                        />
                        <Button 
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && images.length > 0 && (
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                            Main photo
                          </span>
                        )}
                      </div>
                    ))}
                    
                    {/* New image previews */}
                    {newImagePreviews.map((url, index) => (
                      <div key={`new-${index}`} className="relative group aspect-square">
                        <img 
                          src={url} 
                          alt={`New upload ${index + 1}`} 
                          className="h-full w-full object-cover rounded-md"
                        />
                        <Button 
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Upload placeholder */}
                    {images.length + newImages.length < 10 && (
                      <div 
                        className="border-2 border-dashed rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        <ArrowUpToLine className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Add photo</span>
                        <input 
                          type="file" 
                          id="photo-upload" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    You can upload up to 10 images (max 5MB each)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Return Policy & Warranty</CardTitle>
                <CardDescription>Set your policies to build buyer confidence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium flex items-center">
                      <TruckReturn className="h-4 w-4 mr-2 text-youbuy" />
                      Return and warranty information
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clear policies help buyers make confident purchase decisions
                    </p>
                  </div>
                
                  <FormField
                    control={form.control}
                    name="returnPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TruckReturn className="h-4 w-4" />
                          Return Policy
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="e.g., Returns accepted within 14 days if item is in original condition"
                          />
                        </FormControl>
                        <FormDescription>
                          Describe your return policy including any conditions or timeframes
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="warranty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Warranty Information
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="e.g., 30-day warranty on all electrical components"
                          />
                        </FormControl>
                        <FormDescription>
                          If your item includes a warranty, describe the terms here
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                
                  <div className="p-3 border border-amber-200 rounded-md bg-amber-50 text-amber-800 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Important note:</p>
                        <p className="mt-1">
                          Make sure your policies comply with local consumer protection laws. Clear and fair
                          policies can help you avoid disputes and improve your seller rating.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Form>
      
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate("/profile/products")}>
          Cancel
        </Button>
        <Button 
          className="bg-youbuy hover:bg-youbuy/90" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

