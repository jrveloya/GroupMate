import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import "./ProjectDetailPage.css";
import Cookies from "js-cookie";

// Import Modal Components from the same folder
import AddTaskModal from "../../components/AddTaskModal";
import AddAnnouncementModal from "../../components/AddAnnouncementModal";
import MembersModal from "../../components/MembersModal";
import TaskViewEditModal from "../../components/TaskViewEditModal";
import AnnouncementViewEditModal from "../../components/AnnouncementViewEditModal";

// Project Detail Page Component
const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // State for modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // State for view/edit modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskViewModalOpen, setIsTaskViewModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isAnnouncementViewModalOpen, setIsAnnouncementViewModalOpen] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Transform comments to match TaskBoard format if needed
        const transformedTasks = tasksData.map((task) => {
          // If comments exist but need transformation
          if (task.comments && Array.isArray(task.comments)) {
            return {
              ...task,
              comments: task.comments.map((c) => ({
                id: c._id || c.id,
                commenterName: c.username || c.commenterName || "Unknown",
                text: c.content || c.text || "",
                user_id: c.user_id,
              })),
            };
          }
          // If no comments, add empty array
          if (!task.comments) {
            return {
              ...task,
              comments: [],
            };
          }
          return task;
        });

        setTasks(transformedTasks);
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

  // Function to fetch tasks after creation or update
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

        // Transform comments to match TaskBoard format
        const transformedTasks = tasksData.map((task) => {
          // If comments exist but need transformation
          if (task.comments && Array.isArray(task.comments)) {
            return {
              ...task,
              comments: task.comments.map((c) => ({
                id: c._id || c.id,
                commenterName: c.username || c.commenterName || "Unknown",
                text: c.content || c.text || "",
                user_id: c.user_id,
              })),
            };
          }
          // If no comments, add empty array
          if (!task.comments) {
            return {
              ...task,
              comments: [],
            };
          }
          return task;
        });

        setTasks(transformedTasks);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Add a new task
  const addTask = async (newTask) => {
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

      // Refresh tasks list
      fetchTasksForProject();
    } catch (err) {
      console.error("Error creating task:", err);
      alert(`Error creating task: ${err.message}`);
    }
  };

  // Update an existing task
  const updateTask = async (updatedTask) => {
    try {
      const token = localStorage.getItem("access_token");

      // Check if this is just a comment update
      if (
        updatedTask.comments &&
        selectedTask &&
        updatedTask.title === selectedTask.title &&
        updatedTask.description === selectedTask.description &&
        updatedTask.assigned_to === selectedTask.assigned_to
      ) {
        // Update the selectedTask state with the updated comments
        setSelectedTask(updatedTask);

        // Update the tasks array with the updated task
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );

        // No need to make an API call for task update
        return { success: true };
      }

      // This is a regular task update, not just comments
      const response = await fetch(
        `http://127.0.0.1:5050/tasks/${updatedTask._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updatedTask.title,
            description: updatedTask.description,
            assigned_to_id: updatedTask.assigned_to,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const result = await response.json();
      console.log("Task updated successfully:", result);

      // Refresh tasks list
      fetchTasksForProject();

      return result;
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  // Handle adding a comment to a task
  const handleAddComment = async (taskId, commentText, commenterName) => {
    try {
      // Ensure commenterName is not undefined
      const safeCommenterName = commenterName || "Anonymous";

      // Get the current user ID
      const userId = Cookies.get("user_id") || localStorage.getItem("user_id");
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      const token = localStorage.getItem("access_token");

      const response = await fetch("http://127.0.0.1:5050/comments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          task_id: taskId,
          content: commentText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const data = await response.json();
      console.log("Comment response:", data);

      // The backend should return the comment ID in the response
      // If not, create a temporary ID
      const commentId = data.comment_id || `temp-${Date.now()}`;

      // Create the new comment object with ID and user_id
      const newCommentObj = {
        id: commentId,
        user_id: userId, // Set the current user's ID
        commenterName: safeCommenterName,
        text: commentText,
      };

      console.log("Adding new comment:", newCommentObj);

      // Update the selectedTask state with the new comment
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({
          ...selectedTask,
          comments: [...(selectedTask.comments || []), newCommentObj],
        });
      }

      // Update the tasks array
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                comments: [...(task.comments || []), newCommentObj],
              }
            : task
        )
      );

      return newCommentObj;
    } catch (err) {
      console.error("Error posting comment:", err);
      throw err;
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (taskId, commentId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:5050/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // If deletion was successful, update the UI
      // Update the selectedTask state
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({
          ...selectedTask,
          comments: selectedTask.comments.filter(
            (comment) => comment.id !== commentId
          ),
        });
      }

      // Update the tasks array
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                comments: task.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : task
        )
      );

      console.log("Comment deleted successfully");
      return { success: true };
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
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
      alert(`Error creating announcement: ${err.message}`);
    }
  };

  // Update an existing announcement
  const updateAnnouncement = async (updatedAnnouncement) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:5050/announcement/${updatedAnnouncement._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updatedAnnouncement.title,
            content: updatedAnnouncement.content,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Failed to update announcement: ${response.status}`);
      }

      const result = await response.json();
      console.log("Announcement updated successfully:", result);

      // Refresh announcements list
      fetchAnnouncementsForProject();

      return result;
    } catch (err) {
      console.error("Error updating announcement:", err);
      throw err;
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

  // Add user to project
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
    fetchProjectData();

    return result;
  };

  // Handle opening task view/edit modal
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskViewModalOpen(true);
  };

  // Handle opening announcement view/edit modal
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsAnnouncementViewModalOpen(true);
  };

  // Close task view/edit modal
  const closeTaskViewModal = () => {
    setIsTaskViewModalOpen(false);
    setSelectedTask(null);
  };

  // Close announcement view/edit modal
  const closeAnnouncementViewModal = () => {
    setIsAnnouncementViewModalOpen(false);
    setSelectedAnnouncement(null);
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`http://127.0.0.1:5050/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to delete this task.");
        } else if (response.status === 404) {
          throw new Error("Task not found or may have been already deleted.");
        }
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      // Refresh tasks list after successful deletion
      fetchTasksForProject();

      return { success: true };
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  // Remove user from project
  const removeUserFromProject = async (userId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:5050/project/user/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Project not found");
        } else if (response.status === 403) {
          throw new Error(
            "You don't have permission to remove users from this project"
          );
        } else if (response.status === 400) {
          throw new Error("User is not a member of this project");
        }
        throw new Error("Failed to remove user");
      }

      const result = await response.json();

      // Refresh project data to get updated members list
      fetchProjectData();

      return result;
    } catch (err) {
      console.error("Error removing user:", err);
      throw err;
    }
  };

  // Delete an announcement
  const deleteAnnouncement = async (announcementId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:5050/announcement/${announcementId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "You don't have permission to delete this announcement."
          );
        } else if (response.status === 404) {
          throw new Error(
            "Announcement not found or may have been already deleted."
          );
        }
        throw new Error(`Failed to delete announcement: ${response.status}`);
      }

      // Refresh announcements list after successful deletion
      fetchAnnouncementsForProject();

      return { success: true };
    } catch (err) {
      console.error("Error deleting announcement:", err);
      throw err;
    }
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
            <h2>{project.name}</h2>
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
                    <div
                      key={task._id || task.id}
                      className="task-card clickable"
                      onClick={() => handleTaskClick(task)}
                    >
                      <h4>{task.title}</h4>
                      <p className="task-description-preview">
                        {task.description && task.description.length > 100
                          ? `${task.description.substring(0, 100)}...`
                          : task.description}
                      </p>
                      <p>
                        <strong>Assigned to:</strong>{" "}
                        {task.assigned_to_username}
                      </p>
                      {/* Display comment count if available */}
                      {task.comments && task.comments.length > 0 && (
                        <div className="task-footer">
                          <span className="comment-count">
                            {task.comments.length} comment
                            {task.comments.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
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
                    <div
                      key={announcement._id || announcement.id}
                      className="announcement-card clickable"
                      onClick={() => handleAnnouncementClick(announcement)}
                    >
                      <h4>{announcement.title}</h4>
                      <p className="announcement-content-preview">
                        {announcement.content &&
                        announcement.content.length > 100
                          ? `${announcement.content.substring(0, 100)}...`
                          : announcement.content}
                      </p>
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

          {/* Modal Components */}
          <AddTaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onAddTask={addTask}
            members={project.members}
          />

          <TaskViewEditModal
            isOpen={isTaskViewModalOpen}
            onClose={closeTaskViewModal}
            task={selectedTask}
            members={project.members}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />

          <AddAnnouncementModal
            isOpen={isAnnouncementModalOpen}
            onClose={() => setIsAnnouncementModalOpen(false)}
            onAddAnnouncement={addAnnouncement}
          />

          <AnnouncementViewEditModal
            isOpen={isAnnouncementViewModalOpen}
            onClose={closeAnnouncementViewModal}
            announcement={selectedAnnouncement}
            onUpdateAnnouncement={updateAnnouncement}
            onDeleteAnnouncement={deleteAnnouncement}
          />

          <MembersModal
            isOpen={isMembersModalOpen}
            onClose={() => setIsMembersModalOpen(false)}
            members={project.members}
            onAddUser={addUserToProject}
            onRemoveUser={removeUserFromProject}
            projectId={projectId}
            currentUserId={localStorage.getItem("user_id") || ""}
            ownerId={project.owner_id || project.manager_id || ""}
          />
        </>
      ) : (
        <p className="no-project-message">No project data available.</p>
      )}
    </div>
  );
};

export default ProjectDetailPage;
