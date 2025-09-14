import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaRegCircle,
  FaTrashAlt,
  FaGripLines,
  FaTag,
} from "react-icons/fa";
import {
  getCategoryColor,
  getCategoryIcon,
} from "../components/handlers/GetTags";
import { IoMdAdd, IoMdClose, IoMdSend } from "react-icons/io";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItemProps, TagsPageProps } from "../types";
import "./TagsPage.css";

function TaskItem({ task, onToggleComplete, onDelete, onEdit }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.title || task.text || "");

  const taskCategory = task.category || "general";

  const getCategoryName = (category: string) => {
    const cat = category || "general";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(task.title || task.text || "");
  };

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(task.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(task.title || task.text || "");
    }
  };

  const taskText = task.title || task.text || "";

  return (
    <div className="task-items">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`task-item ${task.completed ? "completed" : ""}`}
      >
        <div className="drag-handle-container">
          <FaGripLines className="drag-handle-icon" {...listeners} />
        </div>
        <div
          title="Complete task"
          className="task-status"
          onClick={() => onToggleComplete(task.id)}
        >
          {task.completed ? (
            <FaCheckCircle className="icon completed-icon" />
          ) : (
            <FaRegCircle className="icon incomplete-icon" />
          )}
        </div>

        <div
          className="task-category"
          style={{ color: getCategoryColor(taskCategory) }}
          title={getCategoryName(taskCategory)}
        >
          {getCategoryIcon(taskCategory)}
        </div>

        {isEditing ? (
          <input
            type="text"
            className="task-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            autoFocus
          />
        ) : (
          <span
            className="task-text"
            onDoubleClick={handleDoubleClick}
            title="Double click to edit"
          >
            {taskText}
          </span>
        )}

        <div className="task-actions">
          <button
            className="delete-btn"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            <FaTrashAlt className="icon trash-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

const TagsPage: React.FC<TagsPageProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onEdit,
  reorderTasks,
  addTask,
}) => {
  const { tagName } = useParams<{ tagName: string }>();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const filteredTasks = tasks.filter((task) => {
    return task.category && task.category === tagName;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTasks(oldIndex, newIndex);
      }
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTaskText("");
  };

  const handleSaveNewTask = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText.trim(), tagName);
      setNewTaskText("");
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveNewTask();
    } else if (e.key === "Escape") {
      handleCancelAdd();
    }
  };

  return (
    <div className="tags-page">
      <div className="tags-header">
        <h1>
          <FaTag className="tag-header-icon" /> Tasks with category: {tagName}
        </h1>
        <p className="tasks-count">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}{" "}
          found
        </p>
      </div>

      {filteredTasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="tasks-container">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="no-tasks-message">
          No tasks found with the category {tagName}
        </p>
      )}

      <div className="add-box">
        <div className="add-content">
          {!isAdding ? (
            <button className="button-add-Intag" onClick={handleAddClick}>
              <IoMdAdd className="add-Intag" /> Add task
            </button>
          ) : (
            <div className="simple-add-container">
              <input
                type="text"
                className="simple-task-input"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                placeholder="Enter task text..."
              />
              <div className="simple-add-buttons">
                <button
                  className="simple-send-btn"
                  onClick={handleSaveNewTask}
                  disabled={!newTaskText.trim()}
                  title="Send"
                >
                  <IoMdSend style={{ color: "white" }} />
                </button>
                <button
                  className="simple-cancel-btn"
                  onClick={handleCancelAdd}
                  title="Cancel"
                >
                  <IoMdClose className="icon-close" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
