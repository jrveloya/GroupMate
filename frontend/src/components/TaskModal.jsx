import React, { useState } from "react";
import "./TaskModal.css";

const TaskModal = ({ task, onClose, onComplete, onComment }) => {
  const [comment, setComment] = useState("");
  const [colorMap, setColorMap] = useState({});

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
      onComment(comment); // Pass the comment and commenter name to the parent component
      setComment("");
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
                  return (
                    <li
                      key={index}
                      className="comment-item"
                      style={{
                        borderLeftColor: commenterColor,
                      }}
                    >
                      <strong style={{ color: commenterColor }}>
                        {comment.commenterName}:
                      </strong>{" "}
                      {comment.text}
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
