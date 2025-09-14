import React, { useState, useEffect, useRef } from "react";
import { useActivity } from "../hooks/useActivity";
import "./ShedulePage.css";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getCustomDayIndex = (jsDay: number) => (jsDay + 6) % 7;

const SchedulePage: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityTime, setNewActivityTime] = useState("09:00");
  const [newActivityDay, setNewActivityDay] = useState("Monday");
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Новое состояние для сортировки

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addActivity, deleteActivity, getActivitiesForDay, hasActivities } =
    useActivity();

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Обработчик свайпов для мобильных устройств
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isMobile) return;

    let startX: number;
    let scrollLeft: number;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      isScrolling = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling) return;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isScrolling = false;
    };

    const handleScroll = () => {
      const scrollPos = container.scrollLeft;
      const dayWidth = container.clientWidth;
      const newIndex = Math.round(scrollPos / dayWidth);
      setCurrentDayIndex(
        Math.max(0, Math.min(newIndex, daysOfWeek.length - 1))
      );
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  // Функция для сортировки активностей по времени
  const getSortedActivitiesForDay = (day: string) => {
    const activities = getActivitiesForDay(day);

    return activities.sort((a, b) => {
      const timeA = convertTimeToMinutes(a.time);
      const timeB = convertTimeToMinutes(b.time);

      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  };

  // Конвертирует время в формате "HH:MM" в минуты
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Функция для переключения порядка сортировки
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const scrollToDay = (index: number) => {
    const container = scrollContainerRef.current;
    if (container && isMobile) {
      const dayWidth = container.clientWidth;
      container.scrollTo({
        left: index * dayWidth,
        behavior: "smooth",
      });
    }
  };

  const handleAddClick = () => setIsAdding(true);

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewActivityTitle("");
    setNewActivityTime("09:00");
    setNewActivityDay("Monday");
  };

  const handleSaveNewActivity = async () => {
    if (newActivityTitle.trim()) {
      const now = new Date();
      const [hours, minutes] = newActivityTime.split(":").map(Number);
      const dueDate = new Date(now);
      dueDate.setHours(hours, minutes, 0, 0);

      const dayIndex = daysOfWeek.indexOf(newActivityDay);
      const currentDayIndex = getCustomDayIndex(now.getDay());
      const daysToAdd = (dayIndex - currentDayIndex + 7) % 7;
      dueDate.setDate(now.getDate() + daysToAdd);

      await addActivity(
        newActivityTitle.trim(),
        newActivityDay,
        newActivityTime,
        dueDate
      );
      handleCancelAdd();
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? "PM" : "AM"}`;
  };

  if (!hasActivities && !isAdding) {
    return (
      <div className="schedule-page">
        <div className="schedule-header">
          <h1>Weekly Schedule</h1>
          <button className="add-schedule-btn" onClick={handleAddClick}>
            + Add Activity
          </button>
        </div>

        <div className="no-activities">
          <div className="no-activities-content">
            <h2>No activities yet</h2>
            <p>Add your first activity to see your weekly schedule</p>
            <button className="add-first-activity" onClick={handleAddClick}>
              Add First Activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>Weekly Schedule</h1>
        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            className="sort-button"
            onClick={toggleSortOrder}
            style={{
              background: "#333",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span>{sortOrder === "asc" ? "↑ Time" : "↓ Time"}</span>
          </button>
          <button className="add-schedule-btn" onClick={handleAddClick}>
            + Add Activity
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="schedule-add-form">
          <h3>Add New Activity</h3>
          <input
            type="text"
            placeholder="Activity name"
            value={newActivityTitle}
            onChange={(e) => setNewActivityTitle(e.target.value)}
            className="schedule-input"
          />
          <select
            value={newActivityDay}
            onChange={(e) => setNewActivityDay(e.target.value)}
            className="schedule-select"
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={newActivityTime}
            onChange={(e) => setNewActivityTime(e.target.value)}
            className="schedule-select"
          />
          <div className="schedule-form-buttons">
            <button onClick={handleSaveNewActivity} className="save-btn">
              Save
            </button>
            <button onClick={handleCancelAdd} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isMobile ? (
        <>
          <div ref={scrollContainerRef} className="schedule-scroll-container">
            <div className="schedule-grid">
              {daysOfWeek.map((day, index) => {
                const dayActivities = getSortedActivitiesForDay(day);
                return (
                  <div key={day} className="day-column" id={`day-${index}`}>
                    <div className="day-header">{day}</div>
                    {dayActivities.map((activity) => (
                      <div key={activity.id} className="schedule-cell">
                        <div className="schedule-activity">
                          <div className="activity-content">
                            <span className="activity-time">
                              {formatTime(activity.time)}
                            </span>
                            <span className="activity-title">
                              {activity.title}
                            </span>
                            <button
                              onClick={() => deleteActivity(activity.id)}
                              className="activity-delete"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dayActivities.length === 0 && (
                      <div className="schedule-cell">
                        <div
                          className="schedule-activity"
                          style={{ background: "#2a2a2a", cursor: "default" }}
                        >
                          <div className="activity-content">
                            <span
                              className="activity-title"
                              style={{ color: "#888", fontStyle: "italic" }}
                            >
                              No activities planned
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Навигационные точки для мобильных */}
          <div className="schedule-nav-dots">
            {daysOfWeek.map((_, index) => (
              <div
                key={index}
                className={`nav-dot ${
                  currentDayIndex === index ? "active" : ""
                }`}
                onClick={() => scrollToDay(index)}
              />
            ))}
          </div>

          {/* Индикатор свайпа */}
          {hasActivities && (
            <div className="swipe-indicator">← Swipe to see other days →</div>
          )}
        </>
      ) : (
        /* Десктопная версия */
        <div className="schedule-grid">
          {daysOfWeek.map((day) => {
            const dayActivities = getSortedActivitiesForDay(day);
            return (
              <div key={day} className="day-column">
                <div className="day-header">{day}</div>
                {dayActivities.map((activity) => (
                  <div key={activity.id} className="schedule-cell">
                    <div className="schedule-activity">
                      <div className="activity-content">
                        <span className="activity-time">
                          {formatTime(activity.time)}
                        </span>
                        <span className="activity-title">{activity.title}</span>
                        <button
                          onClick={() => deleteActivity(activity.id)}
                          className="activity-delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {dayActivities.length === 0 && (
                  <div className="schedule-cell">
                    <div
                      className="schedule-activity"
                      style={{ background: "#2a2a2a", cursor: "default" }}
                    >
                      <div className="activity-content">
                        <span
                          className="activity-title"
                          style={{ color: "#888", fontStyle: "italic" }}
                        >
                          No activities planned
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
