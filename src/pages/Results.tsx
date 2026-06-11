import { useAuth } from "@/contexts/AuthContext";
import { useExams } from "@/contexts/ExamContext";
import Layout from "@/components/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle } from "lucide-react";

const Results = () => {
  const { user } = useAuth();
  const { exams, results } = useExams();

  const myExams = exams.filter((e) => e.teacherId === user?.id);

  // Export CSV
  const exportCSV = (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    const examResults = results.filter((r) => r.examId === examId);
    if (!exam || examResults.length === 0) return;

    const header = "Student,Score,Total,Percentage,Tab Switches,Submitted At\n";
    const rows = examResults.map((r) =>
      `${r.studentName},${r.score},${r.totalPoints},${Math.round((r.score / r.totalPoints) * 100)}%,${r.tabSwitches},${r.submittedAt}`
    ).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam.title}_results.csv`;
    a.click();
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Exam Results</h1>

        {myExams.map((exam) => {
          const examResults = results.filter((r) => r.examId === exam.id);
          return (
            <div key={exam.id} className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
                <div>
                  <h2 className="font-display font-semibold text-lg">{exam.title}</h2>
                  <p className="text-sm text-muted-foreground">{examResults.length} submissions</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportCSV(exam.id)} className="gap-2" disabled={examResults.length === 0}>
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
              {examResults.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No submissions yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Tab Switches</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examResults.map((r) => {
                      const pct = Math.round((r.score / r.totalPoints) * 100);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.studentName}</TableCell>
                          <TableCell>{r.score}/{r.totalPoints}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${pct >= 60 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                              {pct}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {r.tabSwitches > 0 ? (
                              <span className="flex items-center gap-1 text-warning text-sm"><AlertTriangle className="h-3.5 w-3.5" />{r.tabSwitches}</span>
                            ) : <span className="text-muted-foreground">0</span>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(r.submittedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default Results;
