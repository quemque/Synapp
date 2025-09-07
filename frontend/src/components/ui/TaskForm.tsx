import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "./TaskForm.css";
import { MdKeyboardReturn } from "react-icons/md";
import { CATEGORIES, default_category_id } from "../data/categories";

interface TaskForm {
  onAddTask: (text: string, category?: string) => Promise<void>;
}
export default function TaskForm({ onAddTask }: TaskForm) {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(default_category_id);
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);

  const categories = CATEGORIES;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target as Node)
      ) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      try {
        onAddTask(inputValue, selectedCategory);
        setInputValue("");
        setSelectedCategory("general");
        setShowCategoryMenu(false);
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    }
  };

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryMenu(false);
  }, []);

  const toggleCategoryMenu = () => {
    setShowCategoryMenu((prev) => !prev);
  };

  const selectedCategoryObj = useMemo(
    () =>
      categories.find((cat) => cat.id === selectedCategory) || categories[0],
    [categories, selectedCategory]
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
