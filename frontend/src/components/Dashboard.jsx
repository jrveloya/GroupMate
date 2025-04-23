import React from "react";
import { Link } from "react-router";
import "./Dashboard.css";

const Dashboard = () => {
  // You could fetch tasks or user info here with useEffect if needed

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <p>Manage your tasks, view progress, and stay organized.</p>

      <div className="dashboard-cards">
        <Link to="/tasks" className="card-link">
          <div className="card">
            <h3>Tasks</h3>
            <p>View and manage all your tasks.</p>
          </div>
        </Link>
        <Link to="/completed-tasks" className="card-link">
          <div className="card">
            <h3>Completed</h3>
            <p>See what you've accomplished.</p>
          </div>
        </Link>
        <Link to="/settings" className="card-link">
          <div className="card">
            <h3>Settings</h3>
            <p>Manage your profile and preferences.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
