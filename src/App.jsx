import "./App.css";
import TaskForm from "./components/TaskForm";
import EditableTaskField from "./components/EditableTaskField";
import { useTask } from "./hooks/useTask.jsx";
import Buttons from "./components/Buttons.jsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      reorderTasks(oldIndex, newIndex);
    }
  };

  return (
    <div>
      <h1 className="text-capital">Todo app</h1>
      <TaskForm onAddTask={addTask} />
      {tasks.length > 0 && (
        <Buttons cleaning={toggleClean} filterb={toggleFilter} />
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <EditableTaskField
              key={task.id}
              task={task}
              onToggleComplete={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default App;
