import React from "react";
import { Link } from "react-router";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to GroupMate</h1>
      <p>Your personal task management system.</p>
      <div className="home-buttons">
        <Link to="/login" className="btn">
          Login
        </Link>
        <Link to="/register" className="btn secondary">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;
