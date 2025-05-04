import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import Cookies from "js-cookie";
import "./ManagementBoard.css";

// Modal component for adding new projects
const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleAddProject = (e) => {
    e.preventDefault();
    if (projectName.trim() && projectDescription.trim()) {
      const newProject = {
        name: projectName,
        description: projectDescription,
        id: Date.now(), // Create unique ID for the new project ( Change this later to match backend)
      };
      onAddProject(newProject);
      setProjectName(""); // Clear project name input
      setProjectDescription(""); // Clear project description input
      onClose(); // Close the modal
    }
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Add New Project</h2>
        <form onSubmit={handleAddProject}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            required
          />
          <textarea
            className="description-box"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Enter project description"
            rows="4"
            required
          />
          <button type="submit">Add Project</button>
        </form>
      </div>
    </div>
  ) : null;
};

const ManagementBoard = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noProjects, setNoProjects] = useState(false); // New state for tracking "no projects" condition

  useEffect(() => {
    const fetchProjectsByManager = async () => {
      setLoading(true);
      setError(null);
      setNoProjects(false); // Reset the no projects state

      const managerId = Cookies.get("user_id");

      // Guard clause if no manager ID
      if (!managerId) {
        setError("No manager ID found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // Use the correct endpoint path based on your Flask route
        const response = await fetch(
          `http://127.0.0.1:5050/project/manager/${managerId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Handle both 404 and 422 as expected "no projects" conditions
        if (response.status === 404 || response.status === 422) {
          setProjects([]);
          setNoProjects(true); // Set the flag to indicate no projects found
          setLoading(false);
          return; // Exit early
        }

        if (!response.ok) {
          // Handle other non-success responses as actual errors
          throw new Error(`Server error: ${response.status}`);
        }

        const projectData = await response.json();
        setProjects(projectData);
        // If we got an empty array but not a 404, still show the no projects message
        setNoProjects(projectData.length === 0);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsByManager();
  }, []); // Empty dependency array means this effect runs once on mount

  // Add a new project - make calls to backend here
  const addProject = async (newProject) => {
    try {
      const managerId = Cookies.get("user_id");
      const token = localStorage.getItem("access_token");

      // Log the request data for debugging
      console.log("Creating project with data:", {
        name: newProject.name,
        description: newProject.description || "",
        manager_id: managerId,
      });

      // API call to create a new project
      const response = await fetch("http://127.0.0.1:5050/project/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description || "",
          manager_id: managerId,
        }),
      });

      console.log("Response status:", response.status);

      // Log the response for debugging
      const responseText = await response.text();
      console.log("Response body:", responseText);

      // Parse the JSON only if we have content
      const result = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(
          `Failed to create project: ${response.status} - ${
            result.error || "Unknown error"
          }`
        );
      }

      // Add the newly created project with the ID from the server
      const createdProject = {
        ...newProject,
        _id: result.project_id, // Use the ID returned from the server
      };

      setProjects((prevProjects) => [...prevProjects, createdProject]);
      setNoProjects(false); // We now have at least one project
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to create project");
      // Show the error to the user
    }
  };

  return (
    <div className="management-board">
      <h1>Management Board</h1>

      <button className="new-project-btn" onClick={() => setIsModalOpen(true)}>
        New Project
      </button>

      {loading && <p className="status-message">Loading projects...</p>}
      {error && <p className="error-message">Error: {error}</p>}
      {!loading && !error && noProjects && (
        <div className="no-projects-container">
          <p className="no-projects-message">No projects created yet.</p>
        </div>
      )}

      {/* Project Cards Section */}
      {!loading && !error && projects.length > 0 && (
        <div className="project-cards">
          {projects.map((project) => (
            <div key={project._id || project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <Link
                to={`/project/${project._id || project.id}`}
                className="project-link"
              >
                View Project
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal to add new project */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProject={addProject}
      />
    </div>
  );
};

export default ManagementBoard;
