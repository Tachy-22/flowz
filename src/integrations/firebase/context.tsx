"use client";
import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/integrations/firebase";
import { User } from "@/integrations/firebase/auth";
import { useUserStore } from "../zustand";

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export const useFirebaseContext = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error(
      "useFirebaseContext must be used within a FirebaseProvider"
    );
  }
  return context;
};

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const { setUser, setAuthenticated, setLoadingUser } = useUserStore();

  // Sync Firebase auth state with Zustand store
  useEffect(() => {
    console.log("🔄 Auth state changed:", {
      user: user ? { uid: user.uid, email: user.email } : null,
      loading,
      isAuthenticated: !!user,
    });

    setUser(user);
    setAuthenticated(!!user);
    setLoadingUser(loading);
  }, [user, loading, setUser, setAuthenticated, setLoadingUser]);

  const value: FirebaseContextType = {
    user,
    loading,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
