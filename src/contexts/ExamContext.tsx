import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  QueryConstraint,
} from "firebase/firestore";

export interface MCQOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: "mcq" | "short";
  text: string;
  options?: MCQOption[];
  correctAnswer: string; // option id for MCQ, text for short
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  startTime: string;
  endTime: string;
  questions: Question[];
  teacherId: string;
  teacherName: string;
  createdAt: string;
  status?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string>;
  score: number;
  totalPoints: number;
  submittedAt: string;
  tabSwitches: number;
}

interface ExamContextType {
  exams: Exam[];
  results: ExamResult[];
  createExam: (exam: Omit<Exam, "id" | "createdAt">) => Promise<string>;
  submitResult: (result: Omit<ExamResult, "id">) => Promise<void>;
  getExamById: (id: string) => Exam | undefined;
  getResultsForExam: (examId: string) => ExamResult[];
  getResultsForStudent: (studentId: string) => ExamResult[];
  hasStudentAttempted: (examId: string, studentId: string) => boolean;
  isLoading: boolean;
}

const ExamContext = createContext<ExamContextType | null>(null);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to exams collection in real-time
  useEffect(() => {
    setIsLoading(true);
    const examsRef = collection(db, "exams");
    const examsQuery = query(examsRef, orderBy("createdAt", "desc"));

    const unsubscribeExams = onSnapshot(
      examsQuery,
      (snapshot) => {
        const examsData: Exam[] = [];
        snapshot.forEach((doc) => {
          examsData.push({
            id: doc.id,
            ...doc.data(),
          } as Exam);
        });
        setExams(examsData);
      },
      (error) => {
        console.error("Error loading exams:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribeExams();
  }, []);

  // Listen to submissions collection in real-time
  useEffect(() => {
    const submissionsRef = collection(db, "submissions");
    const submissionsQuery = query(submissionsRef, orderBy("submittedAt", "desc"));

    const unsubscribeSubmissions = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        const submissionsData: ExamResult[] = [];
        snapshot.forEach((doc) => {
          submissionsData.push({
            id: doc.id,
            ...doc.data(),
          } as ExamResult);
        });
        setResults(submissionsData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading submissions:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribeSubmissions();
  }, []);

  const createExam = useCallback(
    async (exam: Omit<Exam, "id" | "createdAt">): Promise<string> => {
      try {
        const examsRef = collection(db, "exams");
        const docRef = await addDoc(examsRef, {
          ...exam,
          createdAt: new Date().toISOString(),
        });
        return docRef.id;
      } catch (error) {
        console.error("Error creating exam:", error);
        throw error;
      }
    },
    []
  );

  const submitResult = useCallback(
    async (result: Omit<ExamResult, "id">): Promise<void> => {
      try {
        const submissionsRef = collection(db, "submissions");
        await addDoc(submissionsRef, {
          ...result,
        });
      } catch (error) {
        console.error("Error submitting result:", error);
        throw error;
      }
    },
    []
  );

  const getExamById = useCallback((id: string) => exams.find((e) => e.id === id), [exams]);

  const getResultsForExam = useCallback(
    (examId: string) => results.filter((r) => r.examId === examId),
    [results]
  );

  const getResultsForStudent = useCallback(
    (studentId: string) => results.filter((r) => r.studentId === studentId),
    [results]
  );

  const hasStudentAttempted = useCallback(
    (examId: string, studentId: string) =>
      results.some((r) => r.examId === examId && r.studentId === studentId),
    [results]
  );

  return (
    <ExamContext.Provider
      value={{
        exams,
        results,
        createExam,
        submitResult,
        getExamById,
        getResultsForExam,
        getResultsForStudent,
        hasStudentAttempted,
        isLoading,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExams = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExams must be used within ExamProvider");
  return ctx;
};
