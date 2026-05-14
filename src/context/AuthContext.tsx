import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  signInAnonymously 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  loginWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('finflow_guest_mode') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setIsGuest(false);
        localStorage.removeItem('finflow_guest_mode');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const signUpWithGoogle = async () => {
    // Reuses the same Firebase method as login with Google
    // but can be extended with signup-specific logic later (e.g. tracking, welcome emails)
    return loginWithGoogle();
  };

  const continueAsGuest = async () => {
    setIsGuest(true);
    localStorage.setItem('finflow_guest_mode', 'true');
    // We don't use Firebase Anonymous Auth here just yet to keep it lean,
    // but we could if we wanted server-side guest data.
    // For now, it's just a local state flag.
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error", e);
    }
    setIsGuest(false);
    localStorage.removeItem('finflow_guest_mode');
    // Clear local storage data if any
    localStorage.removeItem('finflow_transactions');
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, loginWithGoogle, signUpWithGoogle, continueAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
