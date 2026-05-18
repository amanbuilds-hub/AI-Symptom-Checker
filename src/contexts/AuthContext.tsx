import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { authAPI, getCurrentUser } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string | null }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<{ error?: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error?: any }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      localStorage.removeItem("auth_token");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.signIn(email, password);

      if (response.error) {
        setLoading(false);
        return { error: response.error };
      }

      if (response.data?.user) {
        setUser(response.data.user);
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: "Network error occurred" };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    try {
      setLoading(true);
      const response = await authAPI.signUp({
        email,
        password,
        name: userData.name || "",
        phone: userData.phone,
        age: userData.age,
        gender: userData.gender,
        location: userData.location,
        role: userData.role || "customer",
        language: userData.language || "en",
      });

      if (response.error) {
        setLoading(false);
        return { error: response.error };
      }

      if (response.data?.user) {
        setUser(response.data.user);
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: "Network error occurred" };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      // Still clear local state even if API call fails
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return { error: "No user logged in" };

    try {
      const response = await authAPI.updateProfile(data);

      if (response.error) {
        return { error: response.error };
      }

      if (response.data?.user) {
        setUser(response.data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: "Network error occurred" };
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
