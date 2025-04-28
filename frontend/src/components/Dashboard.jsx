import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import "./Dashboard.css";

const Dashboard = () => {
  const [announcements, setAnnouncements] = useState([]);

  // useEffect(() => {
  //   fetch("/api/announcements")
  //     .then((res) => res.json())
  //     .then((data) => setAnnouncements(data))
  //     .catch((err) => console.error("Error fetching announcements:", err));
  // }, []);

  useEffect(() => {
    //Change this to use backend data
    const sampleData = [
      {
        id: 1,
        title: "Welcome to the Task Manager!",
        message: "We're excited to have you. Start by adding your first task!",
        created_at: "2025-04-25T10:00:00Z",
      },
      {
        id: 2,
        title: "New Feature 🚀",
        message:
          "You can now categorize tasks by priority. Check it out in settings!",
        created_at: "2025-04-26T15:30:00Z",
      },
    ];
    setAnnouncements(sampleData);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <p>Manage your tasks, view progress, and stay organized.</p>

      <div className="announcements-section">
        <h2>📢 Announcements</h2>
        {announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="announcement-card">
              <h3>{a.title}</h3>
              <p>{a.message}</p>
              <small>{new Date(a.created_at).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>

      {/* Cards Section */}
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
