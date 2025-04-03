import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Save, Shield, Bell, CreditCard, UserCircle, Settings } from "lucide-react";
import { initializeStorage } from "@/integrations/supabase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// Define the form schema for validation
const ProfileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().max(300, "Bio must be less than 300 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  avatar_url: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z.string().optional(),
  currency: z.string().min(1, "Please select a currency"),
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Set up form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      location: "",
      avatar_url: "",
      email: "",
      phone: "",
      currency: "AED",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    async function getProfile() {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (profile) {
          // Update form values
          form.reset({
            username: profile.username || "",
            full_name: profile.full_name || "",
            bio: profile.bio || "",
            location: profile.location || "",
            avatar_url: profile.avatar_url || "",
            email: user.email || "",
            phone: profile.phone || "",
            currency: profile.currency || "AED",
          });

          // Set avatar URL with timestamp to prevent caching
          setAvatarUrl(profile.avatar_url ? `${profile.avatar_url}?t=${Date.now()}` : null);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Could not load profile information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [user, form, toast]);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log('Starting avatar upload...');
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Ensure storage is initialized
      console.log('Initializing storage...');
      const storageInitialized = await initializeStorage();
      if (!storageInitialized) {
        throw new Error('Storage service is not available. Please check your Supabase configuration.');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/avatar.${fileExt}`;
      console.log('Uploading to path:', filePath);

      // Delete old avatar if exists
      if (avatarUrl) {
        console.log('Deleting old avatar:', avatarUrl);
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('user-uploaded-avatars')
            .remove([oldPath])
            .catch(console.error); // Ignore errors for old file deletion
        }
      }

      // Upload the file
      console.log('Uploading file...');
      const { error: uploadError } = await supabase.storage
        .from('user-uploaded-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing files
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        if (uploadError.message.includes('File size limit exceeded')) {
          throw new Error('File size is too large. Maximum size is 5MB.');
        } else if (uploadError.message.includes('permission denied')) {
          throw new Error('You do not have permission to upload files. Please try logging in again.');
        } else if (uploadError.message.includes('bucket not found')) {
          throw new Error('Storage bucket not found. Please check your Supabase configuration.');
        }
        throw uploadError;
      }

      // Get the public URL
      console.log('Getting public URL...');
      const { data } = supabase.storage
        .from('user-uploaded-avatars')
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      // Add a timestamp to force image refresh
      const publicUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;
      console.log('Upload successful, URL:', publicUrlWithTimestamp);

      // Update the avatar URL in the form and state
      form.setValue('avatar_url', data.publicUrl);
      setAvatarUrl(publicUrlWithTimestamp);
      
      // Update the profile in the database with the new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('Failed to update profile with new avatar');
      }

      // Update user metadata with the new avatar URL
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        }
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
        // Don't throw error here as the profile update was successful
      }

      // Refresh the auth state to ensure the new avatar is available immediately
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
        if (!refreshError && refreshedUser) {
          // The auth context will automatically update with the new user data
          console.log('User data refreshed with new avatar');
        }
      }
      
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      let errorMessage = "There was an error uploading your avatar";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error object
        const supabaseError = error as { message?: string; error?: string };
        errorMessage = supabaseError.message || supabaseError.error || errorMessage;
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update profile data
      const { error } = await supabase
        .from("profiles")
        .update({
          username: data.username,
          full_name: data.full_name,
          bio: data.bio,
          location: data.location,
          avatar_url: data.avatar_url,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      // Update email if changed
      if (data.email && data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) {
          throw emailError;
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate initials for avatar fallback
  const getInitials = () => {
    const fullName = form.watch("full_name") || "";
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return "U";
  };

  return (
    <div className="flex-1 -mt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Payments</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-0">
          <div className="bg-white rounded-md p-8">
            <h2 className="text-xl font-bold mb-2">Profile Information</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Update your profile information and how others see you on the platform.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar upload section */}
                  <div className="flex-shrink-0">
                    <div className="text-sm font-medium mb-2">Profile Picture</div>
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24 border-2 border-muted">
                        <AvatarImage src={avatarUrl || undefined} alt={form.getValues("full_name")} />
                        <AvatarFallback className="text-lg bg-green-100 text-green-800">
                          {uploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin" /> : getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                          <div className="rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-100">
                            Change Avatar
                          </div>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile form fields */}
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Username" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your public username.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email" {...field} readOnly />
                          </FormControl>
                          <FormDescription>
                            Contact support to change your email address.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a little about yourself"
                              className="resize-none h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/300 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AED">AED (Arab Emirates Dirham)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This is the currency that will be used throughout the platform.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading || uploadingAvatar} 
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">New Messages</div>
                        <div className="text-sm text-muted-foreground">
                          Receive emails when someone sends you a message
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Order Updates</div>
                        <div className="text-sm text-muted-foreground">
                          Get notified about status changes to your orders
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Promotions & Offers</div>
                        <div className="text-sm text-muted-foreground">
                          Receive emails about new products, features and offers
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and transaction history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-100 p-2 rounded-md">
                      <CreditCard className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <Button variant="outline" className="w-full">Add Payment Method</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Change Password</h3>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Current Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">New Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Confirm Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline">Set Up Two-Factor</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Activity</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View your recent account activity and sessions.
                  </p>
                  <Button variant="outline">View Activity Log</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

