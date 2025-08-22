import {
  FaHome,
  FaBriefcase,
  FaBook,
  FaShoppingCart,
  FaHeart,
  FaEllipsisH,
  FaCheckCircle,
  FaRegCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { useState } from "react";
import "./EditableTaskField.css";

export default function EditableTaskField({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const taskCategory = task.category || "general";

  const getCategoryColor = (category) => {
    const cat = category || "general";
    switch (cat) {
      case "home":
        return "#28a745";
      case "work":
        return "#007bff";
      case "study":
        return "#ffc107";
      case "shopping":
        return "#fd7e14";
      case "personal":
        return "#e83e8c";
      default:
        return "#6c757d";
    }
  };

  const getCategoryIcon = (category) => {
    const cat = category || "general";
    switch (cat) {
      case "home":
        return <FaHome />;
      case "work":
        return <FaBriefcase />;
      case "study":
        return <FaBook />;
      case "shopping":
        return <FaShoppingCart />;
      case "personal":
        return <FaHeart />;
      default:
        return <FaEllipsisH />;
    }
  };

  const getCategoryName = (category) => {
    const cat = category || "general";
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(task.text);
    }
  };

  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
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
  );
}
