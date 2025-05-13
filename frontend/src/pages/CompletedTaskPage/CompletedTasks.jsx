import React, { useEffect, useState } from "react";
import "./CompletedTasks.css";

const CompletedTasks = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      // Updated URL to match the backend endpoint
      const response = await fetch(
        "http://groupmate-alb-1871461292.us-west-1.elb.amazonaws.com:5050/tasks/me/completed",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
  console.log(completedTasks);
  const currentTasks = completedTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="completed-container">
      <h2>Your Completed Tasks</h2>

      {loading ? (
        <div className="loading">
          <p>Loading your accomplishments...</p>
        </div>
      ) : completedTasks.length === 0 ? (
        <div className="empty-state">
          <p>You haven't completed any tasks yet.</p>
        </div>
      ) : (
        <>
          <ul className="completed-list">
            {currentTasks.map((task) => (
              <li key={task.id} className="completed-card">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p className="completed-date">
                  <span>Project: </span>
                  <strong>{task.project.name || "N/A"}</strong>
                  {task.due_date && (
                    <span style={{ marginLeft: "auto" }}>
                      Completed: {formatDate(task.due_date)}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>

          {completedTasks.length > tasksPerPage && (
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
          )}
        </>
      )}
    </div>
  );
};

export default CompletedTasks;
