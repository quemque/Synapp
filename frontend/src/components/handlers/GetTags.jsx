import { ReactElement } from "react";
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
import { default_category_id } from "../data/categories";

export const getCategoryColor = (category) => {
  const cat = category?.toLowerCase() || default_category_id;
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
    case "urgent":
      return "#f1273bff";
    case "watch":
      return "#ffff";
    default:
      return "#6c757d";
  }
};

export const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || default_category_id;
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
    case "urgent":
      return <MdNotificationImportant />;
    case "watch":
      return <FaFilm />;
    default:
      return <FaEllipsisH />;
  }
};

export const getCategoryName = (category) => {
  const cat = category?.toLowerCase() || default_category_id;
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};
