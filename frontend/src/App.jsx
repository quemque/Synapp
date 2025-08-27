import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import HomePage from "./pages/HomePage.jsx";
import TagsPage from "./pages/TagsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx"; // Добавьте этот импорт
import { useTask } from "./hooks/useTask.jsx";

function App() {
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
    <Router>
      <div className="app-container">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />{" "}
            {/* Добавьте этот маршрут */}
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
