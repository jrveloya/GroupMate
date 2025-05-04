import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router"; // Added useLocation
import { FiSettings, FiLogOut } from "react-icons/fi"; // Added FiLogOut icon
import Cookies from "js-cookie";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get current location
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    // Check if the user is a manager when component mounts
    const userRole = Cookies.get("role");
    setIsManager(userRole === "manager");
  }, []);

  // Helper function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Clear auth stuff (e.g., token)
    localStorage.removeItem("access_token");
    Cookies.remove("role");
    Cookies.remove("user_id");
    navigate("/");
  };

  return (
    <nav className="nav-bar">
      <div className="title">
        <Link to="/dashboard">
          <h1>GroupMate</h1>
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link
            to="/dashboard"
            className={isActive("/dashboard") ? "active" : ""}
          >
            Home
          </Link>
        </li>
        <li>
          <Link to="/tasks" className={isActive("/tasks") ? "active" : ""}>
            Task Board
          </Link>
        </li>
        <li>
          <Link
            to="/completed-tasks"
            className={isActive("/completed-tasks") ? "active" : ""}
          >
            Completed Tasks
          </Link>
        </li>
        {isManager && (
          <li>
            <Link
              to="/management-board"
              className={isActive("/management-board") ? "active" : ""}
            >
              Management Board
            </Link>
          </li>
        )}
      </ul>
      <div className="nav-actions">
        <Link
          to="/settings"
          className={`settings-link ${isActive("/settings") ? "active" : ""}`}
        >
          <FiSettings size={20} style={{ marginRight: "5px" }} />
          Settings
        </Link>
        <button onClick={handleLogout} className="logout-button">
          <FiLogOut size={16} style={{ marginRight: "5px" }} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
