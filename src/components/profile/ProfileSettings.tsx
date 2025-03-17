
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Define the form schema for validation
const ProfileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().max(300, "Bio must be less than 300 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  avatar_url: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z.string().optional(),
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

          // Set avatar URL
          setAvatarUrl(profile.avatar_url);
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
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random()}.${fileExt}`;

      // Check if the user-uploaded-avatars bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'user-uploaded-avatars');
      
      if (!bucketExists) {
        // Create the bucket
        await supabase.storage.createBucket('user-uploaded-avatars', {
          public: true,
        });
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('user-uploaded-avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('user-uploaded-avatars')
        .getPublicUrl(filePath);

      // Update the avatar URL in the form
      const newAvatarUrl = data.publicUrl;
      form.setValue('avatar_url', newAvatarUrl);
      setAvatarUrl(newAvatarUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar",
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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your profile information and how others see you on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !form.formState.isSubmitting ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                      <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-grow space-y-2">
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="max-w-xs"
                      />
                      {uploadingAvatar && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a photo to make your profile more personal.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
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
                            placeholder="username" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed on your public profile
                        </FormDescription>
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
                        <FormDescription>
                          Used for notifications and account recovery
                        </FormDescription>
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
                        <FormDescription>
                          Used for account verification (optional)
                        </FormDescription>
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
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Write a short description about yourself
                      </FormDescription>
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
