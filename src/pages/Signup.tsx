import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Shield, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(name, email, password, role);
      navigate("/dashboard");
    } catch {
      toast({ title: "Signup Failed", description: "Email may already exist.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-accent" />
            <span className="font-display text-2xl font-bold text-primary-foreground">Exam Guardian</span>
          </div>
          <p className="text-primary-foreground/60">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-elevated p-8 space-y-5">
          <div className="space-y-2">
            <Label>I am a</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["student", "teacher"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                    role === r ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  {r === "teacher" ? "👨‍🏫 Teacher" : "🎓 Student"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
            </div>
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
