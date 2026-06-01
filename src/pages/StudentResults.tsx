import { useAuth } from "@/contexts/AuthContext";
import { useExams } from "@/contexts/ExamContext";
import Layout from "@/components/Layout";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const StudentResults = () => {
  const { user } = useAuth();
  const { getResultsForStudent, getExamById } = useExams();

  const myResults = getResultsForStudent(user?.id || "");

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">My Results</h1>

        {myResults.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center border border-border shadow-card">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No exam results yet. Take an exam to see your scores here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {myResults.map((result, i) => {
              const exam = getExamById(result.examId);
              const pct = Math.round((result.score / result.totalPoints) * 100);
              const passed = pct >= 60;
              return (
                <motion.div key={result.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-5 shadow-card border border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{exam?.title || "Unknown Exam"}</h3>
                      <p className="text-sm text-muted-foreground">Submitted: {new Date(result.submittedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="font-display font-bold text-lg">{result.score}/{result.totalPoints}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${passed ? "bg-success/10" : "bg-destructive/10"}`}>
                        {passed ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                        <span className={`text-xs font-bold ${passed ? "text-success" : "text-destructive"}`}>{pct}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentResults;
