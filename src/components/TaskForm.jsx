import { useState } from "react";
import "./TaskForm.css";

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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter new todo"
        />
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
}
