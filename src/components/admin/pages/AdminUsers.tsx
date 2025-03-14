
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Ban, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserWithProfile = {
  id: string;
  email: string;
  created_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  role: string;
  status: string;
};

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;

      console.log("Fetched profiles:", profiles);
      console.log("Fetched user roles:", userRoles);

      // Map the data to the format we need
      const mappedUsers = profiles.map((profile) => {
        const role = userRoles?.find(role => role.user_id === profile.id)?.role || 'user';
        
        return {
          id: profile.id,
          email: profile.email || '', // Email is typically not stored in profiles
          created_at: profile.created_at,
          profile: {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          },
          role: role,
          status: 'active' // We'll assume all users are active for now
        };
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again later.");
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: "There was an error loading the user data."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: UserWithProfile) => {
    setSelectedUser(user);
    setEditName(user.profile?.full_name || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast({
        title: "User updated",
        description: "User information has been updated successfully."
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? {...user, profile: {...user.profile, full_name: editName}} 
          : user
      ));
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating the user."
      });
    }
  };

  const handleManageUserRole = (user: UserWithProfile, action: string) => {
    setSelectedUser(user);
    setConfirmAction(action);
    setIsAdminDialogOpen(true);
  };

  const handleConfirmRoleAction = async () => {
    if (!selectedUser) return;
    
    try {
      if (confirmAction === 'make-admin') {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: selectedUser.id, 
            role: 'admin' 
          }, { onConflict: 'user_id,role' });
        
        if (error) throw error;
        
        toast({
          title: "Admin role granted",
          description: `${selectedUser.profile?.full_name || 'User'} is now an admin.`
        });
        
        // Update local state
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? {...user, role: 'admin'} 
            : user
        ));
      } else if (confirmAction === 'remove-admin') {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin');
        
        if (error) throw error;
        
        toast({
          title: "Admin role removed",
          description: `${selectedUser.profile?.full_name || 'User'} is no longer an admin.`
        });
        
        // Update local state
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? {...user, role: 'user'} 
            : user
        ));
      }
      
      setIsAdminDialogOpen(false);
    } catch (error) {
      console.error("Error managing user role:", error);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: "There was an error managing the user role."
      });
    }
  };

  const filteredUsers = users.filter(user => 
    (user.profile?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">View and manage user accounts on the platform</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={fetchUsers} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh Users"}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      {user.profile?.avatar_url && (
                        <img 
                          src={user.profile.avatar_url} 
                          alt={`${user.profile.full_name || 'User'}'s avatar`}
                          className="h-8 w-8 rounded-full mr-3"
                        />
                      )}
                      <div className="font-medium">{user.profile?.full_name || "Unnamed User"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.role !== 'admin' ? (
                        <Button variant="ghost" size="icon" onClick={() => handleManageUserRole(user, 'make-admin')}>
                          <CheckSquare className="h-4 w-4 text-green-500" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleManageUserRole(user, 'remove-admin')}>
                          <Ban className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to user information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Role Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction === 'make-admin' 
                ? 'Are you sure you want to grant admin privileges to this user?' 
                : 'Are you sure you want to remove admin privileges from this user?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmRoleAction}
              variant={confirmAction === 'make-admin' ? 'default' : 'destructive'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
