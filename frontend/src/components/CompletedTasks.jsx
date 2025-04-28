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
      //Change this to use backend data
      const sampleCompletedTasks = [
        {
          id: 1,
          title: "Finish Dashboard Design",
          description: "Finalized the dashboard design and layout.",
          completed_date: "2025-04-15",
        },
        {
          id: 2,
          title: "API Integration",
          description:
            "Completed the integration of the frontend and backend APIs.",
          completed_date: "2025-04-20",
        },
        {
          id: 3,
          title: "User Authentication",
          description: "Set up the authentication system for the application.",
          completed_date: "2025-04-22",
        },
        {
          id: 4,
          title: "Backend Setup",
          description:
            "Configured the initial backend environment and database.",
          completed_date: "2025-04-10",
        },
        {
          id: 5,
          title: "Fix UI Bugs",
          description: "Fixed some UI bugs and improved responsiveness.",
          completed_date: "2025-04-12",
        },
        {
          id: 6,
          title: "Database Optimization",
          description: "Optimized database queries for better performance.",
          completed_date: "2025-04-18",
        },
        {
          id: 7,
          title: "Mobile App Deployment",
          description: "Deployed the mobile app to production.",
          completed_date: "2025-04-25",
        },
        {
          id: 8,
          title: "SEO Optimization",
          description: "Improved SEO on the website for better ranking.",
          completed_date: "2025-04-23",
        },
        // {
        //   id: 9,
        //   title: "Bug Fixing",
        //   description: "Fixed minor bugs in the application.",
        //   completed_date: "2025-04-28",
        // },
        // {
        //   id: 10,
        //   title: "Code Refactoring",
        //   description:
        //     "Refactored the backend code for better maintainability.",
        //   completed_date: "2025-04-30",
        // },
      ];

      // Simulate fetching data from an API
      setTimeout(() => {
        setCompletedTasks(sampleCompletedTasks);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Error fetching completed tasks:", err);
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
                  Completed on: {task.completed_date || "N/A"}
                </p>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
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
