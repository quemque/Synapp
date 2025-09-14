import React, { useState } from "react";
import { Task } from "../types";
import "./ShedulePage.css";

interface SchedulePageProps {
  tasks: Task[];
  addTask: (text: string, category?: string, dueDate?: Date) => Promise<void>;
  deleteTask: (id: string) => void;
  editTask: (
    id: string,
    newText: string,
    newCategory?: string,
    dueDate?: Date
  ) => void;
}
const SchedulePage: React.FC<SchedulePageProps> = ({
  tasks,
  addTask,
  deleteTask,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("09:00");
  const [newTaskDay, setNewTaskDay] = useState("Monday");
  const [newTaskDuration, setNewTaskDuration] = useState(1);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeSlots = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  // Фильтруем задачи для расписания (те что имеют время)
  const scheduleTasks = tasks.filter((task) => task.dueDate);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTaskText("");
    setNewTaskTime("09:00");
    setNewTaskDay("Monday");
    setNewTaskDuration(1);
  };

  const handleSaveNewTask = () => {
    if (newTaskText.trim()) {
      // Создаем дату для выбранного дня и времени
      const now = new Date();
      const [hours, minutes] = newTaskTime.split(":").map(Number);
      const dueDate = new Date(now);
      dueDate.setHours(hours, minutes, 0, 0);

      // Устанавливаем день недели
      const dayIndex = daysOfWeek.indexOf(newTaskDay);
      const currentDay = now.getDay();
      const daysToAdd = (dayIndex - currentDay + 7) % 7;
      dueDate.setDate(now.getDate() + daysToAdd);

      addTask(newTaskText.trim(), "schedule", dueDate);
      handleCancelAdd();
    }
  };

  const getTasksForDayAndTime = (day: string, time: string) => {
    return scheduleTasks.filter((task) => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      const taskHours = taskDate.getHours().toString().padStart(2, "0");
      const taskMinutes = taskDate.getMinutes().toString().padStart(2, "0");
      const taskTime = `${taskHours}:${taskMinutes}`;

      // Получаем день недели задачи (0-6, где 0 - воскресенье)
      const taskDayIndex = taskDate.getDay();
      // Конвертируем в наш формат дней (понедельник = 0)
      const taskDay = daysOfWeek[(taskDayIndex + 6) % 7];

      return taskDay === day && taskTime === time;
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hourNum = parseInt(hours);
    return `${hourNum % 12 || 12}:${minutes} ${hourNum >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1 className="text-capital">Weekly Schedule</h1>
        <button className="add-schedule-btn" onClick={handleAddClick}>
          + Add Activity
        </button>
      </div>

      {isAdding && (
        <div className="schedule-add-form">
          <h3>Add New Activity</h3>
          <input
            type="text"
            placeholder="Activity name"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="schedule-input"
          />
          <select
            value={newTaskDay}
            onChange={(e) => setNewTaskDay(e.target.value)}
            className="schedule-select"
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <select
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            className="schedule-select"
          >
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {formatTime(time)}
              </option>
            ))}
          </select>
          <select
            value={newTaskDuration}
            onChange={(e) => setNewTaskDuration(Number(e.target.value))}
            className="schedule-select"
          >
            {[1, 2, 3, 4].map((hours) => (
              <option key={hours} value={hours}>
                {hours} hour{hours > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <div className="schedule-form-buttons">
            <button onClick={handleSaveNewTask} className="save-btn">
              Save
            </button>
            <button onClick={handleCancelAdd} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="schedule-grid">
        <div className="time-column">
          <div className="time-header">Time</div>
          {timeSlots.map((time) => (
            <div key={time} className="time-slot">
              {formatTime(time)}
            </div>
          ))}
        </div>

        {daysOfWeek.map((day) => (
          <div key={day} className="day-column">
            <div className="day-header">{day}</div>
            {timeSlots.map((time) => {
              const tasks = getTasksForDayAndTime(day, time);
              return (
                <div key={time} className="schedule-cell">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="schedule-activity"
                      style={{ height: `${(task.dueDate ? 1 : 1) * 60}px` }}
                    >
                      <div className="activity-content">
                        <span className="activity-title">
                          {task.title || task.text}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="activity-delete"
                          title="Delete activity"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
