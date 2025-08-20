import { FaCheckCircle, FaRegCircle, FaTrashAlt } from "react-icons/fa";
import "./TaskField.css";

export default function TaskField({ task, onToggleComplete, onDelete }) {
  return (
    <div className={`task-item ${task.completed ? true : false}`}>
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

      <span className="task-text">{task.text}</span>

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
