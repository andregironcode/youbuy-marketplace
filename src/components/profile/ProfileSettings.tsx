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
import { Loader2, User, Mail, Save } from "lucide-react";
import { initializeStorage } from "@/integrations/supabase/storage";

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
    <div className="container mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your profile information and how others see you on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !form.formState.isSubmitting ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Avatar Section */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full overflow-hidden">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={avatarUrl || undefined} alt="Profile" className="object-cover" />
                        <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium mb-1">Profile Picture</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="max-w-xs"
                      />
                      {uploadingAvatar && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a photo to make your profile more personal.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            {...field}
                            icon={<User className="h-4 w-4 text-muted-foreground" />}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Username */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Username" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="you@example.com" 
                            {...field}
                            icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+971 XX XXX XXXX" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dubai, UAE"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Currency */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AED">AED (United Arab Emirates Dirham)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                            <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us a little about yourself" 
                          {...field}
                          className="h-20 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

