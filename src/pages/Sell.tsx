
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon } from "lucide-react";
import { CategorySelector } from "@/components/category/CategorySelector";
import { ProductFields } from "@/components/product/ProductFields";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Sell = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subSubcategory, setSubSubcategory] = useState("");
  const [currentStep, setCurrentStep] = useState("details");
  const { toast } = useToast();

  const handleCategoryChange = (categoryId: string, subcategoryId?: string, subSubcategoryId?: string) => {
    setCategory(categoryId);
    setSubcategory(subcategoryId || "");
    setSubSubcategory(subSubcategoryId || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Coming soon",
      description: "Selling functionality will be implemented in the next phase",
    });
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
                      <Label>Photos</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Drag & drop images here or click to browse
                          </p>
                          <Button variant="secondary" size="sm" className="mt-2">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Images
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        You can upload up to 10 images. First image will be the cover (max 5MB each).
                      </p>
                    </div>

                    {/* Category-specific fields */}
                    {category && (
                      <div className="space-y-2">
                        <Label>Category-Specific Details</Label>
                        <ProductFields 
                          category={category} 
                          subcategory={subcategory}
                          subSubcategory={subSubcategory}
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
                    className="bg-youbuy hover:bg-youbuy-dark"
                  >
                    List Item for Sale
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
