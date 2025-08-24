import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import HomePage from "./pages/HomePage";
import TagsPage from "./pages/TagsPage";
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
            <Route path="/tags" element={<TagsPage tasks={tasks} />} />
            <Route path="/tags/:tagName" element={<TagsPage tasks={tasks} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
