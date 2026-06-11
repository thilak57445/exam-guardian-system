import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useExams } from "@/contexts/ExamContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, AlertTriangle, Shield, ChevronLeft, ChevronRight, Send, Camera } from "lucide-react";

const ExamInterface = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { getExamById, submitResult, hasStudentAttempted } = useExams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const exam = getExamById(id || "");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if already attempted
  useEffect(() => {
    if (exam && user && hasStudentAttempted(exam.id, user.id)) {
      toast({ title: "Already Attempted", description: "You have already taken this exam.", variant: "destructive" });
      navigate("/dashboard");
    }
  }, [exam, user]);

  // Timer
  useEffect(() => {
    if (!started || submitted || !exam) return;
    setTimeLeft(exam.duration * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, exam]);

  // Tab switch detection
  useEffect(() => {
    if (!started || submitted) return;
    const handler = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        toast({ title: "⚠️ Warning!", description: "Tab switching detected. This will be reported.", variant: "destructive" });
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [started, submitted]);

  // Disable right-click and copy-paste
  useEffect(() => {
    if (!started || submitted) return;
    const preventCtx = (e: MouseEvent) => e.preventDefault();
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "a")) e.preventDefault();
    };
    document.addEventListener("contextmenu", preventCtx);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("paste", preventCopy);
    document.addEventListener("keydown", preventKeys);
    return () => {
      document.removeEventListener("contextmenu", preventCtx);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("paste", preventCopy);
      document.removeEventListener("keydown", preventKeys);
    };
  }, [started, submitted]);

  // Before unload warning
  useEffect(() => {
    if (!started || submitted) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [started, submitted]);

  // Webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { /* webcam optional */ }
  };

  const handleStart = () => {
    setStarted(true);
    startWebcam();
    // Try fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || !user || submitted) return;
    setSubmitted(true);

    // Auto-evaluate MCQs
    let score = 0;
    let totalPoints = 0;
    exam.questions.forEach((q) => {
      totalPoints += q.points;
      if (q.type === "mcq" && answers[q.id] === q.correctAnswer) {
        score += q.points;
      }
      // Short answers get partial credit if keywords match
      if (q.type === "short" && answers[q.id]) {
        const ans = (answers[q.id] || "").toLowerCase();
        const keywords = q.correctAnswer.toLowerCase().split(",").map((k) => k.trim());
        if (keywords.some((k) => ans.includes(k))) score += q.points;
      }
    });

    try {
      await submitResult({
        examId: exam.id, studentId: user.id, studentName: user.name,
        answers, score, totalPoints, submittedAt: new Date().toISOString(), tabSwitches,
      });

      // Exit fullscreen
      document.exitFullscreen?.().catch(() => {});
      // Stop webcam
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }

      toast({ title: "Exam Submitted!", description: `Score: ${score}/${totalPoints}` });
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
      setSubmitted(false);
    }
  }, [exam, user, answers, tabSwitches, submitted, submitResult]);

  if (!exam) return <div className="min-h-screen flex items-center justify-center"><p>Exam not found.</p></div>;

  // Pre-start screen
  if (!started) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-lg w-full text-center space-y-6">
          <Shield className="h-14 w-14 text-accent mx-auto" />
          <h1 className="text-2xl font-display font-bold">{exam.title}</h1>
          <p className="text-muted-foreground">{exam.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-muted rounded-lg p-3"><p className="font-semibold">{exam.duration} min</p><p className="text-muted-foreground">Duration</p></div>
            <div className="bg-muted rounded-lg p-3"><p className="font-semibold">{exam.questions.length}</p><p className="text-muted-foreground">Questions</p></div>
          </div>
          <div className="bg-warning/10 rounded-lg p-4 text-sm text-left space-y-1">
            <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />Exam Rules</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Tab switching will be detected and reported</li>
              <li>Right-click and copy-paste are disabled</li>
              <li>Exam auto-submits when time runs out</li>
              <li>Webcam access will be requested</li>
            </ul>
          </div>
          <Button onClick={handleStart} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            Start Exam
          </Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-muted-foreground">Go Back</Button>
        </div>
      </div>
    );
  }

  // Submitted screen
  if (submitted) {
    let score = 0, total = 0;
    exam.questions.forEach((q) => {
      total += q.points;
      if (q.type === "mcq" && answers[q.id] === q.correctAnswer) score += q.points;
      if (q.type === "short" && answers[q.id]) {
        const ans = (answers[q.id] || "").toLowerCase();
        const keywords = q.correctAnswer.toLowerCase().split(",").map((k) => k.trim());
        if (keywords.some((k) => ans.includes(k))) score += q.points;
      }
    });
    const pct = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-md w-full text-center space-y-6">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-display font-bold ${pct >= 60 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {pct}%
          </div>
          <h1 className="text-2xl font-display font-bold">Exam Completed!</h1>
          <p className="text-muted-foreground">Score: {score}/{total} points</p>
          {tabSwitches > 0 && <p className="text-sm text-warning">⚠️ Tab switches detected: {tabSwitches}</p>}
          <Button onClick={() => navigate("/dashboard")} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Exam interface
  const q = exam.questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">
      {/* Top bar */}
      <div className="gradient-primary px-4 py-3">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-display font-semibold text-primary-foreground text-sm">{exam.title}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Webcam thumbnail */}
            <div className="hidden sm:block w-16 h-12 rounded-md overflow-hidden bg-sidebar-accent">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${timeLeft < 60 ? "bg-destructive/20 text-destructive animate-pulse-glow" : "bg-sidebar-accent text-primary-foreground"}`}>
              <Clock className="h-4 w-4" />
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Question navigation sidebar */}
        <div className="lg:w-48 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {exam.questions.map((question, i) => (
            <button key={question.id} onClick={() => setCurrentQ(i)}
              className={`shrink-0 w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                i === currentQ ? "bg-accent text-accent-foreground shadow-elevated" :
                answers[question.id] ? "bg-success/20 text-success border border-success/30" :
                "bg-card border border-border text-muted-foreground hover:border-accent/50"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question content */}
        <div className="flex-1">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-accent uppercase">
                Question {currentQ + 1} of {exam.questions.length} • {q.type === "mcq" ? "Multiple Choice" : "Short Answer"} • {q.points} pts
              </span>
            </div>
            <h2 className="text-lg font-display font-semibold mb-6">{q.text}</h2>

            {q.type === "mcq" && q.options && (
              <div className="space-y-3">
                {q.options.map((opt) => (
                  <button key={opt.id} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      answers[q.id] === opt.id
                        ? "border-accent bg-accent/5 text-foreground"
                        : "border-border hover:border-accent/40 text-foreground"
                    }`}>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-3 ${
                      answers[q.id] === opt.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {opt.id.toUpperCase()}
                    </span>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {q.type === "short" && (
              <Textarea
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Type your answer here..."
                rows={5}
                className="resize-none"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            {currentQ === exam.questions.length - 1 ? (
              <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                <Send className="h-4 w-4" /> Submit Exam
              </Button>
            ) : (
              <Button onClick={() => setCurrentQ((p) => Math.min(exam.questions.length - 1, p + 1))} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
