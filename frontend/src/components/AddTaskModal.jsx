import React, { useState } from "react";
import "./ModalStyles.css";

// Modal component for adding new tasks
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
          <button className="add-task-btn" type="submit">
            Add Task
          </button>
        </form>
      </div>
    </div>
  ) : null;
};

export default AddTaskModal;
