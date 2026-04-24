import QuizApp from "./components/QuizApp";
import AdminPanel from "./components/AdminPanel";

export default function BrandedQuizSystem() {
  const isAdmin = typeof window !== "undefined" && window.location.hash === "#admin";
  return isAdmin ? <AdminPanel /> : <QuizApp />;
}
