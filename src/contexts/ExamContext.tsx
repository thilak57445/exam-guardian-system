import React, { createContext, useContext, useState, useCallback } from "react";

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
  createdBy: string;
  createdAt: string;
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

// Sample data
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1", type: "mcq", text: "What is the time complexity of binary search?",
    options: [
      { id: "a", text: "O(n)" }, { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n²)" }, { id: "d", text: "O(1)" },
    ],
    correctAnswer: "b", points: 5,
  },
  {
    id: "q2", type: "mcq", text: "Which data structure uses FIFO ordering?",
    options: [
      { id: "a", text: "Stack" }, { id: "b", text: "Queue" },
      { id: "c", text: "Tree" }, { id: "d", text: "Graph" },
    ],
    correctAnswer: "b", points: 5,
  },
  {
    id: "q3", type: "short", text: "Explain the concept of polymorphism in OOP.",
    correctAnswer: "polymorphism", points: 10,
  },
];

const INITIAL_EXAMS: Exam[] = [
  {
    id: "e1", title: "Data Structures & Algorithms", description: "Mid-semester examination covering arrays, linked lists, trees, and sorting algorithms.",
    duration: 30, startTime: "2026-03-29T09:00", endTime: "2026-04-30T23:59",
    questions: SAMPLE_QUESTIONS, createdBy: "t1", createdAt: "2026-03-28T10:00",
  },
  {
    id: "e2", title: "Database Management Systems", description: "Final exam on SQL, normalization, and ER diagrams.",
    duration: 45, startTime: "2026-03-29T09:00", endTime: "2026-04-30T23:59",
    questions: [
      {
        id: "q4", type: "mcq", text: "What does SQL stand for?",
        options: [
          { id: "a", text: "Structured Query Language" }, { id: "b", text: "Simple Query Language" },
          { id: "c", text: "Standard Query Logic" }, { id: "d", text: "System Query Language" },
        ],
        correctAnswer: "a", points: 5,
      },
      {
        id: "q5", type: "short", text: "What is normalization in databases?",
        correctAnswer: "normalization", points: 10,
      },
    ],
    createdBy: "t1", createdAt: "2026-03-27T14:00",
  },
];

const INITIAL_RESULTS: ExamResult[] = [
  {
    id: "r1", examId: "e1", studentId: "s1", studentName: "John Doe",
    answers: { q1: "b", q2: "b", q3: "Polymorphism allows objects to take many forms" },
    score: 20, totalPoints: 20, submittedAt: "2026-03-29T10:25", tabSwitches: 1,
  },
];

interface ExamContextType {
  exams: Exam[];
  results: ExamResult[];
  addExam: (exam: Omit<Exam, "id" | "createdAt">) => void;
  submitResult: (result: Omit<ExamResult, "id">) => void;
  getExamById: (id: string) => Exam | undefined;
  getResultsForExam: (examId: string) => ExamResult[];
  getResultsForStudent: (studentId: string) => ExamResult[];
  hasStudentAttempted: (examId: string, studentId: string) => boolean;
}

const ExamContext = createContext<ExamContextType | null>(null);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [results, setResults] = useState<ExamResult[]>(INITIAL_RESULTS);

  const addExam = useCallback((exam: Omit<Exam, "id" | "createdAt">) => {
    setExams((prev) => [...prev, { ...exam, id: `e${Date.now()}`, createdAt: new Date().toISOString() }]);
  }, []);

  const submitResult = useCallback((result: Omit<ExamResult, "id">) => {
    setResults((prev) => [...prev, { ...result, id: `r${Date.now()}` }]);
  }, []);

  const getExamById = useCallback((id: string) => exams.find((e) => e.id === id), [exams]);
  const getResultsForExam = useCallback((examId: string) => results.filter((r) => r.examId === examId), [results]);
  const getResultsForStudent = useCallback((studentId: string) => results.filter((r) => r.studentId === studentId), [results]);
  const hasStudentAttempted = useCallback((examId: string, studentId: string) =>
    results.some((r) => r.examId === examId && r.studentId === studentId), [results]);

  return (
    <ExamContext.Provider value={{ exams, results, addExam, submitResult, getExamById, getResultsForExam, getResultsForStudent, hasStudentAttempted }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExams = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExams must be used within ExamProvider");
  return ctx;
};
