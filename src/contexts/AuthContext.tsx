
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // If user just signed up or signed in, verify profile was created
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching user profile:', error);
                toast({
                  title: "Profile Warning",
                  description: "Your profile may not have been created properly. Please contact support if you experience issues.",
                  variant: "destructive",
                });
              } else {
                console.log('User profile verified:', profile);
                toast({
                  title: "Welcome!",
                  description: `Your account has been set up with tenant ID: ${profile.tenant_id}`,
                });
              }
            } catch (error) {
              console.error('Error verifying profile:', error);
            }
          }, 1000);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting to sign up user:', email, 'with full name:', fullName);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('Database error saving new user')) {
          errorMessage = "There was an issue setting up your account. Please try again, and if the problem persists, contact support.";
        } else if (error.message.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead or use a different email.";
        }
        
        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('Sign up successful:', data.user?.email);
        
        // Check if email confirmation is required
        if (!data.session && data.user) {
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link. Please click it to complete your registration.",
          });
        } else if (data.session) {
          toast({
            title: "Account created successfully!",
            description: "Welcome to FinAI! Your account has been set up.",
          });
        }
      }
      
      return { error };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        }
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('Sign in successful:', data.user?.email);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }
      
      return { error };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out user');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sign out successful');
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
