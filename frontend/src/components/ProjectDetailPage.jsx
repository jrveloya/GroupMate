import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import "./ProjectDetailPage.css";

// Modal component for adding new tasks
const AddTaskModal = ({ isOpen, onClose, onAddTask, teamMembers }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskTitle.trim() && taskDescription.trim() && assignedTo) {
      const newTask = {
        title: taskTitle,
        description: taskDescription,
        assignedTo, // Include the assigned team member
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
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
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
  const [announcementText, setAnnouncementText] = useState("");

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (announcementText.trim()) {
      const newAnnouncement = {
        text: announcementText,
        id: Date.now(),
      };
      onAddAnnouncement(newAnnouncement);
      setAnnouncementText(""); // Clear input field
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
          <textarea
            className="announcement-description"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Enter announcement text"
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
  const [loading, setLoading] = useState(true);

  // Sample team members data
  const teamMembers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Mark Johnson" },
  ];

  // Fetch project details, actually use the ID here to get it from the backend
  useEffect(() => {
    setTimeout(() => {
      const fetchedProject = {
        id: projectId,
        name: "Project Alpha",
        description: "A comprehensive project to redesign the company website.",
      };
      const fetchedTasks = [
        {
          id: 1,
          title: "Finish Dashboard Design",
          description: "Create the UI for the dashboard.",
          assignedTo: "John Doe",
        },
        {
          id: 2,
          title: "API Integration",
          description: "Connect the frontend with backend.",
          assignedTo: "Jane Smith",
        },
      ];
      const fetchedAnnouncements = [
        { id: 1, text: "Project kick-off meeting scheduled for Monday." },
        { id: 2, text: "New updates to the project specs document available." },
      ];
      setProject(fetchedProject);
      setTasks(fetchedTasks);
      setAnnouncements(fetchedAnnouncements);
      setLoading(false);
    }, 1000);
  }, [projectId]);

  // Add a new task
  const addTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  // Add a new announcement
  const addAnnouncement = (newAnnouncement) => {
    setAnnouncements((prevAnnouncements) => [
      ...prevAnnouncements,
      newAnnouncement,
    ]);
  };

  return (
    <div className="project-detail-page">
      {loading ? (
        <p>Loading project...</p>
      ) : (
        <>
          <div className="project-header">
            <h1>{project.name}</h1>
            <p>{project.description}</p>
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
                {tasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <p>
                      <strong>Assigned to:</strong> {task.assignedTo}
                    </p>
                  </div>
                ))}
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
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="announcement-card">
                    <p>{announcement.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal for adding new task */}
          <AddTaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onAddTask={addTask}
            teamMembers={teamMembers} // Pass the team members here
          />

          {/* Modal for adding new announcement */}
          <AddAnnouncementModal
            isOpen={isAnnouncementModalOpen}
            onClose={() => setIsAnnouncementModalOpen(false)}
            onAddAnnouncement={addAnnouncement}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDetailPage;
