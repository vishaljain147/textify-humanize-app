import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/home');
      }
    });
    
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/home');
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      toast("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast("Successfully logged in!");
      navigate('/home');
    } catch (error: any) {
      if (error.message === "Invalid login credentials") {
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage(error.message || 'An unknown error occurred');
      }
      toast(`Error: ${error.message || 'An unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      toast("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if email already exists - removed the problematic filter property
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setErrorMessage("This email is already registered. Please log in instead.");
          setActiveTab("login");
        } else {
          throw signUpError;
        }
      } else {
        toast("Successfully signed up! Please check your email for verification.");
      }
    } catch (error: any) {
      if (error.message.includes("already registered") || error.message.includes("already taken")) {
        setErrorMessage("This email is already registered. Please log in instead.");
        setActiveTab("login");
      } else {
        setErrorMessage(error.message || 'An unknown error occurred');
        toast(`Error: ${error.message || 'An unknown error occurred'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: 'google') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/home'
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast(`Error: ${error.message || 'An unknown error occurred'}`);
    }
  };

  // Clear error when changing tabs
  const handleTabChange = (value: string) => {
    setErrorMessage(null);
    setActiveTab(value);
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <CardHeader>
              <CardTitle>Login to Textify</CardTitle>
              <CardDescription>
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" onClick={() => handleSocialLogin("google")}>
                  Google
                </Button>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="signup">
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your details to create your Textify account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" onClick={() => handleSocialLogin("google")}>
                  Google
                </Button>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
