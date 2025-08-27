import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setUserProfile(user);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Simulate authentication
      const usersData = await AsyncStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const user = users.find((u: User) => u.email === email);
        
        if (user) {
          // In a real app, you would verify the password hash
          setCurrentUser(user);
          setUserProfile(user);
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } else {
          throw new Error('User not found');
        }
      } else {
        throw new Error('No users found');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const usersData = await AsyncStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      // Check if user already exists
      const existingUser = users.find((u: User) => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: userData.name || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || 'male',
        bloodGroup: userData.bloodGroup || '',
        allergies: userData.allergies || [],
        emergencyContacts: userData.emergencyContacts || [],
        profileImage: userData.profileImage,
        createdAt: new Date(),
        updatedAt: new Date(),
        userType: userData.userType || 'patient',
      };

      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      setCurrentUser(newUser);
      setUserProfile(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const updatedUser = { ...currentUser, ...updates, updatedAt: new Date() };
      
      // Update in users array
      const usersData = await AsyncStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        const updatedUsers = users.map((u: User) => 
          u.id === currentUser.id ? updatedUser : u
        );
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      }

      // Update current user
      setCurrentUser(updatedUser);
      setUserProfile(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 