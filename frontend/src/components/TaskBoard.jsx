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
      const response = await fetch("http://127.0.0.1:5050/tasks/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      // Transform backend task format to match your frontend format
      const transformedTasks = data.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        due_date: task.updated_at, // or created_at — adjust as needed
        project: { id: task.project_id, name: `Project ${task.project_id}` }, // Replace with real project name if you have it
        comments: task.comments.map((c) => ({
          commenterName: c.commenterName || "Unknown", // fallback if backend doesn't include name
          text: c.text || "",
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
  const handleCompleteTask = (taskId) => {
    console.log(`Task ${taskId} completed`);
    setShowModal(false);
  };

  const handleCommentSubmit = (newComment, commenterName) => {
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
