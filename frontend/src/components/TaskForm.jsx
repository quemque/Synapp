import { useState, useRef, useEffect } from "react";
import "./TaskForm.css";
import { MdKeyboardReturn } from "react-icons/md";
import {
  FaHome,
  FaBriefcase,
  FaBook,
  FaShoppingCart,
  FaHeart,
  FaEllipsisH,
  FaFilm,
} from "react-icons/fa";
import { MdNotificationImportant } from "react-icons/md";
export default function TaskForm({ onAddTask }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const categoryMenuRef = useRef(null);
  const categoryButtonRef = useRef(null);

  const categories = [
    { id: "general", name: "General", icon: <FaEllipsisH />, color: "#6c757d" },
    {
      id: "urgent",
      name: "Urgent",
      icon: <MdNotificationImportant />,
      color: "#f1273bff",
    },
    { id: "home", name: "Home", icon: <FaHome />, color: "#28a745" },
    { id: "work", name: "Work", icon: <FaBriefcase />, color: "#007bff" },
    { id: "study", name: "Study", icon: <FaBook />, color: "#ffc107" },
    {
      id: "shopping",
      name: "Shopping",
      icon: <FaShoppingCart />,
      color: "#fd7e14",
    },
    { id: "watch", name: "Watch", icon: <FaFilm />, color: "#ffff" },
    { id: "personal", name: "Personal", icon: <FaHeart />, color: "#e83e8c" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target)
      ) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue, selectedCategory);
      setInputValue("");
      setSelectedCategory("general");
      setShowCategoryMenu(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategoryMenu(false);
  };

  const toggleCategoryMenu = () => {
    setShowCategoryMenu((prev) => !prev);
  };

  const selectedCategoryObj = categories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="rForm">
      <form onSubmit={handleSubmit} className="form-items">
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
          onFocus={() => setShowCategoryMenu(false)}
        />
        <button type="submit" className="task-input-button">
          <MdKeyboardReturn className="icon-submit" />
        </button>
      </form>
    </div>
  );
}
