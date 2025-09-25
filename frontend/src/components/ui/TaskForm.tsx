import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "./TaskForm.css";
import {
  MdKeyboardReturn,
  MdNotifications,
  MdNotificationsOff,
} from "react-icons/md";
import { CATEGORIES, default_category_id } from "../data/categories";

interface TaskForm {
  onAddTask: (
    text: string,
    category?: string,
    notificationTime?: Date | null
  ) => Promise<void>;
}

export default function TaskForm({ onAddTask }: TaskForm) {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(default_category_id);
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);
  const [showNotificationPicker, setShowNotificationPicker] =
    useState<boolean>(false);
  const [notificationTime, setNotificationTime] = useState<string>("");

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const notificationPickerRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const categories = CATEGORIES;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (showCategoryMenu) {
        const isClickInsideMenu = categoryMenuRef.current?.contains(target);
        const isClickOnButton = categoryButtonRef.current?.contains(target);

        if (!isClickInsideMenu && !isClickOnButton) {
          setShowCategoryMenu(false);
        }
      }

      if (showNotificationPicker) {
        const isClickInsidePicker =
          notificationPickerRef.current?.contains(target);
        const isClickOnNotificationButton =
          notificationButtonRef.current?.contains(target);

        if (!isClickInsidePicker && !isClickOnNotificationButton) {
          setShowNotificationPicker(false);
        }
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryMenu, showNotificationPicker]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCategoryMenu(false);
        setShowNotificationPicker(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      try {
        const notificationDate = notificationTime
          ? createNotificationDate(notificationTime)
          : null;
        onAddTask(inputValue, selectedCategory, notificationDate);
        setInputValue("");
        setSelectedCategory(default_category_id);
        setNotificationTime("");
        setShowCategoryMenu(false);
        setShowNotificationPicker(false);
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    }
  };

  const createNotificationDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const notificationDate = new Date();

    const now = new Date();
    if (
      hours < now.getHours() ||
      (hours === now.getHours() && minutes <= now.getMinutes())
    ) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    notificationDate.setHours(hours, minutes, 0, 0);
    return notificationDate;
  };

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryMenu(false);
  }, []);

  const toggleCategoryMenu = () => {
    setShowCategoryMenu((prev) => !prev);
    setShowNotificationPicker(false);
  };

  const toggleNotificationPicker = () => {
    setShowNotificationPicker((prev) => !prev);
    setShowCategoryMenu(false);
  };

  const clearNotification = () => {
    setNotificationTime("");
    setShowNotificationPicker(false);
  };

  const selectedCategoryObj = useMemo(
    () =>
      categories.find((cat) => cat.id === selectedCategory) || categories[0],
    [categories, selectedCategory]
  );

  const formatNotificationTime = (timeString: string): string => {
    if (!timeString) return "";

    const timeFormatted = new Date(
      `2000-01-01T${timeString}`
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return timeFormatted;
  };

  return (
    <div className="rForm">
      <form ref={formRef} onSubmit={handleSubmit} className="form-items">
        <div className="category-selector">
          <button
            ref={categoryButtonRef}
            type="button"
            className="category-button"
            onClick={toggleCategoryMenu}
            title="Select category"
            style={{ color: selectedCategoryObj.color }}
          >
            {selectedCategoryObj.icon}
          </button>

          {showCategoryMenu && (
            <div ref={categoryMenuRef} className="category-menu">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className="category-menu-item"
                  onClick={() => handleCategorySelect(category.id)}
                  title={category.name}
                  style={{ color: category.color }}
                >
                  {category.icon}
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter new todo"
          className="task-input"
          onFocus={() => {
            setShowCategoryMenu(false);
            setShowNotificationPicker(false);
          }}
        />

        <div className="notification-selector">
          <button
            ref={notificationButtonRef}
            type="button"
            className={`notification-button ${
              notificationTime ? "active" : ""
            }`}
            onClick={toggleNotificationPicker}
            title={
              notificationTime
                ? `Notification at ${formatNotificationTime(notificationTime)}`
                : "Set notification time"
            }
          >
            {notificationTime ? <MdNotifications /> : <MdNotificationsOff />}
          </button>

          {showNotificationPicker && (
            <div ref={notificationPickerRef} className="notification-picker">
              <div className="notification-picker-header">
                <span>Set Notification Time</span>
                {notificationTime && (
                  <button
                    type="button"
                    className="clear-notification-btn"
                    onClick={clearNotification}
                    title="Clear notification"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="time-input-container">
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="time-input"
                  step="300"
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="task-input-button">
          <MdKeyboardReturn className="icon-submit" />
        </button>
      </form>
    </div>
  );
}
