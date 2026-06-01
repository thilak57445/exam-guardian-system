import { useAuth } from "@/contexts/AuthContext";
import { useExams } from "@/contexts/ExamContext";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, CheckCircle, AlertCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { exams, hasStudentAttempted, getResultsForStudent } = useExams();
  const navigate = useNavigate();

  const myResults = getResultsForStudent(user?.id || "");
  const now = new Date();

  const availableExams = exams.filter((e) => {
    const start = new Date(e.startTime);
    const end = new Date(e.endTime);
    return now >= start && now <= end;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">View available exams and your results.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><BookOpen className="h-5 w-5" /></div>
            <div><p className="text-2xl font-display font-bold">{availableExams.length}</p><p className="text-sm text-muted-foreground">Available Exams</p></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success"><CheckCircle className="h-5 w-5" /></div>
            <div><p className="text-2xl font-display font-bold">{myResults.length}</p><p className="text-sm text-muted-foreground">Completed</p></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><AlertCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-display font-bold">
                {myResults.length > 0 ? Math.round(myResults.reduce((a, r) => a + (r.score / r.totalPoints) * 100, 0) / myResults.length) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Available Exams */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Available Exams</h2>
        {availableExams.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center border border-border shadow-card">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No exams available right now.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {availableExams.map((exam, i) => {
              const attempted = hasStudentAttempted(exam.id, user?.id || "");
              return (
                <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-5 shadow-card border border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{exam.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration} min</span>
                        <span>{exam.questions.length} questions</span>
                      </div>
                    </div>
                    {attempted ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-success/10 text-success text-sm font-medium">
                        <CheckCircle className="h-4 w-4" /> Completed
                      </span>
                    ) : (
                      <Button onClick={() => navigate(`/exam/${exam.id}`)} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                        <Play className="h-4 w-4" /> Start Exam
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
