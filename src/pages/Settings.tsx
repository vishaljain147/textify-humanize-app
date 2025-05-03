
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import ThemeToggle from "@/components/ThemeToggle";

export default function Settings() {
  const [email, setEmail] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save settings to an API or local storage
    toast("Settings saved successfully");
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your history? This cannot be undone.")) {
      localStorage.removeItem("textify-history");
      toast("History has been cleared");
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Settings</h1>
      <p className="text-center text-muted-foreground mb-8">
        Customize your Textify experience
      </p>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how Textify looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email notifications</Label>
                <Input 
                  id="email" 
                  placeholder="Enter your email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about new features and updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-history">Save History</Label>
                  <p className="text-sm text-muted-foreground">
                    Save your humanized texts to view later
                  </p>
                </div>
                <Switch
                  id="save-history"
                  checked={saveHistory}
                  onCheckedChange={setSaveHistory}
                />
              </div>
              
              <Button type="submit">Save Settings</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage your data stored in this application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>History Management</Label>
              <p className="text-sm text-muted-foreground">
                Clear all your saved text history from this device
              </p>
              <Button 
                variant="destructive" 
                onClick={handleClearHistory}
              >
                Clear History
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Support</Label>
              <p className="text-sm text-muted-foreground">
                Need help with Textify? Contact our support team
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:support@example.com">Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
