import React, { useState, useEffect } from "react";
import "./ModalStyles.css";

// TaskViewEditModal component for viewing and editing tasks
const TaskViewEditModal = ({
  isOpen,
  onClose,
  task,
  members,
  onUpdateTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTaskTitle(task.title || "");
      setTaskDescription(task.description || "");
      setAssignedTo(task.assigned_to || "");
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
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update task");
    } finally {
      setLoading(false);
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
          <button
            className={`edit-toggle-btn ${isEditing ? "cancel" : "edit"}`}
            onClick={handleEditToggle}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {isEditing ? (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskViewEditModal;
