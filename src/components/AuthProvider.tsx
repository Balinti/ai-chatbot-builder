'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check for user
    const checkUser = () => {
      if (typeof window !== 'undefined' && window.AUTH_USER !== undefined) {
        setUser(window.AUTH_USER);
        setIsLoading(false);
      }
    };

    // Check immediately
    checkUser();

    // Also check after a short delay (for script loading)
    const timeout = setTimeout(checkUser, 1000);

    // Listen for auth changes
    const handleAuthChange = (event: CustomEvent<{ user: User | null }>) => {
      setUser(event.detail.user);
      setIsLoading(false);
    };

    window.addEventListener('auth-change', handleAuthChange as EventListener);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('auth-change', handleAuthChange as EventListener);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Type declaration for window.AUTH_USER
declare global {
  interface Window {
    AUTH_USER?: User | null;
  }
}
