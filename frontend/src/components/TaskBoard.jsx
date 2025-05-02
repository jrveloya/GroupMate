import React, { useState, useEffect } from "react";
import TaskModal from "./TaskModal";
import "./Taskboard.css";

const Taskboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Currently just uses the endpoint that returns all tasks, change to get tasks assigned to this person
  const fetchTasks = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");
      console.log(token);

      // Updated URL to match the backend endpoint
      const response = await fetch("http://127.0.0.1:5050/tasks/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      console.log(data);
      // Transform backend task format to match the frontend format
      const transformedTasks = data.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        due_date: task.updated_at,
        project: { id: task.project_id, name: `Project ${task.project_id}` },
        comments: task.comments.map((c) => ({
          commenterName: c.username || "Unknown", // fallback if backend doesn't include name
          text: c.content || "",
        })),
      }));

      setTasks(transformedTasks);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  //Make a post to backend to register task as completed
  const handleCompleteTask = async (taskId) => {
    try {
      console.log(`Task ${taskId} completing...`);

      // Get the access token from localStorage
      const token = localStorage.getItem("access_token");

      // Make a POST request to complete the task
      const response = await fetch(
        `http://127.0.0.1:5050/tasks/${taskId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      // Check if the response is successful
      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Log success message from backend
        setShowModal(false); // Close the modal
        // Optionally, update the task list or refresh data here
      } else {
        const errorData = await response.json();
        console.error(
          "Error completing task:",
          errorData.error || errorData.message
        );
      }
    } catch (err) {
      console.error("Error in completing task:", err);
    }
  };

  const handleCommentSubmit = async (newComment, commenterName) => {
    try {
      // Ensure commenterName is not undefined
      const safeCommenterName = commenterName || "Anonymous";

      const response = await fetch("http://127.0.0.1:5050/comments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          task_id: selectedTask.id,
          content: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      // Create the new comment object with a safe name
      const newCommentObj = {
        commenterName: safeCommenterName,
        text: newComment,
      };

      // Update the selectedTask state with the new comment
      setSelectedTask({
        ...selectedTask,
        comments: [...selectedTask.comments, newCommentObj],
      });

      // Update the tasks array
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                comments: [...task.comments, newCommentObj],
              }
            : task
        )
      );
    } catch (err) {
      console.error("Error posting comment:", err);
    }
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
          onComplete={() => handleCompleteTask(selectedTask.id)}
          onComment={handleCommentSubmit}
        />
      )}
    </div>
  );
};

export default Taskboard;
