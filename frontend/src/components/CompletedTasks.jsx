import React, { useEffect, useState } from "react";
import "./CompletedTasks.css";

const CompletedTasks = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const tasksPerPage = 5; // Show 5 tasks per page

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");
      console.log(token);

      // Updated URL to match the backend endpoint
      const response = await fetch("http://127.0.0.1:5050/tasks/me/completed", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      // Transform backend task format to match the frontend format
      const transformedTasks = data.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        due_date: task.updated_at,
        project: { id: task.project_id, name: `${task.project}` },
      }));

      setCompletedTasks(transformedTasks);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  // Get current tasks based on the current page
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = completedTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="completed-container">
      <h2>Your Completed Tasks ✅</h2>
      {loading ? (
        <p>Loading...</p>
      ) : completedTasks.length === 0 ? (
        <p>No completed tasks yet.</p>
      ) : (
        <>
          <ul className="completed-list">
            {currentTasks.map((task) => (
              <li key={task.id} className="completed-card">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p className="completed-date">
                  Project: {task.project.name || "N/A"}
                </p>
              </li>
            ))}
          </ul>

          <div className="pagination">
            {Array.from(
              { length: Math.ceil(completedTasks.length / tasksPerPage) },
              (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={index + 1 === currentPage ? "active" : ""}
                >
                  {index + 1}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CompletedTasks;
