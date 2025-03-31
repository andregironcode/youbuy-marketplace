
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Package, 
  Settings, 
  Users, 
  Webhook, 
  ArrowRight, 
  Link, 
  Copy, 
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const ShipdayIntegration = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    apiKey: "YOUR_SHIPDAY_API_KEY",
    webhookEnabled: true,
    autoCreateDrivers: true,
  });

  // This would be your Supabase edge function URL in production
  const webhookUrl = "https://epkpqlkvhuqnfepfpscd.supabase.co/functions/v1/shipday-integration";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    toast({
      title: "Webhook URL copied",
      description: "The URL has been copied to your clipboard"
    });
  };

  const handleSaveSettings = () => {
    // This would save settings to the database in a real implementation
    toast({
      title: "Settings saved",
      description: "Shipday integration settings have been updated"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipday Integration</h1>
          <p className="text-muted-foreground">
            Manage your delivery operations with the Shipday integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="shipday-enabled" className="font-medium">Enable Shipday</Label>
          <Switch 
            id="shipday-enabled" 
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Drivers</CardTitle>
                <CardDescription>Manage delivery drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">12</div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => document.getElementById('drivers-tab')?.click()}>
                    View <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Deliveries</CardTitle>
                <CardDescription>Unassigned orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">5</div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => document.getElementById('orders-tab')?.click()}>
                    View <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">In Progress</CardTitle>
                <CardDescription>Deliveries in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">8</div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => document.getElementById('orders-tab')?.click()}>
                    View <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" /> Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure Shipday to send delivery updates to this webhook URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <Input 
                        value={webhookUrl} 
                        readOnly 
                        className="pr-10 font-mono text-sm"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 h-full"
                        onClick={copyToClipboard}
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-2 gap-1"
                      onClick={() => window.open("https://www.shipday.com/dashboard/settings/developer", "_blank")}
                    >
                      <Link className="h-4 w-4" /> Configure in Shipday
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-4 text-sm">
                  <p className="font-medium">Setup instructions:</p>
                  <ol className="list-decimal pl-5 space-y-1 mt-2">
                    <li>Copy the webhook URL above</li>
                    <li>Go to your Shipday dashboard &gt; Settings &gt; Developer</li>
                    <li>Paste the URL into the "Webhook URL" field</li>
                    <li>Select event types: Order Created, Status Changed, Location Updated</li>
                    <li>Save your changes</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drivers" id="drivers-tab" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Management</CardTitle>
              <CardDescription>Connect and manage drivers for your deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-4 text-sm mb-6">
                <p>
                  Driver management is handled through the Shipday platform. You can create and manage
                  drivers in Shipday, and they will sync automatically with your YouBuy marketplace.
                </p>
              </div>
              
              <Button className="gap-2" onClick={() => window.open("https://www.shipday.com/dashboard/drivers", "_blank")}>
                <Truck className="h-4 w-4" /> Manage in Shipday
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" id="orders-tab" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Create and manage deliveries for orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-4 text-sm mb-6">
                <p>
                  Orders from your YouBuy marketplace can be automatically sent to Shipday for delivery.
                  You can configure automatic order creation or manually send orders to Shipday.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button className="gap-2" onClick={() => window.open("https://www.shipday.com/dashboard/orders", "_blank")}>
                  <Package className="h-4 w-4" /> View in Shipday
                </Button>
                <Button variant="outline">Create Test Delivery</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" id="settings-tab" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure the Shipday integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipday-api-key">Shipday API Key</Label>
                    <Input 
                      id="shipday-api-key" 
                      type="password" 
                      value={settings.apiKey}
                      onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-create deliveries</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create deliveries in Shipday for new orders
                      </p>
                    </div>
                    <Switch 
                      checked={settings.autoCreateDrivers}
                      onCheckedChange={(checked) => setSettings({...settings, autoCreateDrivers: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Webhook notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive delivery status updates from Shipday
                      </p>
                    </div>
                    <Switch 
                      checked={settings.webhookEnabled}
                      onCheckedChange={(checked) => setSettings({...settings, webhookEnabled: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <Button onClick={handleSaveSettings}>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
