import React from "react";
import TaskForm from "../components/ui/TaskForm.tsx";
import EditableTaskField from "../components/ui/EditableTaskField.tsx";
import Buttons from "../components/ui/Buttons.tsx";
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

const HomePage = ({
  tasks = [],
  addTask,
  deleteTask,
  toggleTask,
  toggleClean,
  toggleFilter,
  editTask,
  reorderTasks,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTasks(oldIndex, newIndex);
      }
    }
  };

  return (
    <div>
      <h1 className="text-capital">Synapp</h1>
      <TaskForm onAddTask={addTask} />

      {tasks && tasks.length > 0 && (
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
};

export default HomePage;
