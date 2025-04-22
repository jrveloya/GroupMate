import React, { useEffect, useState } from "react";
import "./Taskboard.css";

const Taskboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = ""; //Fetch data from backend here

      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="taskboard-container">
      <h2>My Task Board</h2>
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned to you.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-card">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p className="due-date">Due: {task.due_date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Taskboard;
