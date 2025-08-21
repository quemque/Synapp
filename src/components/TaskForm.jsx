import { useState } from "react";
import "./TaskForm.css";
import { MdKeyboardReturn } from "react-icons/md";

export default function TaskForm({ onAddTask }) {
  const [inputValue, setInputValue] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue);
      setInputValue("");
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="form-items">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter new todo"
          className="task-input"
        />
        <button type="submit" className="task-input-button">
          <MdKeyboardReturn className="icon-submit" />
        </button>
      </form>
    </div>
  );
}
