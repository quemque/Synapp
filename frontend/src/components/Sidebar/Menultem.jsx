import React from "react";
import { Link, useLocation } from "react-router-dom";

const MenuItem = ({ item, onClose, onAction }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const isActivePath = location.pathname.startsWith(item.path);

  if (item.hasDropdown) {
    return (
      <div key={item.id}>
        <button
          onClick={item.onToggle}
          className={`sidebar-link ${isActivePath ? "active" : ""}`}
        >
          <div className="menu-item-content">
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
          <span className="dropdown-arrow">
            {item.dropdownOpen ? <item.upIcon /> : <item.downIcon />}
          </span>
        </button>

        {item.dropdownOpen && (
          <div className="tags-dropdown">
            {item.tags.map((tag) => (
              <Link
                key={`tag-${tag.toLowerCase()}`}
                to={`/tags/${tag.toLowerCase()}`}
                className="dropdown-item"
                onClick={onClose}
              >
                <span
                  className="drop-tag-icon"
                  style={{ color: item.getColor(tag) }}
                >
                  {item.getIcon(tag)}
                </span>
                <span className="tag-name">{tag}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.action) {
    return (
      <button
        key={item.id}
        onClick={() => onAction(item)}
        className="sidebar-link action-item"
      >
        <div className="menu-item-content">
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-label">{item.label}</span>
        </div>
      </button>
    );
  }

  return (
    <Link
      key={item.id}
      to={item.path}
      className={`sidebar-link ${isActive ? "active" : ""}`}
      onClick={onClose}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="menu-item-content">
        <span className="menu-icon">{item.icon}</span>
        <span className="menu-label">{item.label}</span>
      </div>
    </Link>
  );
};

export default MenuItem;
