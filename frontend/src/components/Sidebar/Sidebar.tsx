import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import {
  FaTasks,
  FaTags,
  FaSignInAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
//убрать игнор после полной миграции)
import { getCategoryColor, getCategoryIcon } from "../handlers/GetTags.tsx";
//@ts-ignore
import { useAuth } from "../../context/AuthContext.tsx";
import { MenuItem as MenuItem } from "../../types/index.ts";
import MenuItemComponent from "./MenuItem.tsx";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const tags = [
    "Urgent",
    "Home",
    "Work",
    "Study",
    "Shopping",
    "Watch",
    "Personal",
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => {
    setIsOpen(false);
    setDropdownOpen(false);
  };
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleMenuItemClick = (item: MenuItem): void => {
    if (item.action) {
      item.action();
      closeSidebar();
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLElement>): void => {
    if (event.target === event.currentTarget) {
      closeSidebar();
    }
  };

  const mainMenuItems = [
    {
      id: "main-all-tasks",
      path: "/",
      label: "All tasks",
      icon: <FaTasks />,
    },
    {
      id: "main-tags",
      path: "/tags",
      label: "Tags",
      icon: <FaTags />,
      hasDropdown: true,
      dropdownOpen,
      onToggle: toggleDropdown,
      tags,
      getColor: getCategoryColor,
      getIcon: getCategoryIcon,
      upIcon: AiOutlineUp,
      downIcon: AiOutlineDown,
    },
  ];

  const bottomMenuItems = user
    ? [
        {
          id: "bottom-logout",
          path: "#logout",
          label: "Logout",
          icon: <FaSignOutAlt />,
          action: logout,
        },
      ]
    : [
        {
          id: "bottom-login",
          path: "/login",
          label: "Login",
          icon: <FaSignInAlt />,
        },
      ];

  return (
    <>
      {!isOpen && (
        <button
          className="burger-button"
          onClick={toggleSidebar}
          aria-label="Open menu"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button
            className="close-button"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <AiOutlineClose />
          </button>
        </div>

        {user && (
          <div className="user-info">
            <div className="user-header">
              <FaUser className="user-icon" />
              <span>Logged in as:</span>
            </div>
            <div className="username">{user.username}</div>
            <div className="user-email">{user.email}</div>
          </div>
        )}

        <nav className="main-menu">
          {mainMenuItems.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              onClose={closeSidebar}
              onAction={handleMenuItemClick}
            />
          ))}
        </nav>

        <div className="bottom-menu">
          <nav>
            {bottomMenuItems.map((item) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                onClose={closeSidebar}
                onAction={handleMenuItemClick}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
