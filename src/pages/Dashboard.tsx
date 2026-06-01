import { useAuth } from "@/contexts/AuthContext";
import TeacherDashboard from "@/components/TeacherDashboard";
import StudentDashboard from "@/components/StudentDashboard";
import Layout from "@/components/Layout";

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <Layout>
      {user?.role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />}
    </Layout>
  );
};

export default Dashboard;
