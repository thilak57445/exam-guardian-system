import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useExams, Question, MCQOption } from "@/contexts/ExamContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, GripVertical, Loader2 } from "lucide-react";

const CreateExam = () => {
  const { user } = useAuth();
  const { createExam } = useExams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = (type: "mcq" | "short") => {
    const newQ: Question = {
      id: `nq${Date.now()}`,
      type,
      text: "",
      points: 5,
      correctAnswer: "",
      ...(type === "mcq" ? {
        options: [
          { id: "a", text: "" }, { id: "b", text: "" },
          { id: "c", text: "" }, { id: "d", text: "" },
        ],
      } : {}),
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, ...updates } : q));
  };

  const updateOption = (qIdx: number, optId: string, text: string) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx || !q.options) return q;
      return { ...q, options: q.options.map((o) => o.id === optId ? { ...o, text } : o) };
    }));
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      toast({ title: "Error", description: "Add at least one question.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createExam({
        title,
        description,
        duration,
        startTime,
        endTime,
        questions,
        teacherId: user?.id || "",
        teacherName: user?.name || "",
      });
      toast({ title: "Exam Created!", description: "Your exam is now available for students." });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating exam:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-6">Create New Exam</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Details */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border space-y-4">
            <h2 className="font-display font-semibold text-lg">Exam Details</h2>
            <div className="grid gap-4">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Data Structures Mid-Term" required /></div>
              <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief exam description..." required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>Duration (min)</Label><Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} min={1} required /></div>
                <div><Label>Start Time</Label><Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></div>
                <div><Label>End Time</Label><Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required /></div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg">Questions ({questions.length})</h2>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("mcq")} className="gap-1"><Plus className="h-3 w-3" />MCQ</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addQuestion("short")} className="gap-1"><Plus className="h-3 w-3" />Short Answer</Button>
              </div>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="bg-card rounded-xl p-5 shadow-card border border-border space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-accent uppercase">{q.type === "mcq" ? "Multiple Choice" : "Short Answer"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={q.points} onChange={(e) => updateQuestion(idx, { points: +e.target.value })}
                      className="w-20 text-sm" min={1} placeholder="Points" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(idx)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea value={q.text} onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                  placeholder={`Question ${idx + 1}`} required />

                {q.type === "mcq" && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === opt.id}
                          onChange={() => updateQuestion(idx, { correctAnswer: opt.id })} className="accent-[hsl(175,50%,40%)]" />
                        <Input value={opt.text} onChange={(e) => updateOption(idx, opt.id, e.target.value)}
                          placeholder={`Option ${opt.id.toUpperCase()}`} className="flex-1" required />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">Select the correct answer</p>
                  </div>
                )}

                {q.type === "short" && (
                  <div>
                    <Label className="text-xs">Expected Keywords</Label>
                    <Input value={q.correctAnswer} onChange={(e) => updateQuestion(idx, { correctAnswer: e.target.value })}
                      placeholder="Keywords for evaluation" />
                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div className="bg-card rounded-xl p-12 text-center border border-dashed border-border">
                <p className="text-muted-foreground">No questions added yet. Click the buttons above to add questions.</p>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? "Creating..." : "Create Exam"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateExam;
