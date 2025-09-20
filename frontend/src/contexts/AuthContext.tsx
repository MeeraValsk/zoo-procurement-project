import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

export type UserRole = 'staff' | 'supplier' | 'admin' | 'invoice';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
  zoo?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers = [
  {
    id: '1',
    username: 'staff1',
    email: 'staff1',
    password: 'staff123',
    role: 'staff' as UserRole,
    name: 'John Smith',
    zoo: 'City Zoo'
  },
  {
    id: '2',
    username: 'supplier1',
    email: 'supplier1',
    password: 'supplier123',
    role: 'supplier' as UserRole,
    name: 'Green Feed Co.',
    company: 'Green Feed Company'
  },
  {
    id: '3',
    username: 'admin1',
    email: 'admin1',
    password: 'admin123',
    role: 'admin' as UserRole,
    name: 'Sarah Johnson',
    zoo: 'City Zoo'
  },
  {
    id: '4',
    username: 'invoice1',
    email: 'invoice1',
    password: 'invoice123',
    role: 'invoice' as UserRole,
    name: 'Mike Wilson',
    zoo: 'City Zoo'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('zoo-procure-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('zoo-procure-user', JSON.stringify(response.data.user));
        setIsLoading(false);
        return { success: true, message: 'Login successful' };
      } else {
        setIsLoading(false);
        return { success: false, message: response.message };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zoo-procure-user');
    apiService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};