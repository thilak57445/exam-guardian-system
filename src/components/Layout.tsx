import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Shield, BookOpen, LayoutDashboard, ClipboardList, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/");
    }
  };

  const teacherLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/create-exam", label: "Create Exam", icon: ClipboardList },
    { path: "/results", label: "Results", icon: Users },
  ];

  const studentLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/my-results", label: "My Results", icon: BookOpen },
  ];

  const links = user?.role === "teacher" ? teacherLinks : studentLinks;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="gradient-primary border-b border-sidebar-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <Shield className="h-7 w-7 text-accent" />
            <span className="font-display text-lg font-bold text-primary-foreground">
              Exam Guardian
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sidebar-accent text-accent"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-primary-foreground">{user?.name}</p>
              <p className="text-xs text-primary-foreground/60 capitalize">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden gradient-primary border-b border-sidebar-border px-4 py-2 flex gap-1 overflow-x-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-sidebar-accent text-accent"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
