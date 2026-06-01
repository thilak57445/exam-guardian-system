import { useNavigate } from "react-router-dom";
import { Shield, BookOpen, Timer, Eye, Lock, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  { icon: BookOpen, title: "Smart Exam Creation", desc: "Create MCQ and short-answer questions with auto-evaluation." },
  { icon: Timer, title: "Timed Assessments", desc: "Auto-submit when time runs out with countdown timer." },
  { icon: Eye, title: "Proctoring", desc: "Tab-switch detection, fullscreen mode, and webcam monitoring." },
  { icon: Lock, title: "Secure Environment", desc: "Disable right-click, copy-paste prevention, and more." },
  { icon: BarChart3, title: "Instant Results", desc: "Auto-graded MCQs with detailed score breakdown." },
  { icon: Shield, title: "Role-Based Access", desc: "Separate dashboards for teachers and students." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero min-h-[85vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Secure Online Examination Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6">
              Conduct Exams with
              <span className="text-accent"> Confidence</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl">
              A comprehensive platform for creating, conducting, and evaluating online examinations with built-in proctoring and anti-cheating measures.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 gap-2"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/signup")}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Create Account
              </Button>
            </div>

            {/* Demo credentials */}
            <div className="mt-8 p-4 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 max-w-md">
              <p className="text-xs font-semibold text-accent mb-2">DEMO CREDENTIALS</p>
              <div className="grid grid-cols-2 gap-3 text-sm text-primary-foreground/70">
                <div>
                  <p className="font-medium text-primary-foreground/90">Teacher</p>
                  <p>teacher@exam.com</p>
                </div>
                <div>
                  <p className="font-medium text-primary-foreground/90">Student</p>
                  <p>student@exam.com</p>
                </div>
                <p className="col-span-2 text-xs">Password: password</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete examination management system built for educators and students.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-card shadow-card border border-border hover:shadow-elevated transition-shadow group"
                >
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-primary py-8 px-4">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-display font-bold text-primary-foreground">Exam Guardian</span>
          </div>
          <p className="text-primary-foreground/50 text-sm">
            © 2026 Exam Guardian System — College Project (IDP)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
