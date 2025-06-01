
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { LoginFormData, SignupFormData } from "@/lib/auth-validation";

export const useAuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });
      
      if (error) {
        if (error.message === "Invalid login credentials") {
          throw new Error("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Please check your email and click the confirmation link before signing in.");
        } else if (error.message.includes("Too many requests")) {
          throw new Error("Too many login attempts. Please wait a few minutes before trying again.");
        } else {
          throw new Error("Login failed. Please try again.");
        }
      }
      
      if (authData.user) {
        toast("Successfully logged in!");
        navigate('/home');
      }
    } catch (error: any) {
      toast(error.message || 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
          data: {
            email_confirm: true,
          }
        }
      });
      
      if (error) {
        if (error.message.includes("already registered")) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        } else if (error.message.includes("Password should be")) {
          throw new Error("Password does not meet security requirements. Please try a stronger password.");
        } else if (error.message.includes("Invalid email")) {
          throw new Error("Please enter a valid email address.");
        } else {
          throw new Error("Account creation failed. Please try again.");
        }
      }
      
      if (authData.user) {
        toast("Account created successfully! Please check your email for verification.");
      }
    } catch (error: any) {
      toast(error.message || 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    setIsLoading(true);
    
    try {
      console.log('Starting Google OAuth login...');
      
      // Check if we're in development or production
      const isDevelopment = window.location.hostname === 'localhost';
      const baseUrl = isDevelopment ? 'http://localhost:3000' : window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/home`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          skipBrowserRedirect: false
        }
      });
      
      console.log('Google OAuth response:', { data, error });
      
      if (error) {
        console.error('Google OAuth error:', error);
        
        // Handle specific Google OAuth errors
        if (error.message.includes('oauth')) {
          throw new Error('Google login is not properly configured. Please contact support.');
        } else if (error.message.includes('redirect')) {
          throw new Error('Redirect configuration error. Please check your settings.');
        } else if (error.message.includes('popup')) {
          throw new Error('Popup was blocked. Please allow popups and try again.');
        } else {
          throw new Error(`Google login failed: ${error.message}`);
        }
      }

      // For OAuth, the redirect happens automatically
      console.log('Google OAuth initiated successfully, redirecting...');
      toast("Redirecting to Google...");
      
    } catch (error: any) {
      console.error('Social login error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Google login failed. Please try again.';
      
      if (error.message.includes('popup')) {
        errorMessage = 'Please allow popups in your browser and try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('configuration')) {
        errorMessage = 'Google login is not properly set up. Please contact support.';
      }
      
      toast(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleLogin,
    handleSignup,
    handleSocialLogin,
  };
};
