import { useState, KeyboardEvent } from "react";
import "./EditableTaskField.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCategoryColor, getCategoryIcon } from "./handlers/GetTags.jsx";
import { Task } from "../types";
import {
  FaGripLines,
  FaCheckCircle,
  FaRegCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { default_category_id } from "../data/categories";

interface TaskitemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTask: string) => void;
}

export default function EditableTaskField({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
}: TaskitemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task: task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const taskCategory = task.category || default_category_id;

  const getCategoryName = (category: string) => {
    const cat = category || default_category_id;
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(task.text);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(task.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(task.text);
    }
  };

  return (
    <div className="task-items">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`task-item ${task.completed ? "completed" : ""} ${
          isDragging ? "dragging" : ""
        }`}
      >
        <div className="drag-handle-container">
          <FaGripLines
            className="drag-handle-icon"
            {...listeners}
            onClick={(e) => e.preventDefault()}
            onDoubleClick={(e) => e.preventDefault()}
          />
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
            {task.text}
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
