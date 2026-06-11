import { useAuth } from "@/contexts/AuthContext";
import { useExams } from "@/contexts/ExamContext";
import { useNavigate } from "react-router-dom";
import { Plus, ClipboardList, Users, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { exams, results } = useExams();
  const navigate = useNavigate();

  const myExams = exams.filter((e) => e.teacherId === user?.id);
  const totalStudents = new Set(results.filter((r) => myExams.some((e) => e.id === r.examId)).map((r) => r.studentId)).size;
  const totalSubmissions = results.filter((r) => myExams.some((e) => e.id === r.examId)).length;

  const stats = [
    { label: "Total Exams", value: myExams.length, icon: ClipboardList, color: "bg-accent/10 text-accent" },
    { label: "Students", value: totalStudents, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Submissions", value: totalSubmissions, icon: BarChart3, color: "bg-success/10 text-success" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Manage your exams and view student performance.</p>
        </div>
        <Button onClick={() => navigate("/create-exam")} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
          <Plus className="h-4 w-4" /> Create Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Exams */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Your Exams</h2>
        {myExams.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center border border-border shadow-card">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No exams created yet. Create your first exam!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {myExams.map((exam, i) => {
              const submissions = results.filter((r) => r.examId === exam.id);
              return (
                <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow cursor-pointer"
                  onClick={() => navigate("/results", { state: { examId: exam.id } })}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{exam.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.duration}m</span>
                      <span>{exam.questions.length} Q</span>
                      <span className="text-accent font-medium">{submissions.length} submitted</span>
                    </div>
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

export default TeacherDashboard;
