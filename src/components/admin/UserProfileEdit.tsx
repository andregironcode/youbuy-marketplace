import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

interface UserProfileEditProps {
  userId: string;
  profileData: {
    full_name: string | null;
    username: string | null;
    bio: string | null;
    avatar_url: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
}

export const UserProfileEdit = ({
  userId,
  profileData,
  open,
  onOpenChange,
  onProfileUpdated
}: UserProfileEditProps) => {
  const [fullName, setFullName] = useState(profileData.full_name || "");
  const [username, setUsername] = useState(profileData.username || "");
  const [bio, setBio] = useState(profileData.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profileData.avatar_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      console.log("Updating profile for user:", userId, {
        full_name: fullName,
        username,
        bio,
        avatar_url: avatarUrl
      });
      
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          username,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        } as any)
        .eq("id", userId as any);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "User profile has been updated successfully"
      });
      
      onProfileUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the user profile"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        } as any)
        .eq("id", userId as any);

      if (error) throw error;

      setAvatarUrl("");
      setShowConfirmDelete(false);
      
      toast({
        title: "Avatar removed",
        description: "User avatar has been removed successfully"
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "There was an error removing the user avatar"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = () => {
    const name = fullName || "";
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return "U";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user profile information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2 items-center mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              
              {avatarUrl && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Avatar
                </Button>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter user's full name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="User bio"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user's profile picture?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveAvatar}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Remove Avatar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
