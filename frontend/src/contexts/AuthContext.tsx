import React, { createContext, useContext, useEffect, useState } from 'react';
// import { getSupabaseClient } from '../utils/supabase/client';
// import type { User, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: User;
  access_token: string;
  expires_at: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock authentication for development
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'Test User'
    };
    
    const mockSession = {
      user: mockUser,
      access_token: 'mock-token',
      expires_at: Date.now() + 3600000
    };

    setUser(mockUser);
    setSession(mockSession);
    setIsLoading(false);
  }, []);

  const signUp = async (email: string, _password: string, name: string) => {
    try {
      // Mock sign up - replace with actual API call
      console.log('Mock signup with:', { email, name });
      const newUser = { id: Date.now().toString(), email, name };
      const newSession = {
        user: newUser,
        access_token: 'mock-token',
        expires_at: Date.now() + 3600000
      };
      setUser(newUser);
      setSession(newSession);
      return { error: null };
    } catch (error) {
      console.error('Errore registrazione:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, _password: string) => {
    try {
      // Mock sign in - replace with actual API call
      console.log('Mock signin with:', { email });
      const loginUser = { id: '1', email, name: 'User' };
      const loginSession = {
        user: loginUser,
        access_token: 'mock-token',
        expires_at: Date.now() + 3600000
      };
      setUser(loginUser);
      setSession(loginSession);
      return { error: null };
    } catch (error) {
      console.error('Errore login:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Errore logout:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Mock password reset - replace with actual API call
      console.log('Password reset requested for:', email);
      return { error: null };
    } catch (error) {
      console.error('Errore reset password:', error);
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
