import React, { createContext, useContext, useState, useCallback } from "react";

// Types for our auth system
export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simple in-memory user store for demo purposes
const DEMO_USERS: (User & { password: string })[] = [
  { id: "t1", name: "Dr. Smith", email: "teacher@exam.com", password: "password", role: "teacher" },
  { id: "s1", name: "John Doe", email: "student@exam.com", password: "password", role: "student" },
  { id: "s2", name: "Jane Wilson", email: "jane@exam.com", password: "password", role: "student" },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("exam_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));
    const found = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid credentials");
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem("exam_user", JSON.stringify(userData));
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (DEMO_USERS.find((u) => u.email === email)) throw new Error("Email already exists");
    const newUser: User = { id: `u${Date.now()}`, name, email, role };
    DEMO_USERS.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem("exam_user", JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("exam_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
