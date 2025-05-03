import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Store profile in localStorage for persistence
          localStorage.setItem('user_profile', JSON.stringify({
            id: currentSession.user.id,
            email: currentSession.user.email,
            last_sign_in: new Date().toISOString()
          }));
          
          // Create or update user profile in Supabase
          updateUserProfile(currentSession.user);
        } else if (event === 'SIGNED_OUT') {
          // Clear local profile on sign out
          localStorage.removeItem('user_profile');
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Check for stored profile if no active session
      if (!currentSession?.user) {
        const storedProfile = localStorage.getItem('user_profile');
        if (storedProfile) {
          // We have a stored profile but no active session
          // This could mean the session expired, so we don't use the profile
          // but we keep it for reference and potential automatic sign-in flows
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to create or update user profile in Supabase
  const updateUserProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: user.email?.split('@')[0] || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error updating profile:', error);
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user_profile'); // Ensure profile is cleared
  };

  const value = {
    session,
    user,
    isLoading,
    signOut
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
