import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import Cookies from "js-cookie";
import "./Dashboard.css";

const Dashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Please log in to view your dashboard");
        }

        // Get the current user's ID from JWT or local storage
        // You might need to adjust this based on how you store the user ID
        const userId = Cookies.get("user_id");

        if (!userId) {
          throw new Error("User ID not found");
        }

        // Fetch user data using the provided endpoint
        const userResponse = await fetch(
          `http://127.0.0.1:5050/users/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            throw new Error("Please log in again");
          }
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        // Set username based on your API response structure
        setUsername(userData.username || userData.name || userData.email || "");
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      }
    };

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
        console.log("Announcements:", data);
        setAnnouncements(data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Please log in to view tasks");
        }

        const response = await fetch("http://127.0.0.1:5050/tasks/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in again");
          }
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }

        const data = await response.json();
        console.log("Tasks:", data);
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err.message);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchUserData();
    fetchAnnouncements();
    fetchTasks();
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

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <h1>
          {getGreeting()}, {username || "user"}!
        </h1>
        <p>Here's what's happening today.</p>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-number">{announcements.length}</span>
            <span className="stat-label">Announcements</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Object.keys(groupedAnnouncements).length}
            </span>
            <span className="stat-label">Active Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {tasksLoading ? "..." : tasks.length}
            </span>
            <span className="stat-label">Assigned Tasks</span>
          </div>
        </div>
      </div>

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
            {!tasksLoading && tasks.length > 0 && (
              <div className="badge">{tasks.length}</div>
            )}
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
            <p>Manage your profile.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
