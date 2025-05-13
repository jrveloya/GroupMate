import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./ModalStyles.css";

// TaskViewEditModal component for viewing and editing tasks
const TaskViewEditModal = ({
  isOpen,
  onClose,
  task,
  members,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Comment section states
  const [comment, setComment] = useState("");
  const [colorMap, setColorMap] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (task) {
      setTaskTitle(task.title || "");
      setTaskDescription(task.description || "");
      setAssignedTo(task.assigned_to || task.assigned_to_id || "");
      // Reset editing and delete confirmation states when a new task is loaded
      setIsEditing(false);
      setIsConfirmingDelete(false);
      setError("");
    }

    // Get the current user's ID when the component mounts
    const userId = Cookies.get("user_id") || localStorage.getItem("user_id");
    if (userId) {
      setCurrentUserId(userId);
    }
  }, [task]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updatedTask = {
        ...task,
        title: taskTitle,
        description: taskDescription,
        assigned_to: assignedTo,
      };

      await onUpdateTask(updatedTask);
      // After successful update, close the modal
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update task");
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await onDeleteTask(task._id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete task");
      setLoading(false);
      setIsConfirmingDelete(false);
    }
  };

  // Comment section functions
  // Helper function to check if the current user can delete a comment
  const canDeleteComment = (comment) => {
    // If no current user ID is available, don't allow deletion
    if (!currentUserId) return false;

    // Check if the user is the comment owner
    return currentUserId === comment.user_id;
  };

  // Helper function to generate a color from a name using a simple formula
  const getColorForCommenter = (name) => {
    // Add a safety check for undefined or null names
    if (!name) {
      return "rgb(150, 150, 150)"; // Default gray color for missing names
    }

    if (colorMap[name]) {
      return colorMap[name]; // Return the stored color if it exists
    } else {
      const color = generateColorFromName(name); // Generate color from the name
      setColorMap((prevMap) => ({
        ...prevMap,
        [name]: color, // Store the generated color for the commenter
      }));
      return color;
    }
  };

  // Create a random RGB color based on the person's name
  const generateColorFromName = (name) => {
    // Add safety check for undefined or null name
    if (!name || typeof name !== "string") {
      return "rgb(150, 150, 150)"; // Default gray color
    }

    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }

    // Use parts of the sum to generate RGB values
    const red = (sum * 3) % 256;
    const green = (sum * 5) % 256;
    const blue = (sum * 7) % 256;

    // Return the color as an RGB value
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      try {
        // Get the current user's ID and token
        const userId =
          Cookies.get("user_id") || localStorage.getItem("user_id");
        const token = localStorage.getItem("access_token");

        if (!userId || !token) {
          throw new Error("Authentication required");
        }

        // Get the username from current user data
        const userResponse = await fetch(
          `http://groupmate-alb-1871461292.us-west-1.elb.amazonaws.com:5050/users/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        const commenterName = userData.username || "Anonymous";

        // Submit comment to the server - matching the Taskboard implementation
        const response = await fetch(
          "http://groupmate-alb-1871461292.us-west-1.elb.amazonaws.com:5050/comments/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              task_id: task._id,
              content: comment,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to post comment");
        }

        const data = await response.json();
        console.log("Comment response:", data);

        // The backend should return the comment ID in the response
        // If not, create a temporary ID
        const commentId = data.comment_id || `temp-${Date.now()}`;

        // Create the new comment object with ID and user_id - matching Taskboard format
        const newCommentObj = {
          id: commentId,
          user_id: userId, // Set the current user's ID
          commenterName: commenterName,
          text: comment,
        };

        console.log("Adding new comment:", newCommentObj);

        // Add the new comment to the task's comments array
        const updatedTask = {
          ...task,
          comments: [...(task.comments || []), newCommentObj],
        };

        // Update the task state in parent component
        onUpdateTask(updatedTask);

        // Clear the comment input
        setComment("");
      } catch (err) {
        console.error("Error posting comment:", err);
        setError(err.message || "Failed to add comment");
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const token = localStorage.getItem("access_token");

        // Match the endpoint from Taskboard implementation
        const response = await fetch(
          `http://groupmate-alb-1871461292.us-west-1.elb.amazonaws.com:5050/comments/${commentId}`,
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

        // Update the task with deleted comment removed
        const updatedTask = {
          ...task,
          comments: task.comments.filter((comment) => comment.id !== commentId),
        };

        // Update the task state in parent component
        onUpdateTask(updatedTask);

        console.log("Comment deleted successfully");
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError(err.message || "Failed to delete comment");
      }
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <div className="modal-header">
          <h2>{isEditing ? "Edit Task" : task.title}</h2>
          <div className="modal-actions">
            <button
              className={`edit-toggle-btn ${isEditing ? "cancel" : "edit"}`}
              onClick={handleEditToggle}
              disabled={isConfirmingDelete}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {isConfirmingDelete ? (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this task?</p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="delete-actions">
              <button
                className="cancel-delete-btn"
                onClick={handleCancelDelete}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <form className="task-form" onSubmit={handleUpdateTask}>
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
            {error && <p className="error-message">{error}</p>}
            <button
              className="update-task-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Task"}
            </button>
          </form>
        ) : (
          <div className="task-details">
            <p className="task-description-text">{task.description}</p>
            <p className="assigned-to">
              <strong>Assigned to:</strong> {task.assigned_to_username}
            </p>

            {/* Comment section */}
            <div className="comment-section">
              <h4>Comments</h4>
              {task.comments && task.comments.length > 0 ? (
                <div className="comment-list-container">
                  <ul className="comment-list">
                    {task.comments.map((comment, index) => {
                      // Make sure comment has a commenterName property
                      const commenterName =
                        comment.commenterName || "Anonymous";
                      const commenterColor =
                        getColorForCommenter(commenterName);
                      const isOwner = canDeleteComment(comment);

                      return (
                        <li
                          key={index}
                          className="comment-item"
                          style={{
                            borderLeftColor: commenterColor,
                          }}
                        >
                          <div className="comment-content">
                            <div className="comment-text">
                              <strong style={{ color: commenterColor }}>
                                {commenterName}:
                              </strong>{" "}
                              {comment.text}
                            </div>

                            {/* Simple delete icon button */}
                            {isOwner && (
                              <button
                                className="delete-icon-btn"
                                onClick={() => handleDeleteComment(comment.id)}
                                aria-label="Delete comment"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="no-comments">
                  No comments yet. Be the first to add one!
                </p>
              )}

              <div className="comment-inputs">
                <textarea
                  placeholder="Leave a comment..."
                  value={comment}
                  onChange={handleCommentChange}
                  aria-label="Comment text"
                />
                <button onClick={handleCommentSubmit} disabled={loading}>
                  <i className="submit-icon">💬</i> Submit Comment
                </button>
              </div>
            </div>

            {/* Delete button placed at the bottom of the view mode */}
            <div className="bottom-actions">
              <button className="delete-btn" onClick={handleDeleteClick}>
                Delete Task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskViewEditModal;
