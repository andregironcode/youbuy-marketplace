
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, X, Copy, MapPin, ArrowRight, Check, Info, Package, Scale, UserRound } from "lucide-react";
import { CategorySelector } from "@/components/category/CategorySelector";
import { ProductFields } from "@/components/product/ProductFields";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ProductVariation, ProductSpecifications } from "@/types/product";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type SellStep = 
  | "title" 
  | "category" 
  | "details" 
  | "photos" 
  | "shipping" 
  | "location" 
  | "preview" 
  | "promote";

const Sell = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subSubcategory, setSubSubcategory] = useState("");
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecifications>({});
  
  const [productStatus, setProductStatus] = useState<'available' | 'reserved'>('available');
  const [reservedUserId, setReservedUserId] = useState("");
  const [reservationDays, setReservationDays] = useState("3");
  
  const [showBulkListing, setShowBulkListing] = useState(false);
  const [isBulkListing, setIsBulkListing] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState("2");
  
  const [weight, setWeight] = useState("");
  const [shippingOptions, setShippingOptions] = useState({
    inPersonMeetup: true,
    shipping: false,
    shippingCost: 0
  });
  
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [promotionLevel, setPromotionLevel] = useState<'none' | 'basic' | 'premium' | 'featured'>('none');
  
  const [currentStep, setCurrentStep] = useState<SellStep>("title");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();

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

  const completePromotion = () => {
    setShowPromoteDialog(false);
    
    if (promotionLevel !== 'none') {
      toast({
        title: "Promotion applied",
        description: `Your listing has been promoted with the ${promotionLevel} package`,
      });
    } else {
      toast({
        title: "Listing published",
        description: "Your item is now listed for sale",
      });
    }
    
    window.location.href = "/";
  };

  const isTitleValid = title.length >= 5 && title.length <= 50;
  const isCategoryValid = category !== "";
  const isPriceValid = parseFloat(price) > 0;
  const isDescriptionValid = description.length >= 20;
  const isDetailsValid = isPriceValid;
  const isPhotosValid = images.length > 0;
  const isShippingValid = weight !== "";
  const isLocationValid = location !== "";

  const renderTitleStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Item details</CardTitle>
        <CardDescription>
          What are you selling? Provide a clear and concise title
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product title</Label>
            <Input 
              id="title"
              placeholder="e.g., Samsung Galaxy S21 Ultra 5G 128GB"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={50}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Example: Three-seater red velvet sofa</span>
              <span>{title.length}/50</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          disabled={!isTitleValid} 
          onClick={() => setCurrentStep("category")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderCategoryStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Select Category</CardTitle>
        <CardDescription>
          Choose the most appropriate category for your item
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Suggested categories</h3>
          <div className="space-y-2">
            <button 
              className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
              onClick={() => {
                if (title.toLowerCase().includes("phone") || title.toLowerCase().includes("iphone")) {
                  handleCategoryChange("mobile", "phones");
                  setCurrentStep("details");
                }
              }}
            >
              <div className="mr-3 text-gray-500">📱</div>
              <div>
                <div className="font-medium">Smartphones</div>
                <div className="text-sm text-muted-foreground">Phones: mobiles & smartwatches</div>
              </div>
            </button>
            <button 
              className="w-full flex items-center p-3 border rounded-md hover:border-youbuy text-left"
              onClick={() => {
                if (title.toLowerCase().includes("laptop") || title.toLowerCase().includes("computer")) {
                  handleCategoryChange("electronics", "computers");
                  setCurrentStep("details");
                }
              }}
            >
              <div className="mr-3 text-gray-500">💻</div>
              <div>
                <div className="font-medium">Laptops & Computers</div>
                <div className="text-sm text-muted-foreground">Electronics & technology</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Or select from all categories</h3>
          <CategorySelector 
            onCategoryChange={handleCategoryChange}
            selectedCategory={category}
            selectedSubcategory={subcategory}
            selectedSubSubcategory={subSubcategory}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("title")}
        >
          Back
        </Button>
        <Button 
          disabled={!isCategoryValid} 
          onClick={() => setCurrentStep("details")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderDetailsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Item information</CardTitle>
        <CardDescription>
          Provide details about your item to help it sell faster
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Be reasonable...</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="AED">
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              maxLength={640}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Add relevant information such as condition, model, color...</span>
              <span>{description.length}/640</span>
            </div>
          </div>
          
          {category && (
            <div className="pt-2 border-t">
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
          
          <div className="flex items-center space-x-2 pt-4 border-t">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium">List multiple identical items</h3>
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Premium</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBulkListing(!showBulkListing)}
              className="ml-auto"
            >
              {showBulkListing ? "Hide" : "Show"}
            </Button>
          </div>
          
          {showBulkListing && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
              <div className="flex items-start gap-2 mb-3">
                <Info className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                <p className="text-sm">Bulk listing is a premium feature that allows you to list multiple identical items at once.</p>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <Switch 
                  id="bulk-listing"
                  checked={isBulkListing}
                  onCheckedChange={setIsBulkListing}
                />
                <Label htmlFor="bulk-listing">Enable bulk listing</Label>
              </div>
              
              {isBulkListing && (
                <div className="mt-3 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="bulkQuantity">Number of items</Label>
                    <Input 
                      id="bulkQuantity" 
                      type="number" 
                      value={bulkQuantity} 
                      onChange={(e) => setBulkQuantity(e.target.value)}
                      min="2"
                      max="100"
                      className="w-24"
                    />
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
                    Each item will be listed separately
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("category")}
        >
          Back
        </Button>
        <Button 
          disabled={!isDetailsValid} 
          onClick={() => setCurrentStep("photos")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderPhotosStep = () => (
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

  const renderShippingStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
        <CardDescription>
          Provide shipping details to help with delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 mb-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <p className="text-sm">Shipping is provided by our platform. We just need some details about your item.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-gray-500" />
              <Label>How much does the item weigh?</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Choose the weight range corresponding to your item. Please consider the weight of the packaging too.
            </p>
            
            <RadioGroup value={weight} onValueChange={setWeight} className="space-y-2">
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-1" id="weight-1" />
                  <Label htmlFor="weight-1">0 to 1 kg</Label>
                </div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-2" id="weight-2" />
                  <Label htmlFor="weight-2">1 to 2 kg</Label>
                </div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2-5" id="weight-3" />
                  <Label htmlFor="weight-3">2 to 5 kg</Label>
                </div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5-10" id="weight-4" />
                  <Label htmlFor="weight-4">5 to 10 kg</Label>
                </div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10-20" id="weight-5" />
                  <Label htmlFor="weight-5">10 to 20 kg</Label>
                </div>
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="20+" id="weight-6" />
                  <Label htmlFor="weight-6">Over 20 kg</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              <Label>Package Dimensions (cm)</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Enter the approximate dimensions of your packaged item
            </p>
            <div className="grid grid-cols-3 gap-3 pl-7">
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Input id="length" placeholder="cm" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input id="width" placeholder="cm" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input id="height" placeholder="cm" type="number" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-gray-500" />
              <Label>Additional delivery option</Label>
            </div>
            <div className="space-y-2 pl-7">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="meetup" 
                  checked={shippingOptions.inPersonMeetup}
                  onCheckedChange={(checked) => setShippingOptions({...shippingOptions, inPersonMeetup: checked})}
                />
                <Label htmlFor="meetup">I also want to offer in-person meetup</Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("photos")}
        >
          Back
        </Button>
        <Button 
          disabled={!isShippingValid} 
          onClick={() => setCurrentStep("location")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderLocationStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Your products are in:</CardTitle>
        <CardDescription>
          This is where potential buyers will see your item located
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location" 
                placeholder="Enter address or area"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-muted h-48 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Map preview would appear here</p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            This is the spot where your profile is located. We will show all your products here.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("shipping")}
        >
          Back
        </Button>
        <Button 
          disabled={!isLocationValid} 
          onClick={() => setCurrentStep("preview")}
          className="bg-youbuy hover:bg-youbuy-dark"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderPreviewStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Preview Your Listing</CardTitle>
        <CardDescription>
          Review your item details before publishing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border rounded-lg overflow-hidden">
            {imagePreviewUrls.length > 0 && (
              <div className="aspect-video relative">
                <img 
                  src={imagePreviewUrls[0]} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4 space-y-4">
              <h3 className="text-xl font-semibold">{title}</h3>
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">{price ? `AED ${price}` : ''}</span>
                <span className="text-sm text-muted-foreground">{location}</span>
              </div>
              
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm mt-1">{description}</p>
              </div>
              
              {Object.keys(specifications).length > 0 && (
                <div>
                  <h4 className="font-medium">Specifications</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
                    {specifications.brand && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Brand:</span>
                        <span className="text-sm">{specifications.brand}</span>
                      </div>
                    )}
                    {specifications.condition && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Condition:</span>
                        <span className="text-sm">{specifications.condition}</span>
                      </div>
                    )}
                    {specifications.model && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Model:</span>
                        <span className="text-sm">{specifications.model}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium">Shipping</h4>
                <div className="text-sm mt-1">
                  {shippingOptions.inPersonMeetup && <p>✓ In-person meetup</p>}
                  {shippingOptions.shipping && (
                    <p>✓ Shipping {shippingOptions.shippingCost ? `(AED ${shippingOptions.shippingCost})` : '(Buyer pays)'}</p>
                  )}
                  {weight && <p>Weight: {weight} kg</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("location")}
        >
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => {}}>
            How does it look?
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={uploading} 
            className="bg-youbuy hover:bg-youbuy-dark"
          >
            {uploading ? "Publishing..." : "Post Ad"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const renderPromoteDialog = () => (
    <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Promote Your Listing</DialogTitle>
          <DialogDescription>
            Get more visibility for your listing with one of our promotion packages
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${promotionLevel === 'none' ? 'border-youbuy bg-muted/20' : ''}`}
            onClick={() => setPromotionLevel('none')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${promotionLevel === 'none' ? 'border-youbuy' : 'border-muted-foreground'}`}>
                  {promotionLevel === 'none' && <Check className="h-3 w-3 text-youbuy" />}
                </div>
                <h3 className="font-medium">Standard Listing</h3>
              </div>
              <span className="font-medium">Free</span>
            </div>
            <p className="text-sm text-muted-foreground ml-7 mt-1">
              Regular listing with standard visibility
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${promotionLevel === 'basic' ? 'border-youbuy bg-muted/20' : ''}`}
            onClick={() => setPromotionLevel('basic')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${promotionLevel === 'basic' ? 'border-youbuy' : 'border-muted-foreground'}`}>
                  {promotionLevel === 'basic' && <Check className="h-3 w-3 text-youbuy" />}
                </div>
                <h3 className="font-medium">Basic Promotion</h3>
              </div>
              <span className="font-medium">AED 10</span>
            </div>
            <p className="text-sm text-muted-foreground ml-7 mt-1">
              Featured in search results for 3 days
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${promotionLevel === 'premium' ? 'border-youbuy bg-muted/20' : ''}`}
            onClick={() => setPromotionLevel('premium')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${promotionLevel === 'premium' ? 'border-youbuy' : 'border-muted-foreground'}`}>
                  {promotionLevel === 'premium' && <Check className="h-3 w-3 text-youbuy" />}
                </div>
                <h3 className="font-medium">Premium Promotion</h3>
              </div>
              <span className="font-medium">AED 25</span>
            </div>
            <p className="text-sm text-muted-foreground ml-7 mt-1">
              Top of search results and homepage feature for 7 days
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${promotionLevel === 'featured' ? 'border-youbuy bg-muted/20' : ''}`}
            onClick={() => setPromotionLevel('featured')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${promotionLevel === 'featured' ? 'border-youbuy' : 'border-muted-foreground'}`}>
                  {promotionLevel === 'featured' && <Check className="h-3 w-3 text-youbuy" />}
                </div>
                <h3 className="font-medium">Featured Promotion</h3>
              </div>
              <span className="font-medium">AED 50</span>
            </div>
            <p className="text-sm text-muted-foreground ml-7 mt-1">
              Premium visibility plus category feature and alert notifications to potential buyers for 14 days
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setPromotionLevel('none')}>
            Skip promotion
          </Button>
          <Button 
            onClick={completePromotion}
            className="bg-youbuy hover:bg-youbuy-dark"
          >
            {promotionLevel === 'none' ? 'Publish Without Promotion' : 'Confirm & Pay'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Sell an Item</h1>
              <span className="text-sm text-muted-foreground">{getStepProgress()}% complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
          
          {currentStep === "title" && renderTitleStep()}
          {currentStep === "category" && renderCategoryStep()}
          {currentStep === "details" && renderDetailsStep()}
          {currentStep === "photos" && renderPhotosStep()}
          {currentStep === "shipping" && renderShippingStep()}
          {currentStep === "location" && renderLocationStep()}
          {currentStep === "preview" && renderPreviewStep()}
          
          {renderPromoteDialog()}
        </div>
      </main>
    </div>
  );
};

export default Sell;
