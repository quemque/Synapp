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
import { Category } from "../types";
export const CATEGORIES: Category[] = [
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
export const default_category_id = "general";
