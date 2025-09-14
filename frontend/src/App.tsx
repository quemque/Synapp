import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import HomePage from "./pages/HomePage";
import TagsPage from "./pages/TagsPage";
import SchedulePage from "./pages/ShedulePage";
import LoginPage from "./components/Auth/LoginPage";
import RegisterPage from "./components/Auth/Register";
import { useTask } from "./hooks/useTask";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

function AppContent() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTask,
    toggleClean,
    toggleFilter,
    editTask,
    reorderTasks,
  } = useTask();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <HomePage
                tasks={tasks}
                addTask={addTask}
                deleteTask={deleteTask}
                toggleTask={toggleTask}
                toggleClean={toggleClean}
                toggleFilter={toggleFilter}
                editTask={editTask}
                reorderTasks={reorderTasks}
              />
            }
          />
          <Route
            path="/tags/:tagName"
            element={
              <TagsPage
                tasks={tasks}
                onToggleComplete={toggleTask}
                onDelete={deleteTask}
                onEdit={editTask}
                reorderTasks={reorderTasks}
                addTask={addTask}
              />
            }
          />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
