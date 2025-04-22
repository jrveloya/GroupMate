import React from "react";
import { Link, useNavigate } from "react-router";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth stuff (e.g., token)
    // localStorage.removeItem('token');
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
      </ul>
      <div className="nav-actions">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
