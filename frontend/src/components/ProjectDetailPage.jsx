import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import "./ProjectDetailPage.css";

// Modal component for displaying project members and adding new members
const MembersModal = ({ isOpen, onClose, members, onAddUser }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await onAddUser(username);
      setMessage(response.message);
      setUsername(""); // Clear input on success
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content members-modal">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Project Members</h2>

        {/* Add Member Form */}
        <form onSubmit={handleSubmit} className="add-member-form">
          <div className="form-row">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username to add"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="add-member-btn"
              disabled={loading || !username.trim()}
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`form-message ${
              message.toLowerCase().includes("error") ? "error" : "success"
            }`}
          >
            {message}
          </p>
        )}

        <div className="members-list">
          {members && members.length > 0 ? (
            members.map((member, index) => (
              <div key={member.member_id || index} className="member-item">
                <div className="member-info">
                  <span className="member-username">{member.username}</span>
                  <span className="member-id">ID: {member.member_id}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-members">No members in this project</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal component for adding new tasks
// Updated AddTaskModal that uses project members
const AddTaskModal = ({ isOpen, onClose, onAddTask, members }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskTitle.trim() && taskDescription.trim() && assignedTo) {
      const newTask = {
        title: taskTitle,
        description: taskDescription,
        assigned_to: assignedTo, // Store user ID
        id: Date.now(), // Change this later
      };
      onAddTask(newTask);
      setTaskTitle(""); // Clear input field
      setTaskDescription(""); // Clear input field
      setAssignedTo(""); // Clear assigned member
      onClose(); // Close the modal
    }
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Add New Task</h2>
        <form className="task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
          <textarea
            className="task-description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Enter task description"
            rows="4"
            required
          />
          <label htmlFor="assignedTo">Assign to:</label>
          <select
            className="assign-select"
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          >
            <option value="" disabled>
              Select team member
            </option>
            {members &&
              members.map((member) => (
                <option key={member.member_id} value={member.member_id}>
                  {member.username}
                </option>
              ))}
          </select>
          <button className="add--task-btn" type="submit">
            Add Task
          </button>
        </form>
      </div>
    </div>
  ) : null;
};

// Modal component for adding new announcements
const AddAnnouncementModal = ({ isOpen, onClose, onAddAnnouncement }) => {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (announcementTitle.trim() && announcementContent.trim()) {
      const newAnnouncement = {
        title: announcementTitle,
        content: announcementContent,
        id: Date.now(),
      };
      onAddAnnouncement(newAnnouncement);
      setAnnouncementTitle(""); // Clear title input field
      setAnnouncementContent(""); // Clear content input field
      onClose(); // Close the modal
    }
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Create New Announcement</h2>
        <form className="announcement-form" onSubmit={handleAddAnnouncement}>
          <input
            type="text"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            placeholder="Enter announcement title"
            required
          />
          <textarea
            className="announcement-description"
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
            placeholder="Enter announcement content"
            rows="4"
            required
          />
          <button className="add--announcement-btn" type="submit">
            Create Announcement
          </button>
        </form>
      </div>
    </div>
  ) : null;
};

// Project Detail Page Component
const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added missing error state

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

      // Fetch project data
      const projectResponse = await fetch(
        `http://127.0.0.1:5050/project/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!projectResponse.ok) {
        if (projectResponse.status === 404) {
          throw new Error("Project not found");
        }
        throw new Error(`Server error: ${projectResponse.status}`);
      }

      const projectData = await projectResponse.json();
      setProject(projectData);

      // Fetch tasks
      const tasksResponse = await fetch(
        `http://127.0.0.1:5050/tasks/project/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!tasksResponse.ok) {
        console.warn(`Could not fetch tasks: ${tasksResponse.status}`);
      } else {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }

      // Fetch announcements
      const announcementsResponse = await fetch(
        `http://127.0.0.1:5050/announcement/project/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!announcementsResponse.ok) {
        if (
          announcementsResponse.status === 403 ||
          announcementsResponse.status === 404
        ) {
          setAnnouncements([]);
        } else {
          console.warn(
            `Could not fetch announcements: ${announcementsResponse.status}`
          );
        }
      } else {
        const announcementsData = await announcementsResponse.json();
        setAnnouncements(announcementsData);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    } else {
      setError("No project ID provided");
      setLoading(false);
    }
  }, [projectId]);

  // You might also want to add a function to fetch tasks after creation
  const fetchTasksForProject = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const tasksResponse = await fetch(
        `http://127.0.0.1:5050/tasks/project/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Add a new task
  const addTask = async (newTask) => {
    console.log("Creating task with data:", newTask);
    console.log("Project ID:", project._id);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`http://127.0.0.1:5050/tasks/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          project_id: project._id,
          assigned_to_id: newTask.assigned_to,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Failed to create task: ${response.status}`);
      }

      const result = await response.json();
      console.log("Task created successfully:", result);

      fetchTasksForProject();
    } catch (err) {
      console.error("Error creating task:", err);
      // Optionally show error to user
      alert(`Error creating task: ${err.message}`);
    }
  };

  // Add a new announcement
  const addAnnouncement = async (newAnnouncement) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`http://127.0.0.1:5050/announcement/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: project._id,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 400) {
          throw new Error("Project ID and Content are required.");
        }
        throw new Error(`Failed to create announcement: ${response.status}`);
      }

      const result = await response.json();
      console.log("Announcement created successfully:", result);

      // After successful creation, refresh the announcements list
      fetchAnnouncementsForProject();
    } catch (err) {
      console.error("Error creating announcement:", err);
      // Optionally show error to user
      alert(`Error creating announcement: ${err.message}`);
    }
  };

  const fetchAnnouncementsForProject = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const announcementsResponse = await fetch(
        `http://127.0.0.1:5050/announcement/project/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        setAnnouncements(announcementsData);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  // Your existing addUserToProject function remains the same
  const addUserToProject = async (username) => {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
      `http://127.0.0.1:5050/project/add-user/${projectId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("User not found");
      } else if (response.status === 403) {
        throw new Error(
          "You don't have permission to add users to this project"
        );
      }
      throw new Error("Failed to add user");
    }

    const result = await response.json();

    // Refresh project data to get updated members list
    // You might want to refactor this to update just the members state
    fetchProjectData();

    return result;
  };

  return (
    <div className="project-detail-page">
      {loading ? (
        <p className="loading-message">Loading project...</p>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={() => window.history.back()} className="back-button">
            Go Back
          </button>
        </div>
      ) : project ? (
        <>
          <div className="project-header">
            <h1>{project.name}</h1>
            <p>{project.description}</p>
            <button
              className="view-members-btn"
              onClick={() => setIsMembersModalOpen(true)}
            >
              View Members ({project.members?.length || 0})
            </button>
          </div>

          <div className="project-content">
            <div className="projects tasks-section">
              <button
                className="new-task-btn"
                onClick={() => setIsTaskModalOpen(true)}
              >
                Create New Task
              </button>
              <h3>Current Tasks</h3>
              <div className="task-list">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task.id} className="task-card">
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <p>
                        <strong>Assigned to:</strong>{" "}
                        {task.assigned_to_username}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="no-items-message">
                    No tasks yet. Create one to get started!
                  </p>
                )}
              </div>
            </div>
            <div className="projects announcements-section">
              <button
                className="new-announcement-btn"
                onClick={() => setIsAnnouncementModalOpen(true)}
              >
                Create New Announcement
              </button>
              <h3>Current Announcements</h3>
              <div className="announcement-list">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement._id} className="announcement-card">
                      <h4>{announcement.title}</h4>
                      <p>{announcement.content}</p>
                      <p className="announcement-meta">
                        <small>
                          Posted on:{" "}
                          {new Date(
                            announcement.created_at
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            announcement.created_at
                          ).toLocaleTimeString()}
                        </small>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="no-items-message">
                    No announcements yet. Create one to get started!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Modal for adding new task */}
          <AddTaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onAddTask={addTask}
            members={project.members}
          />

          {/* Modal for adding new announcement */}
          <AddAnnouncementModal
            isOpen={isAnnouncementModalOpen}
            onClose={() => setIsAnnouncementModalOpen(false)}
            onAddAnnouncement={addAnnouncement}
          />

          <MembersModal
            isOpen={isMembersModalOpen}
            onClose={() => setIsMembersModalOpen(false)}
            members={project.members}
            onAddUser={addUserToProject}
          />
        </>
      ) : (
        <p className="no-project-message">No project data available.</p>
      )}
    </div>
  );
};

export default ProjectDetailPage;
