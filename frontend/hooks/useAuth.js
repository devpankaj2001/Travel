'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = async () => {
    try {
      const stored = authService.getCurrentUser();
      if (stored) {
        setUser(stored);
        // Optionally fetch fresh profile from API
        const fresh = await authService.getMe();
        if (fresh.success && fresh.data?.user) {
          setUser(fresh.data.user);
          localStorage.setItem('user', JSON.stringify(fresh.data.user));
        }
      }
    } catch (e) {
      console.warn('Failed to load user state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/');
  };

  const updateUserState = (newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: Boolean(user),
      role: user?.role || user?.role_slug || null,
      logout,
      refreshUser: loadUser,
      updateUserState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
