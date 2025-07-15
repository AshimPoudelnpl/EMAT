import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Token, UserLogin, UserCreate } from '@/types';
import { api } from '@/services/apiHelpers';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserLogin) => Promise<boolean>;
  signup: (userData: UserCreate) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already logged in on app start
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = apiService.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.auth.getMe();
      if (response.data) {
        setUser(response.data);
      } else {
        // Token is invalid, remove it
        apiService.setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiService.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: UserLogin): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(credentials);

      if (response.data) {
        const tokenData = response.data;
        apiService.setToken(tokenData.access_token);
        
        // Get user data after login
        const userResponse = await api.auth.getMe();
        if (userResponse.data) {
          setUser(userResponse.data);
          toast({
            title: 'Welcome back!',
            description: `Logged in as ${userResponse.data.full_name}`,
          });
          return true;
        }
      }
      
      toast({
        title: 'Login Failed',
        description: response.error || 'Invalid credentials',
        variant: 'destructive',
      });
      return false;
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: UserCreate): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.auth.signup(userData);

      if (response.data) {
        const newUser = response.data;
        
        // After signup, login to get token
        const loginResponse = await api.auth.login({
          email: userData.email,
          password: userData.password,
        });
        
        if (loginResponse.data) {
          apiService.setToken(loginResponse.data.access_token);
          setUser(newUser);
          toast({
            title: 'Account Created!',
            description: `Welcome to Election Echo Network, ${newUser.full_name}`,
          });
          return true;
        }
      }
      
      toast({
        title: 'Signup Failed',
        description: response.error || 'Could not create account',
        variant: 'destructive',
      });
      return false;
    } catch (error) {
      toast({
        title: 'Signup Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.setToken(null);
    setUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
  };

  const refreshUser = async () => {
    try {
      const response = await api.auth.getMe();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}