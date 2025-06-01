
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { storage, jsonStorage } from '@/lib/storage';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh session manually
  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return;
      }
      
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
      }
    } catch (error) {
      console.error('Unexpected error during session refresh:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('Auth state change:', event, currentSession?.user?.email);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              // Store profile in storage for persistence
              setTimeout(async () => {
                try {
                  await jsonStorage.setItem('user_profile', {
                    id: currentSession.user.id,
                    email: currentSession.user.email,
                    last_sign_in: new Date().toISOString()
                  });
                  
                  // Create or update user profile in Supabase
                  await updateUserProfile(currentSession.user);
                } catch (error) {
                  console.error('Error storing user profile:', error);
                }
              }, 0);
            }
            break;
            
          case 'SIGNED_OUT':
            setSession(null);
            setUser(null);
            // Clear local profile on sign out
            setTimeout(async () => {
              try {
                await storage.removeItem('user_profile');
              } catch (error) {
                console.error('Error clearing user profile:', error);
              }
            }, 0);
            break;
            
          case 'PASSWORD_RECOVERY':
            // Handle password recovery if needed
            break;
            
          default:
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Check for stored profile if no active session
          if (!currentSession?.user) {
            try {
              const storedProfile = await jsonStorage.getItem('user_profile');
              if (storedProfile) {
                // We have a stored profile but no active session
                // This could mean the session expired, so we don't use the profile
                console.log('Found stored profile but no active session');
              }
            } catch (error) {
              console.error('Error checking stored profile:', error);
            }
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Function to create or update user profile in Supabase
  const updateUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: user.email?.split('@')[0] || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
        
      if (error) {
        console.error('Error updating profile:', error);
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear storage first
      await storage.removeItem('user_profile');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Force clear local state
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
