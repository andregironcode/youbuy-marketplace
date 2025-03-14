
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AdminSettings = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [notifyNewUsers, setNotifyNewUsers] = useState(true);
  const [notifyReports, setNotifyReports] = useState(true);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">Configure platform settings and preferences</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure general platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Platform Name</Label>
                  <Input id="siteName" defaultValue="YouBuy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Support Email</Label>
                  <Input id="contactEmail" defaultValue="support@youbuy.com" type="email" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Platform Description</Label>
                <Textarea id="description" defaultValue="YouBuy - The marketplace for buying and selling products" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the site in maintenance mode
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenance}
                  onCheckedChange={setMaintenance}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Fee Settings</CardTitle>
              <CardDescription>Configure platform fees and commission rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee (%)</Label>
                  <Input id="platformFee" defaultValue="5" type="number" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumFee">Minimum Fee ($)</Label>
                  <Input id="minimumFee" defaultValue="1" type="number" min="0" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Fee Structure</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Admin Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" defaultValue="60" type="number" min="5" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                <Input id="loginAttempts" defaultValue="5" type="number" min="1" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordPolicy">Password Policy</Label>
                <Select defaultValue="strong">
                  <SelectTrigger id="passwordPolicy">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (min 6 characters)</SelectItem>
                    <SelectItem value="medium">Medium (min 8 characters, 1 number)</SelectItem>
                    <SelectItem value="strong">Strong (min 10 characters, mixed case, numbers, symbols)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Security Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure admin notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyNewUsers">New User Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new user sign-ups
                  </p>
                </div>
                <Switch
                  id="notifyNewUsers"
                  checked={notifyNewUsers}
                  onCheckedChange={setNotifyNewUsers}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyReports">User Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new user reports
                  </p>
                </div>
                <Switch
                  id="notifyReports"
                  checked={notifyReports}
                  onCheckedChange={setNotifyReports}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmails">Notification Recipients</Label>
                <Textarea 
                  id="adminEmails" 
                  placeholder="Enter email addresses separated by commas"
                  defaultValue="admin@youbuy.com, support@youbuy.com"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Manage API access and keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex space-x-2">
                  <Input id="apiKey" defaultValue="sk_live_****************************************" type="password" readOnly />
                  <Button variant="outline">Regenerate</Button>
                  <Button variant="outline">Show</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input id="webhookUrl" defaultValue="https://api.youbuy.com/webhooks/events" />
              </div>
              
              <div className="space-y-2">
                <Label>API Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="readUsers" defaultChecked />
                    <Label htmlFor="readUsers">Read Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="writeUsers" defaultChecked />
                    <Label htmlFor="writeUsers">Write Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="readProducts" defaultChecked />
                    <Label htmlFor="readProducts">Read Products</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="writeProducts" defaultChecked />
                    <Label htmlFor="writeProducts">Write Products</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save API Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
