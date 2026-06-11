import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "@/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";

// Types for our auth system
export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // User is logged in, fetch their profile from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role;
            if (role === "teacher" || role === "student") {
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: userData.name || "",
                role: role as UserRole,
              });
            } else {
              console.error("No valid role found in user document:", firebaseUser.uid);
              setUser(null);
              setError("No valid role found for this user.");
            }
          } else {
            console.error("User document does not exist in Firestore for UID:", firebaseUser.uid);
            setUser(null);
            setError("User profile not found in Firestore.");
          }
        } else {
          // User is logged out
          setUser(null);
        }
      } catch (err) {
        console.error("Error restoring user session:", err);
        setError(err instanceof Error ? err.message : "Session restoration failed");
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile from Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error("User document does not exist in Firestore.");
      }

      const userData = userDocSnap.data();
      const role = userData.role;
      if (role !== "teacher" && role !== "student") {
        throw new Error("Invalid user role or role is missing in Firestore document.");
      }

      setUser({
        id: userCredential.user.uid,
        email: userCredential.user.email || "",
        name: userData.name || "",
        role: role as UserRole,
      });

      console.log("User UID:", userCredential.user.uid);
      console.log("Firestore role:", role);
      console.log("Redirect target:", role === "teacher" ? "Teacher Dashboard" : "Student Dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Store user profile in Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        email,
        role,
        name,
        createdAt: new Date().toISOString(),
      });

      setUser({
        id: userCredential.user.uid,
        email,
        name,
        role,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
        isInitializing,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
