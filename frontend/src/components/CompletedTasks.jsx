import React, { useEffect, useState } from "react";
import "./CompletedTasks.css";

const CompletedTasks = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletedTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = ""; //Get response from backend here

      const data = await response.json();
      setCompletedTasks(data.tasks);
    } catch (err) {
      console.error("Error fetching completed tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  return (
    <div className="completed-container">
      <h2>Completed Tasks</h2>
      {loading ? (
        <p>Loading...</p>
      ) : completedTasks.length === 0 ? (
        <p>No completed tasks yet.</p>
      ) : (
        <ul className="completed-list">
          {completedTasks.map((task) => (
            <li key={task.id} className="completed-card">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p className="completed-date">
                Completed on: {task.completed_date || "N/A"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompletedTasks;
