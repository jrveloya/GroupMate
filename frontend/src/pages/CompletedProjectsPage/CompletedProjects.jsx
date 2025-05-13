import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./CompletedProjects.css";

const CompletedProjects = () => {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  const fetchCompletedProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      const managerId = Cookies.get("user_id");

      if (!managerId) {
        throw new Error("No manager ID found. Please log in again.");
      }

      // Call the endpoint to get completed projects
      const response = await fetch(
        `https://groupmate-alb-1871461292.us-west-1.elb.amazonaws.com:5050/project/completed/manager/${managerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No completed projects found
          setCompletedProjects([]);
          setLoading(false);
          return;
        }
        throw new Error(
          `Failed to fetch completed projects: ${response.status}`
        );
      }

      const data = await response.json();

      // Always ensure we set an array
      setCompletedProjects(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching completed projects:", err);
      setError(err.message);
      setLoading(false);
      // In case of error, ensure completedProjects is an array
      setCompletedProjects([]);
    }
  };

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  // Get current projects based on pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  console.log(completedProjects);

  // This is now safe because completedProjects is always initialized as an array
  const currentProjects = completedProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="completed-container">
      <h2>Your Completed Projects</h2>

      {loading ? (
        <div className="loading">
          <p>Loading your completed projects...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      ) : completedProjects.length === 0 ? (
        <div className="empty-state">
          <p>You haven't completed any projects yet.</p>
        </div>
      ) : (
        <>
          <ul className="completed-list">
            {currentProjects.map((project) => (
              <li key={project._id} className="completed-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <p className="completed-date">
                  {project.updated_at && (
                    <span>Completed: {formatDate(project.updated_at)}</span>
                  )}
                </p>
              </li>
            ))}
          </ul>

          {completedProjects.length > projectsPerPage && (
            <div className="pagination">
              {Array.from(
                {
                  length: Math.ceil(completedProjects.length / projectsPerPage),
                },
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

export default CompletedProjects;
