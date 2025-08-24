import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { FaTasks, FaTags } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "All tasks", icon: <FaTasks /> },
    { path: "/tags", label: "Tags", icon: <FaTags /> },
  ];

  // Close sidebar when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when sidebar is open on mobile
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
    console.log("Toggle sidebar clicked, current state:", isOpen);
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    console.log("Close sidebar clicked");
    setIsOpen(false);
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Burger menu button - hidden when sidebar is open */}
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
            //background-color: #242424;
            background: "#242424",
            border: "none",
            //borderRadius: "4px",
            width: "40px",
            height: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.3s ease",
            //boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            pointerEvents: "auto",
          }}
          onMouseEnter={(e) => {
            //e.target.style.background = "#2980b9";
            e.target.style.transform = "scale(1.05)";
            //e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            //e.target.style.background = "#3498db";
            e.target.style.transform = "scale(1)";
            //e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
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

      {/* Overlay */}
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

      {/* Sidebar */}
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
            <AiOutlineClose
              style={{
                borderRadius: "50%",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
              }}
            />
          </button>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "20px 0",
          }}
        >
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={closeSidebar}
              aria-current={
                location.pathname === item.path ? "page" : undefined
              }
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
                boxShadow:
                  location.pathname === item.path ? " #282828" : "none",
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
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
