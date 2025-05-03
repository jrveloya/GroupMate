import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import "./Dashboard.css";

const Dashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Please log in to view announcements");
        }

        const response = await fetch(
          "http://127.0.0.1:5050/announcement/user",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in again");
          }
          throw new Error(`Failed to fetch announcements: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setAnnouncements(data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Group announcements by project
  const groupedAnnouncements = announcements.reduce((groups, announcement) => {
    const projectName = announcement.project_name || "Unknown Project";
    if (!groups[projectName]) {
      groups[projectName] = [];
    }
    groups[projectName].push(announcement);
    return groups;
  }, {});

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <p>Manage your tasks, view progress, and stay organized.</p>

      <div className="announcements-section">
        <h2>📢 Announcements</h2>
        {loading ? (
          <p>Loading announcements...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          Object.entries(groupedAnnouncements).map(
            ([projectName, projectAnnouncements]) => (
              <div key={projectName} className="project-announcements-group">
                <h3>📁 {projectName}</h3>
                <div className="announcement-cards-container">
                  {projectAnnouncements.map((a) => (
                    <div key={a._id} className="announcement-card">
                      <h4>{a.title}</h4>
                      <p>{a.content}</p>
                      <small>{new Date(a.created_at).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
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
