
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
  CheckCircle,
  RefreshCw,
  Shield,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const ShipdayIntegration = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [webhookToken, setWebhookToken] = useState("");
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isTokenInEnvironment, setIsTokenInEnvironment] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<null | {success: boolean; message: string}>(null);
  const [settings, setSettings] = useState({
    enabled: true,
    apiKey: "YOUR_SHIPDAY_API_KEY",
    webhookEnabled: true,
    autoCreateDrivers: true,
  });

  // This would be your Supabase edge function URL in production
  const webhookUrl = `https://${window.location.hostname.includes('localhost') ? 'epkpqlkvhuqnfepfpscd.supabase.co' : window.location.hostname}/functions/v1/shipday-integration`;

  useEffect(() => {
    // Fetch the webhook token from local storage or generate a new one if not present
    const storedToken = localStorage.getItem("shipday_webhook_token");
    if (storedToken) {
      setWebhookToken(storedToken);
    } else {
      generateNewToken();
    }
    
    // Check if the token is set in environment
    checkTokenInEnvironment();
  }, []);
  
  const checkTokenInEnvironment = async () => {
    try {
      // We'll use a function call to check if the token is set in environment
      // In a real implementation, you might have an admin endpoint for this
      const { data, error } = await supabase.functions.invoke("shipday-integration", {
        method: "GET"
      });
      
      if (!error && data) {
        // This is a simple way to check if the token might be set
        // In a real implementation, you'd have a proper admin endpoint
        setIsTokenInEnvironment(true);
      }
    } catch (error) {
      console.error("Error checking token status:", error);
    }
  };

  const generateNewToken = async () => {
    setIsGeneratingToken(true);
    try {
      // Generate a random token (in a real app, this would be done securely on the server)
      const randomToken = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
      
      // Store it in local storage for demo purposes
      // In production, this would be stored in your database
      localStorage.setItem("shipday_webhook_token", randomToken);
      setWebhookToken(randomToken);
      
      toast({
        title: "New webhook token generated",
        description: "Make sure to update this in your Shipday dashboard and in your Supabase environment variables"
      });
    } catch (error) {
      toast({
        title: "Error generating token",
        description: "Failed to generate a new webhook token",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    
    if (type === 'url') {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      toast({
        title: "Webhook URL copied",
        description: "The URL has been copied to your clipboard"
      });
    } else {
      setTokenCopied(true);
      setTimeout(() => {
        setTokenCopied(false);
      }, 2000);
      
      toast({
        title: "Webhook token copied",
        description: "The token has been copied to your clipboard"
      });
    }
  };

  const handleSaveSettings = () => {
    // This would save settings to the database in a real implementation
    toast({
      title: "Settings saved",
      description: "Shipday integration settings have been updated"
    });
  };

  const getCompleteWebhookUrl = () => {
    return `${webhookUrl}?token=${webhookToken}`;
  };
  
  const testWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    
    try {
      // Make a GET request to the webhook URL to test it
      const response = await fetch(getCompleteWebhookUrl(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setWebhookTestResult({ 
          success: true, 
          message: "Webhook endpoint is responding correctly" 
        });
        toast({
          title: "Webhook test successful",
          description: "Your webhook endpoint is configured correctly"
        });
      } else {
        setWebhookTestResult({ 
          success: false, 
          message: `Error: ${data.error || 'Unknown error'}` 
        });
        toast({
          title: "Webhook test failed",
          description: data.error || "The webhook endpoint is not responding correctly",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      setWebhookTestResult({ 
        success: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      toast({
        title: "Webhook test failed",
        description: "Could not connect to the webhook endpoint",
        variant: "destructive"
      });
    } finally {
      setIsTestingWebhook(false);
    }
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
                {/* Webhook URL with token */}
                <div className="flex flex-col space-y-2">
                  <Label>Webhook URL (with token)</Label>
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <Input 
                        value={getCompleteWebhookUrl()} 
                        readOnly 
                        className="pr-10 font-mono text-sm"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 h-full"
                        onClick={() => copyToClipboard(getCompleteWebhookUrl(), 'url')}
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
                
                {/* Webhook security token */}
                <div className="flex flex-col space-y-2">
                  <Label className="flex items-center gap-1">
                    <Shield className="h-4 w-4" /> Webhook Security Token
                  </Label>
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <Input 
                        value={webhookToken} 
                        readOnly 
                        className="pr-10 font-mono text-sm"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 h-full"
                        onClick={() => copyToClipboard(webhookToken, 'token')}
                      >
                        {tokenCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-2 gap-1"
                      onClick={generateNewToken}
                      disabled={isGeneratingToken}
                    >
                      <RefreshCw className={`h-4 w-4 ${isGeneratingToken ? 'animate-spin' : ''}`} /> 
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This token must be added to your Shipday webhook configuration for security verification.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-1"
                    onClick={testWebhook}
                    disabled={isTestingWebhook}
                  >
                    {isTestingWebhook ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Webhook className="h-4 w-4" />
                    )}
                    Test Webhook Connection
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Webhook Troubleshooting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Webhook Troubleshooting</DialogTitle>
                        <DialogDescription>
                          Common issues and solutions for webhooks
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">If you see "Webhook connect failed" in Shipday:</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Make sure your Supabase function is deployed</li>
                            <li>Ensure the token is correctly included in the URL</li>
                            <li>Check that you've copied the entire URL with no spaces</li>
                            <li>Shipday requires the endpoint to respond to GET requests</li>
                            <li>Set the webhook token in your Supabase environment variables</li>
                          </ul>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              How to set the token in Supabase
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Set Webhook Token in Supabase</AlertDialogTitle>
                              <AlertDialogDescription>
                                Follow these steps to set your webhook token in Supabase for production use:
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                              <ol className="list-decimal pl-5 space-y-2 text-sm">
                                <li>Go to your Supabase dashboard</li>
                                <li>Navigate to "Settings" &gt; "Edge Functions"</li>
                                <li>Find the "Environment Variables" section</li>
                                <li>Add a new variable named <code className="bg-muted p-1 rounded text-xs">SHIPDAY_WEBHOOK_TOKEN</code></li>
                                <li>Paste your webhook token as the value</li>
                                <li>Save your changes</li>
                                <li>Wait a minute for the changes to take effect</li>
                              </ol>
                              <p className="text-sm text-muted-foreground mt-2">
                                After setting the token, redeploy your edge function or wait a few minutes for the changes to propagate.
                              </p>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button 
                                  onClick={() => window.open("https://supabase.com/dashboard/project/epkpqlkvhuqnfepfpscd/settings/functions", "_blank")}
                                >
                                  Open Supabase Settings
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <div className="bg-muted p-4 rounded-md">
                          <p className="font-medium mb-2">Edge Function Logs:</p>
                          <p className="text-sm text-muted-foreground">
                            Check the Supabase Edge Function logs for more detailed information about what might be causing the webhook failure.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => window.open("https://supabase.com/dashboard/project/epkpqlkvhuqnfepfpscd/functions/shipday-integration/logs", "_blank")}
                          >
                            View Function Logs
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {webhookTestResult && (
                  <div className={`rounded-md p-4 text-sm ${webhookTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className="font-medium flex items-center gap-1">
                      {webhookTestResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {webhookTestResult.success ? 'Test successful' : 'Test failed'}
                    </p>
                    <p className={`mt-1 ${webhookTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {webhookTestResult.message}
                    </p>
                  </div>
                )}
                
                {!isTokenInEnvironment && (
                  <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm">
                    <p className="font-medium flex items-center gap-1 text-amber-800">
                      <AlertCircle className="h-4 w-4" />
                      Environment Variable Not Set
                    </p>
                    <p className="mt-1 text-amber-700">
                      For production use, you should set the <code className="bg-amber-100 p-1 rounded text-xs">SHIPDAY_WEBHOOK_TOKEN</code> environment variable in your Supabase project.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-amber-800 border-amber-300 hover:bg-amber-100"
                      onClick={() => window.open("https://supabase.com/dashboard/project/epkpqlkvhuqnfepfpscd/settings/functions", "_blank")}
                    >
                      Set Environment Variable
                    </Button>
                  </div>
                )}
                
                <div className="rounded-md bg-muted p-4 text-sm">
                  <p className="font-medium">Setup instructions for Shipday:</p>
                  <ol className="list-decimal pl-5 space-y-1 mt-2">
                    <li>Copy the webhook URL above (it includes the security token)</li>
                    <li>Go to your Shipday dashboard &gt; Settings &gt; Developer</li>
                    <li>Paste the URL into the "Webhook URL" field</li>
                    <li>Select event types: Order Created, Status Changed, Location Updated</li>
                    <li>Save your changes</li>
                    <li>Click the "Test Connection" button in Shipday to verify</li>
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
                    <p className="text-xs text-muted-foreground">
                      Find your API key in the Shipday dashboard under Settings &gt; Developer
                    </p>
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
