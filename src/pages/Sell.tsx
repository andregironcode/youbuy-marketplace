import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, X, Copy, SaveAll } from "lucide-react";
import { CategorySelector } from "@/components/category/CategorySelector";
import { ProductFields } from "@/components/product/ProductFields";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ProductVariation, ProductSpecifications } from "@/types/product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Sell = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subSubcategory, setSubSubcategory] = useState("");
  const [currentStep, setCurrentStep] = useState("category"); // Set initial step to "category"
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecifications>({});
  const [productStatus, setProductStatus] = useState<'available' | 'reserved'>('available');
  const [reservedUserId, setReservedUserId] = useState("");
  const [reservationDays, setReservationDays] = useState("3");
  const [isBulkListing, setIsBulkListing] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState("2");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCategoryChange = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    setCategory(categoryId);
    setSubcategory(subcategoryId || "");
    setSubSubcategory(subSubcategoryId || "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Prevent adding more than 10 images
    if (images.length + files.length > 10) {
      toast({
        title: "Maximum 10 images allowed",
        description: "You can upload a maximum of 10 images per listing",
        variant: "destructive"
      });
      return;
    }

    // Check each file for size (max 5MB)
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.size <= 5 * 1024 * 1024) { // 5MB in bytes
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

      // Create preview URLs for the valid files
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to list items for sale",
        variant: "destructive"
      });
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

    // Calculate how many listings we need to create
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
      // For now, just show a toast as per original functionality
      toast({
        title: isBulkListing ? `${listingsToCreate} items will be listed` : "Listing created",
        description: "Selling functionality will be implemented in the next phase",
      });
      
      // Additional info about the listing configuration
      if (variations.length > 0) {
        console.log("Product variations:", variations);
      }
      
      if (Object.keys(specifications).length > 0) {
        console.log("Product specifications:", specifications);
      }
      
      if (productStatus === 'reserved') {
        console.log("Reserved for user:", reservedUserId);
        console.log("Reserved for days:", reservationDays);
      }
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

  const duplicateForBulkListing = () => {
    // This would prepare multiple listings for submission
    // For now just toggle the bulk listing mode
    setIsBulkListing(!isBulkListing);
  };

  const isDetailsComplete = title && description && category && price && location;
  const canMoveToDetails = category !== "";
  const canMoveToShipping = isDetailsComplete;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Sell an Item</h1>
          
          <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="category" className="flex-1">1. Category</TabsTrigger>
              <TabsTrigger value="details" className="flex-1" disabled={!canMoveToDetails}>2. Details</TabsTrigger>
              <TabsTrigger value="shipping" className="flex-1" disabled={!canMoveToShipping}>3. Shipping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="category">
              <Card>
                <CardHeader>
                  <CardTitle>Select Category</CardTitle>
                  <CardDescription>
                    Choose the most appropriate category for your item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategorySelector 
                    onCategoryChange={handleCategoryChange}
                    selectedCategory={category}
                    selectedSubcategory={subcategory}
                    selectedSubSubcategory={subSubcategory}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    disabled={!category} 
                    onClick={() => setCurrentStep("details")}
                    className="bg-youbuy hover:bg-youbuy-dark"
                  >
                    Continue to Details
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                  <CardDescription>
                    Provide information about what you're selling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium">Basic Information</h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center" 
                          onClick={duplicateForBulkListing}
                        >
                          {isBulkListing ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Cancel Bulk Listing
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Create Bulk Listing
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {isBulkListing && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <Label htmlFor="bulkQuantity">Number of identical items to list</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input 
                            id="bulkQuantity" 
                            type="number" 
                            value={bulkQuantity} 
                            onChange={(e) => setBulkQuantity(e.target.value)}
                            min="2"
                            max="100"
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">identical items</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          This will create multiple identical listings. Each will be shown separately to buyers.
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title"
                        placeholder="What are you selling?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description"
                        placeholder="Describe your item in detail"
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (AED)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        placeholder="Enter price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="Where is the item located?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Photos (up to 10)</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        {imagePreviewUrls.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
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
                                    Cover
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 py-4">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Drag & drop images here or click to browse
                            </p>
                          </div>
                        )}
                        <div className="mt-2">
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
                        <p className="text-xs text-muted-foreground mt-2">
                          You can upload up to 10 images. First image will be the cover (max 5MB each).
                        </p>
                      </div>
                    </div>

                    {/* Product status section */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="status">
                        <AccordionTrigger>Product Status</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="productStatus">Item Status</Label>
                              <Select 
                                value={productStatus} 
                                onValueChange={(value: 'available' | 'reserved') => setProductStatus(value)}
                              >
                                <SelectTrigger id="productStatus">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">Available (Anyone can buy)</SelectItem>
                                  <SelectItem value="reserved">Reserved for specific user</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {productStatus === 'reserved' && (
                              <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                                <div className="space-y-2">
                                  <Label htmlFor="reservedUserId">Reserved for User ID</Label>
                                  <Input 
                                    id="reservedUserId" 
                                    placeholder="Enter user ID" 
                                    value={reservedUserId}
                                    onChange={(e) => setReservedUserId(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="reservationDays">Reserved for Days</Label>
                                  <Select 
                                    value={reservationDays} 
                                    onValueChange={setReservationDays}
                                  >
                                    <SelectTrigger id="reservationDays">
                                      <SelectValue placeholder="Select days" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 day</SelectItem>
                                      <SelectItem value="3">3 days</SelectItem>
                                      <SelectItem value="7">1 week</SelectItem>
                                      <SelectItem value="14">2 weeks</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    After this period, the item will automatically become available to everyone.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Category-specific fields */}
                    {category && !isBulkListing && (
                      <div className="space-y-2">
                        <Label>Category-Specific Details</Label>
                        <ProductFields 
                          category={category} 
                          subcategory={subcategory}
                          subSubcategory={subSubcategory}
                          onVariationsChange={setVariations}
                          initialVariations={variations}
                          onSpecificationsChange={setSpecifications}
                          initialSpecifications={specifications}
                        />
                      </div>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep("category")}
                  >
                    Back
                  </Button>
                  <Button 
                    disabled={!isDetailsComplete} 
                    onClick={() => setCurrentStep("shipping")}
                    className="bg-youbuy hover:bg-youbuy-dark"
                  >
                    Continue to Shipping
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Options</CardTitle>
                  <CardDescription>
                    Set up delivery options for your item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Delivery Method</Label>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:border-youbuy">
                          <input type="checkbox" id="meetup" className="h-4 w-4 text-youbuy" />
                          <Label htmlFor="meetup" className="cursor-pointer">In-person meetup</Label>
                        </div>
                        <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:border-youbuy">
                          <input type="checkbox" id="shipping" className="h-4 w-4 text-youbuy" />
                          <Label htmlFor="shipping" className="cursor-pointer">Shipping</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Item Weight (kg)</Label>
                      <Input id="weight" type="number" placeholder="e.g., 2.5" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Package Dimensions (cm)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input id="length" placeholder="Length" />
                        <Input id="width" placeholder="Width" />
                        <Input id="height" placeholder="Height" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shipping-cost">Shipping Cost (AED)</Label>
                      <Input id="shipping-cost" type="number" placeholder="e.g., 25" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave blank if buyer pays for shipping or for in-person meetup only
                      </p>
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
                    onClick={handleSubmit}
                    disabled={uploading} 
                    className="bg-youbuy hover:bg-youbuy-dark"
                  >
                    {isBulkListing 
                      ? uploading 
                        ? "Creating Listings..." 
                        : `List ${bulkQuantity} Items for Sale`
                      : uploading 
                        ? "Uploading..." 
                        : "List Item for Sale"
                    }
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Sell;

