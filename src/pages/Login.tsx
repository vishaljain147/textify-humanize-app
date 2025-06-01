
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/AuthForm";

export default function Login() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };
    
    checkAuth();
    
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change in Login page:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, redirecting to home...');
          navigate('/home');
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
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
  );
}
