import React, { useState, useEffect } from "react";
import TaskModal from "./TaskModal"; // Import the modal component
import "./Taskboard.css";

const Taskboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null); // Track selected task
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  const fetchTasks = async () => {
    try {
      setLoading(true);
      //Change this to use backend data
      const sampleTasks = [
        {
          id: 1,
          title: "Finish Dashboard Design",
          description: "Create the UI for the dashboard.",
          due_date: "2025-04-30",
          project: { id: 1, name: "Dashboard" },
          comments: [
            {
              commenterName: "John Doe",
              text: "Can you modify some more components on the dashboard. Right now it looks too plain.",
            },
            { commenterName: "Jane Doe", text: "!Looks good" },
            { commenterName: "LeBron James", text: "!Looks good" },
          ],
        },
        {
          id: 2,
          title: "API Integration",
          description: "Connect the frontend with backend.",
          due_date: "2025-05-02",
          project: { id: 1, name: "Dashboard" },
          comments: [{ commenterName: "John Doe", text: "Looks good!" }],
        },
        {
          id: 3,
          title: "Backend Setup",
          description: "Set up the backend structure.",
          due_date: "2025-05-10",
          project: { id: 2, name: "Backend" },
          comments: [
            { commenterName: "Jane Smith", text: "Initial setup done!" },
          ],
        },
        {
          id: 4,
          title: "Authentication",
          description: "Implement authentication system.",
          due_date: "2025-05-15",
          project: { id: 2, name: "Backend" },
          comments: [],
        },
      ];
      setTimeout(() => {
        setTasks(sampleTasks);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setLoading(false);
    }
  };

  // Helper function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true); // Open the modal
  };

  const handleModalClose = () => {
    setShowModal(false); // Close the modal
  };

  //Make a post to backend to register task as completed
  const handleCompleteTask = (taskId) => {
    console.log(`Task ${taskId} completed`);
    setShowModal(false); // Close the modal after completion
  };

  const handleCommentSubmit = (newComment, commenterName) => {
    // Update the task with the new comment
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === selectedTask.id
          ? {
              ...task,
              comments: [...task.comments, { commenterName, text: newComment }],
            }
          : task
      )
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const groupedTasks = tasks.reduce((groups, task) => {
    const { project } = task;
    if (!groups[project.name]) {
      groups[project.name] = [];
    }
    groups[project.name].push(task);
    return groups;
  }, {});

  return (
    <div className="taskboard-container">
      <h2>Your Task Board</h2>
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned to you.</p>
      ) : (
        Object.keys(groupedTasks).map((projectName) => (
          <div key={projectName} className="project-section">
            <h3 className="project-title">{projectName}</h3>
            <div className="task-list">
              {groupedTasks[projectName].map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  onClick={() => handleTaskClick(task)}
                >
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={handleModalClose}
          onComplete={handleCompleteTask}
          onComment={handleCommentSubmit}
        />
      )}
    </div>
  );
};

export default Taskboard;
