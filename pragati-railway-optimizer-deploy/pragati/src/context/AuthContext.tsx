import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  switchRoleDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pragati_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [selectedZone, setSelectedZone] = useState<string>(() => {
    const savedZone = localStorage.getItem('pragati_selected_zone');
    if (savedZone) return savedZone;
    return user?.assignedZone || 'All Zones';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pragati_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pragati_user');
    }
  }, [user]);

  useEffect(() => {
    if (selectedZone) {
      localStorage.setItem('pragati_selected_zone', selectedZone);
    }
  }, [selectedZone]);

  const login = async (username: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const cleanUsername = username.trim().toLowerCase();
    
    // Check demo credentials
    if (cleanUsername === 'admin') {
      if (password && password !== 'admin123') {
        return { success: false, message: 'Invalid password. Demo password is admin123' };
      }
      const adminUser = INITIAL_USERS.find(u => u.username === 'admin') || {
        id: 'user-admin',
        username: 'admin',
        name: 'Priyanka Sharma',
        role: 'ADMIN' as UserRole,
        email: 'p.sharma@railnet.gov.in',
        status: 'ACTIVE',
        lastLogin: new Date().toLocaleTimeString()
      };
      setUser(adminUser);
      return { success: true };
    }

    if (cleanUsername === 'operator' || cleanUsername === 'suresh' || cleanUsername === 'op1') {
      if (password && password !== 'operator123') {
        return { success: false, message: 'Invalid password. Demo password is operator123' };
      }
      const opUser = INITIAL_USERS.find(u => u.username === 'operator') || {
        id: 'user-operator',
        username: 'operator',
        name: 'Suresh Verma',
        role: 'OPERATOR' as UserRole,
        assignedZone: 'Northern Railway',
        email: 'suresh.verma@nr.railnet.gov.in',
        status: 'ACTIVE',
        lastLogin: new Date().toLocaleTimeString()
      };
      setUser(opUser);
      setSelectedZone('Northern Railway');
      return { success: true };
    }

    // Check other operators
    const matched = INITIAL_USERS.find(u => u.username.toLowerCase() === cleanUsername);
    if (matched) {
      setUser(matched);
      if (matched.assignedZone) {
        setSelectedZone(matched.assignedZone);
      }
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Invalid credentials. Try "admin" (pwd: admin123) or "operator" (pwd: operator123)' 
    };
  };

  const switchRoleDemo = (role: UserRole) => {
    if (role === 'ADMIN') {
      const admin = INITIAL_USERS.find(u => u.role === 'ADMIN')!;
      setUser(admin);
    } else {
      const operator = INITIAL_USERS.find(u => u.role === 'OPERATOR')!;
      setUser(operator);
      setSelectedZone(operator.assignedZone || 'Northern Railway');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pragati_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      selectedZone,
      setSelectedZone,
      switchRoleDemo
    }}>
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
