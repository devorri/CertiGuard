import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isResident: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storageService.getSessionUser());

  useEffect(() => {
    storageService.initStorage?.();
  }, []);

  const login = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    storageService.setSessionUser(authenticatedUser);
  };

  const logout = () => {
    setUser(null);
    storageService.setSessionUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const isResident = user?.role === 'resident';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isResident,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
