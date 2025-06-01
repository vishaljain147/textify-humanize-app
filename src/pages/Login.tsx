
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/AuthForm";
import { checkApiConnectivity } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<{
    isConnected: boolean;
    isChecking: boolean;
    error?: string;
  }>({ isConnected: true, isChecking: true });
  
  useEffect(() => {
    let mounted = true;
    
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mounted) {
        navigate('/home');
      }
    };
    
    // Check API connectivity
    const checkApi = async () => {
      if (!mounted) return;
      
      try {
        const result = await checkApiConnectivity();
        if (mounted) {
          setApiStatus({
            isConnected: result.isConnected,
            isChecking: false,
            error: result.error
          });
        }
      } catch (error) {
        if (mounted) {
          setApiStatus({
            isConnected: false,
            isChecking: false,
            error: 'Failed to check API status'
          });
        }
      }
    };
    
    checkAuth();
    checkApi();
    
    // Setup auth state listener with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change in Login page:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, redirecting to home...');
          navigate('/home');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Stay on login page
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-4">
        {/* API Status Indicator */}
        {!apiStatus.isChecking && (
          <Alert variant={apiStatus.isConnected ? "default" : "destructive"}>
            <div className="flex items-center space-x-2">
              {apiStatus.isConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <AlertDescription>
                {apiStatus.isConnected 
                  ? "API connected - Full features available" 
                  : `API unavailable - Using fallback mode${apiStatus.error ? `: ${apiStatus.error}` : ''}`
                }
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        {apiStatus.isChecking && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Checking API connectivity...
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your account to continue using Textify
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm mode="login" />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Join Textify to start humanizing your text with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm mode="signup" />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
