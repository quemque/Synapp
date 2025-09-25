import { useState, KeyboardEvent, useEffect } from "react";
import "./EditableTaskField.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { getCategoryColor, getCategoryIcon } from "../handlers/GetTags.tsx";
import { Task } from "../../types/index.ts";
import {
  FaGripLines,
  FaCheckCircle,
  FaRegCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { default_category_id } from "../data/categories.js";

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
  const [editText, setEditText] = useState(task.text || "");
  const [timeRemaining, setTimeRemaining] = useState<{
    value: string;
    label: string;
    status: string;
  }>({
    value: "",
    label: "",
    status: "",
  });

  const taskCategory = task.category || default_category_id;

  const calculateTimeRemaining = (
    notificationTime: Date
  ): { value: string; label: string; status: string } => {
    const now = new Date();
    const diff = notificationTime.getTime() - now.getTime();

    if (diff <= 0) {
      return { value: "Past due", label: "", status: "past" };
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return { value: `${days}d`, label: "left", status: "later" };
    } else if (hours > 0) {
      return {
        value: `${hours}h`,
        label: "left",
        status: hours <= 2 ? "soon" : "later",
      };
    } else {
      return {
        value: `${minutes}m`,
        label: "left",
        status: minutes <= 30 ? "urgent" : "soon",
      };
    }
  };

  useEffect(() => {
    if (!task.notificationTime || task.completed) return;

    setTimeRemaining(calculateTimeRemaining(new Date(task.notificationTime)));

    const interval = setInterval(() => {
      setTimeRemaining(
        calculateTimeRemaining(new Date(task.notificationTime!))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [task.notificationTime, task.completed]);

  const getCategoryName = (category: string) => {
    const cat = category || default_category_id;
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(task.text || "");
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
      setEditText(task.text || "");
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

        {task.notificationTime && !task.completed && timeRemaining.value && (
          <div className={`time-remaining ${timeRemaining.status}`}>
            <span className="time-value">{timeRemaining.value}</span>
            <span className="time-label">{timeRemaining.label}</span>
          </div>
        )}

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
