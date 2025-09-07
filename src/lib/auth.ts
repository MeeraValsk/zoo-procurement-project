import { supabase, type UserRole, type Profile } from './supabase';
import { useToast } from '@/hooks/use-toast';

export class AuthService {
  static async signUp(email: string, password: string, userData: {
    full_name: string;
    role: UserRole;
    organization?: string;
    phone?: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          ...userData
        });

      if (profileError) throw profileError;
    }

    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async getCurrentProfile(): Promise<Profile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  static async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Hook for authentication state
export function useAuth() {
  const { toast } = useToast();

  const signUp = async (email: string, password: string, userData: {
    full_name: string;
    role: UserRole;
    organization?: string;
    phone?: string;
  }) => {
    try {
      const result = await AuthService.signUp(email, password, userData);
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await AuthService.signIn(email, password);
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    getCurrentUser: AuthService.getCurrentUser,
    getCurrentProfile: AuthService.getCurrentProfile,
    updateProfile: AuthService.updateProfile,
    onAuthStateChange: AuthService.onAuthStateChange,
  };
}