import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./TaskModal.css";

const TaskModal = ({
  task,
  onClose,
  onComplete,
  onComment,
  onDeleteComment,
}) => {
  const [comment, setComment] = useState("");
  const [colorMap, setColorMap] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get the current user's ID when the component mounts
  useEffect(() => {
    const userId = Cookies.get("user_id");
    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);

  // Helper function to check if the current user can delete a comment
  const canDeleteComment = (comment) => {
    // If no current user ID is available, don't allow deletion
    if (!currentUserId) return false;

    // Check if the user is the comment owner
    return currentUserId === comment.user_id;
  };

  // Helper function to generate a color from a name using a simple formula
  const getColorForCommenter = (name) => {
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
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }

    // Use parts of the sum to generate RGB values
    const red = (sum * 3) % 256;
    const green = (sum * 5) % 256;
    const blue = (sum * 7) % 256;

    // Return the color as a hex code
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      // Get the current user's ID from cookies
      const userId = Cookies.get("user_id");

      let currentUserName = "You";

      if (userId) {
        // Get the token from localStorage
        const token = localStorage.getItem("access_token");

        fetch(`http://127.0.0.1:5050/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch user data");
            }
            return response.json();
          })
          .then((userData) => {
            // Get the username from the user data
            currentUserName = userData.username || "You";

            // Now submit the comment with the retrieved username
            onComment(comment, currentUserName);
            setComment("");
          })
          .catch((err) => {
            console.error("Error fetching user data:", err);
            // Fall back to anonymous if there's an error
            onComment(comment, "You");
            setComment("");
          });
      } else {
        // If no user ID is found, submit as you
        onComment(comment, currentUserName);
        setComment("");
      }
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDeleteComment(commentId);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h3>{task.title}</h3>
        <p>{task.description}</p>

        <div className="actions">
          <button className="complete-btn" onClick={() => onComplete(task.id)}>
            Mark as Completed
          </button>
        </div>

        <div className="comment-section">
          <h4>Comments</h4>
          {task.comments.length > 0 ? (
            <div className="comment-list-container">
              <ul className="comment-list">
                {task.comments.map((comment, index) => {
                  const commenterColor = getColorForCommenter(
                    comment.commenterName
                  );
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
                            {comment.commenterName}:
                          </strong>{" "}
                          {comment.text}
                          {/* Add debug info - remove in production */}
                          {process.env.NODE_ENV === "development" && (
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#888",
                                marginTop: "4px",
                              }}
                            >
                              ID: {comment.id || "none"}, User:{" "}
                              {comment.user_id || "none"}, Current:{" "}
                              {currentUserId || "none"}, Owner:{" "}
                              {isOwner ? "Yes" : "No"}
                            </div>
                          )}
                        </div>
                        {/* Only show delete button for comments the user owns */}
                        {isOwner && (
                          <button
                            className="delete-comment-btn"
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Delete comment"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p>No comments yet.</p>
          )}

          <div className="comment-inputs">
            <textarea
              placeholder="Leave a comment..."
              value={comment}
              onChange={handleCommentChange}
            />
            <button onClick={handleCommentSubmit}>Submit Comment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
