import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (task) {
      setTaskTitle(task.title || "");
      setTaskDescription(task.description || "");
      setAssignedTo(task.assigned_to || "");
      // Reset editing and delete confirmation states when a new task is loaded
      setIsEditing(false);
      setIsConfirmingDelete(false);
      setError("");
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
