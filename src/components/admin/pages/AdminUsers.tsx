import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Ban, CheckSquare, Filter, Download, AlertCircle, UserPlus, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserProfileEdit } from "@/components/admin/UserProfileEdit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserWithProfile = {
  id: string;
  email: string;
  created_at: string;
  profile: {
    full_name: string | null;
    username: string | null;
    bio: string | null;
    avatar_url: string | null;
  } | null;
  role: string;
  status: string;
  is_banned?: boolean;
};

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersWithBanStatus();
  }, []);

  const fetchUsersWithBanStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: profilesWithBan, error: profilesError } = await supabase
        .from('profiles')
        .select('*, banned:banned');
      
      if (profilesError) throw profilesError;
      
      if (profilesWithBan && profilesWithBan.length > 0) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        const usersWithRoles = await Promise.all(
          profilesWithBan.map(async (profile) => {
            const { data: isAdmin, error: adminCheckError } = await supabase
              .rpc('is_admin', { user_uuid: profile.id });
            
            if (adminCheckError) {
              console.error("Error checking admin status:", adminCheckError);
            }
            
            const isCurrentUser = currentUser?.id === profile.id;
            const email = isCurrentUser 
              ? currentUser.email 
              : `user-${profile.id.substring(0, 8)}@example.com`;
            
            return {
              id: profile.id,
              email: email || '',
              created_at: profile.created_at || '',
              profile: {
                full_name: profile.full_name || null,
                username: profile.username || null,
                bio: profile.bio || null,
                avatar_url: profile.avatar_url || null
              },
              role: isAdmin ? 'admin' : 'user',
              status: profile.banned ? 'banned' : 'active',
              is_banned: profile.banned || false
            };
          })
        );
        
        setUsers(usersWithRoles);
      } else {
        setUsers([]);
      }
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

  const handleEditProfile = (user: UserWithProfile) => {
    setSelectedUser(user);
    setIsProfileDialogOpen(true);
  };

  const handleProfileUpdated = () => {
    fetchUsersWithBanStatus();
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
        const { data, error } = await supabase
          .rpc('assign_admin_role', { 
            target_user_id: selectedUser.id 
          });
        
        if (error) throw error;
        
        if (data) {
          toast({
            title: "Admin role granted",
            description: `${selectedUser.profile?.full_name || 'User'} is now an admin.`
          });
          
          setUsers(users.map(user => 
            user.id === selectedUser.id 
              ? {...user, role: 'admin'} 
              : user
          ));
        } else {
          toast({
            variant: "destructive",
            title: "Permission denied",
            description: "You don't have permission to assign admin roles."
          });
        }
      } else if (confirmAction === 'remove-admin') {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin');
        
        if (error) {
          console.error("Error removing admin role:", error);
          throw new Error("Permission denied or role doesn't exist");
        }
        
        toast({
          title: "Admin role removed",
          description: `${selectedUser.profile?.full_name || 'User'} is no longer an admin.`
        });
        
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
        description: error instanceof Error ? error.message : "There was an error managing the user role."
      });
    }
  };

  const handleExportUsers = () => {
    try {
      const headers = ["Name", "Email", "Role", "Status", "Join Date"];
      const csvRows = [headers];
      
      filteredUsers.forEach(user => {
        csvRows.push([
          user.profile?.full_name || "Unnamed User",
          user.email,
          user.role,
          user.status,
          new Date(user.created_at).toLocaleDateString()
        ]);
      });
      
      const csvContent = csvRows.map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `youbuy-users-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "User data has been exported to CSV."
      });
    } catch (error) {
      console.error("Error exporting users:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting the user data."
      });
    }
  };

  const resetFilters = () => {
    setFilterRole(null);
    setFilterStatus(null);
    setSearchTerm("");
  };

  const filteredUsers = users.filter(user => 
    (user.profile?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.profile?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(user => 
    filterRole ? user.role === filterRole : true
  ).filter(user => 
    filterStatus ? user.status === filterStatus : true
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">View and manage user accounts on the platform</p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setFilterRole('admin')}>
                Admin Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterRole('user')}>
                Regular Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                Active Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetFilters}>
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleExportUsers} variant="outline" className="gap-1 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button onClick={fetchUsersWithBanStatus} disabled={isLoading} className="gap-1 w-full sm:w-auto">
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      {filteredUsers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
          {filterRole && ` • Role: ${filterRole}`}
          {filterStatus && ` • Status: ${filterStatus}`}
        </div>
      )}
      
      <div className="border rounded-md shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Loading users...</div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No users found</p>
                    {(searchTerm || filterRole || filterStatus) && (
                      <Button variant="link" onClick={resetFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className={user.is_banned ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                  <TableCell>
                    <div className="flex items-center">
                      {user.profile?.avatar_url ? (
                        <img 
                          src={user.profile.avatar_url} 
                          alt={`${user.profile.full_name || 'User'}'s avatar`}
                          className="h-8 w-8 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-neutral-600">
                            {(user.profile?.full_name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{user.profile?.full_name || "Unnamed User"}</div>
                        {user.profile?.username && (
                          <div className="text-xs text-muted-foreground">@{user.profile.username}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{user.email}</TableCell>
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
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'banned' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditProfile(user)} 
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Edit Profile</span>
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewMessages(user)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                      >
                        <span className="sr-only">View Messages</span>
                        <Shield className="h-4 w-4" />
                      </Button>
                      
                      {user.role !== 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleBanUser(user)}
                          className={`h-8 w-8 p-0 ${user.is_banned ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
                        >
                          <span className="sr-only">{user.is_banned ? 'Unban User' : 'Ban User'}</span>
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {user.role !== 'admin' ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleManageUserRole(user, 'make-admin')}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        >
                          <span className="sr-only">Make Admin</span>
                          <CheckSquare className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleManageUserRole(user, 'remove-admin')}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <span className="sr-only">Remove Admin</span>
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {confirmAction === 'ban-user' ? 'Ban' : 'Unban'}</DialogTitle>
            <DialogDescription>
              {confirmAction === 'ban-user' 
                ? `Are you sure you want to ban ${selectedUser?.profile?.full_name || 'this user'}? They will not be able to use the platform until unbanned.` 
                : `Are you sure you want to unban ${selectedUser?.profile?.full_name || 'this user'}? This will restore their access to the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmBanAction}
              variant={confirmAction === 'ban-user' ? 'destructive' : 'default'}
            >
              Confirm {confirmAction === 'ban-user' ? 'Ban' : 'Unban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Messages from {selectedUser?.profile?.full_name || 'User'}</DialogTitle>
            <DialogDescription>
              Recent message history for this user
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : userMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages found for this user
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {userMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`p-4 rounded-lg ${
                    msg.type === 'sent' 
                      ? 'bg-blue-50 border border-blue-100' 
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {msg.type === 'sent' ? 'Sent to' : 'Received from'} #{msg.type === 'sent' ? msg.receiver_id.substring(0, 8) : msg.sender_id.substring(0, 8)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.content.startsWith('image:') 
                      ? <img src={msg.content.substring(6)} className="max-h-40 rounded" />
                      : msg.content}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                    <span>Product: #{msg.product_id.substring(0, 8)}</span>
                    {msg.type === 'received' && (
                      <span className={msg.read ? 'text-green-600' : 'text-amber-600'}>
                        {msg.read ? 'Read' : 'Unread'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setIsMessageDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedUser && (
        <UserProfileEdit
          userId={selectedUser.id}
          profileData={{
            full_name: selectedUser.profile?.full_name || "",
            username: selectedUser.profile?.username || "",
            bio: selectedUser.profile?.bio || "", 
            avatar_url: selectedUser.profile?.avatar_url || ""
          }}
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};
