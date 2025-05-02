import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router"; // Fixed the import
import { FiSettings } from "react-icons/fi";
import Cookies from "js-cookie";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    // Check if the user is a manager when component mounts
    const userRole = Cookies.get("role");
    setIsManager(userRole === "manager");
  }, []);

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
        <li></li>
        <li>
          <Link to="/dashboard">Home</Link>
        </li>
        <li>
          <Link to="/tasks">Task Board</Link>
        </li>
        <li>
          <Link to="/completed-tasks">Completed Tasks</Link>
        </li>
        {isManager && (
          <li>
            <Link to="/management-board">Management Board</Link>
          </li>
        )}
      </ul>
      <div className="nav-actions">
        <Link to="/settings" className="settings-link">
          <FiSettings size={20} style={{ marginRight: "5px" }} />
          Settings
        </Link>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
