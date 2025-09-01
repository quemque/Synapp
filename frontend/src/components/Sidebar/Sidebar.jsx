import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import {
  FaTasks,
  FaTags,
  FaSignInAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { getCategoryColor, getCategoryIcon } from "../handlers/GetTags";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tags = [
    "Urgent",
    "Home",
    "Work",
    "Study",
    "Shopping",
    "Watch",
    "Personal",
  ];

  const { user, logout } = useAuth();

  const mainMenuItems = [
    { id: "main-all-tasks", path: "/", label: "All tasks", icon: <FaTasks /> },
    {
      id: "main-tags",
      path: "/tags",
      label: "Tags",
      icon: <FaTags />,
      hasDropdown: true,
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

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setDropdownOpen(false);
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeSidebar();
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMenuItemClick = (item) => {
    if (item.action) {
      item.action();
      closeSidebar();
    }
  };

  const renderMenuItem = (item) => {
    if (item.hasDropdown) {
      return (
        <div key={item.id}>
          <button
            onClick={toggleDropdown}
            className={`sidebar-link ${
              location.pathname.startsWith(item.path) ? "active" : ""
            }`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              color: "#ecf0f1",
              textDecoration: "none",
              transition: "all 0.3s ease",
              position: "relative",
              margin: "2px 10px",
              borderRadius: "8px",
              border: "none",
              background: location.pathname.startsWith(item.path)
                ? " #282828"
                : "transparent",
              cursor: "pointer",
              width: "calc(100% - 20px)",
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith(item.path)) {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.transform = "translateX(5px)";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith(item.path)) {
                e.target.style.background = "transparent";
                e.target.style.transform = "translateX(0)";
                e.target.style.color = "#ecf0f1";
              }
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  marginRight: "12px",
                  fontSize: "1.3rem",
                  width: "24px",
                  textAlign: "center",
                  transition: "transform 0.2s ease",
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  letterSpacing: "0.5px",
                }}
              >
                {item.label}
              </span>
            </div>
            {dropdownOpen ? <AiOutlineUp /> : <AiOutlineDown />}
          </button>

          {dropdownOpen && (
            <div
              className="tags-dropdown"
              style={{
                paddingLeft: "40px",
                margin: "5px 10px",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
                maxHeight: dropdownOpen ? "500px" : "0",
              }}
            >
              {tags.map((tag) => (
                <Link
                  key={`tag-${tag.toLowerCase()}`}
                  to={`/tags/${tag.toLowerCase()}`}
                  className="dropdown-item"
                  onClick={closeSidebar}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 20px",
                    color: "#bdc3c7",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    borderRadius: "6px",
                    margin: "2px 0",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#bdc3c7";
                  }}
                >
                  <span
                    style={{
                      marginRight: "10px",
                      color: getCategoryColor(tag),
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {getCategoryIcon(tag)}
                  </span>
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    } else if (item.action) {
      return (
        <button
          key={item.id}
          onClick={() => handleMenuItemClick(item)}
          className="sidebar-link"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            color: "#ecf0f1",
            textDecoration: "none",
            transition: "all 0.3s ease",
            position: "relative",
            margin: "2px 10px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            width: "calc(100% - 20px)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
            e.target.style.transform = "translateX(5px)";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.transform = "translateX(0)";
            e.target.style.color = "#ecf0f1";
          }}
        >
          <span
            style={{
              marginRight: "12px",
              fontSize: "1.3rem",
              width: "24px",
              textAlign: "center",
              transition: "transform 0.2s ease",
            }}
          >
            {item.icon}
          </span>
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}
          >
            {item.label}
          </span>
        </button>
      );
    } else {
      return (
        <Link
          key={item.id}
          to={item.path}
          className={`sidebar-link ${
            location.pathname === item.path ? "active" : ""
          }`}
          onClick={closeSidebar}
          aria-current={location.pathname === item.path ? "page" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            color: "#ecf0f1",
            textDecoration: "none",
            transition: "all 0.3s ease",
            position: "relative",
            margin: "2px 10px",
            borderRadius: "8px",
            background:
              location.pathname === item.path ? " #282828" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== item.path) {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.transform = "translateX(5px)";
              e.target.style.color = "white";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== item.path) {
              e.target.style.background = "transparent";
              e.target.style.transform = "translateX(0)";
              e.target.style.color = "#ecf0f1";
            }
          }}
        >
          <span
            style={{
              marginRight: "12px",
              fontSize: "1.3rem",
              width: "24px",
              textAlign: "center",
              transition: "transform 0.2s ease",
            }}
          >
            {item.icon}
          </span>
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}
          >
            {item.label}
          </span>
        </Link>
      );
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="burger-button"
          onClick={toggleSidebar}
          aria-label="Открыть меню"
          aria-expanded="false"
          style={{
            position: "fixed",
            top: "15px",
            left: "15px",
            zIndex: 9999,
            background: "#242424",
            border: "none",
            width: "40px",
            height: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.3s ease",
            pointerEvents: "auto",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          <span
            style={{
              width: "20px",
              height: "2px",
              background: "white",
              margin: "2px 0",
              transition: "all 0.3s ease",
              borderRadius: "1px",
            }}
          ></span>
          <span
            style={{
              width: "20px",
              height: "2px",
              background: "white",
              margin: "2px 0",
              transition: "all 0.3s ease",
              borderRadius: "1px",
            }}
          ></span>
          <span
            style={{
              width: "20px",
              height: "2px",
              background: "white",
              margin: "2px 0",
              transition: "all 0.3s ease",
              borderRadius: "1px",
            }}
          ></span>
        </button>
      )}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            animation: "fadeIn 0.3s ease",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        aria-label="Навигационное меню"
        aria-hidden={!isOpen}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          height: "100vh",
          background: " #282828",
          color: "white",
          padding: 0,
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          overflowX: "hidden",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              color: "#ecf0f1",
              fontWeight: 600,
            }}
          >
            Menu
          </h2>
          <button
            className="close-button"
            onClick={closeSidebar}
            aria-label="Закрыть меню"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#ecf0f1",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: 0,
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
            }}
          >
            <AiOutlineClose />
          </button>
        </div>

        {user && (
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <FaUser style={{ marginRight: "10px", color: "#fd5045" }} />
              <span style={{ fontWeight: "500" }}>Logged in as:</span>
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#ecf0f1",
              }}
            >
              {user.username}
            </div>
            <div
              style={{ fontSize: "0.9rem", color: "#bdc3c7", marginTop: "5px" }}
            >
              {user.email}
            </div>
          </div>
        )}

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "20px 0",
            flex: 1,
          }}
        >
          {mainMenuItems.map((item) => renderMenuItem(item))}
        </nav>

        <div
          style={{
            marginTop: "auto",
            padding: "20px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {bottomMenuItems.map((item) => renderMenuItem(item))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
