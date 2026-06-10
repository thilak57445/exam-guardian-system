import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ExamProvider } from "@/contexts/ExamContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import ExamInterface from "./pages/ExamInterface";
import Results from "./pages/Results";
import StudentResults from "./pages/StudentResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const { user, isInitializing } = useAuth();
  
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

// Redirect if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitializing } = useAuth();
  
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/create-exam" element={<ProtectedRoute role="teacher"><CreateExam /></ProtectedRoute>} />
    <Route path="/results" element={<ProtectedRoute role="teacher"><Results /></ProtectedRoute>} />
    <Route path="/my-results" element={<ProtectedRoute role="student"><StudentResults /></ProtectedRoute>} />
    <Route path="/exam/:id" element={<ProtectedRoute role="student"><ExamInterface /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ExamProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ExamProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
