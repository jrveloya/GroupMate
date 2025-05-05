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
        status: "active", // Set status to active for new projects
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

// Delete Confirmation Modal
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
}) => {
  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Delete Project?</h2>
        <div className="delete-warning-icon">⚠️</div>
        <p className="delete-warning-text">
          Warning: Deleting <strong>{projectName}</strong> will also delete all
          tasks and announcements associated with this project.
        </p>
        <p className="delete-warning-subtext">This action cannot be undone.</p>
        <div className="delete-actions">
          <button className="cancel-delete-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-delete-btn" onClick={onConfirm}>
            Delete Project
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

const ManagementBoard = () => {
  const [projects, setProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noProjects, setNoProjects] = useState(false);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchProjectsByManager = async () => {
      setLoading(true);
      setError(null);
      setNoProjects(false);

      const managerId = Cookies.get("user_id");

      if (!managerId) {
        setError("No manager ID found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
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

        if (response.status === 404 || response.status === 422) {
          setProjects([]);
          setActiveProjects([]);
          setNoProjects(true);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const projectData = await response.json();
        setProjects(projectData);

        // Filter for active projects
        const filteredProjects = projectData.filter(
          (project) =>
            project.status === "active" || project.status === undefined
        );

        setActiveProjects(filteredProjects);
        setNoProjects(filteredProjects.length === 0);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsByManager();
  }, []);

  // Add a new project
  const addProject = async (newProject) => {
    try {
      const managerId = Cookies.get("user_id");
      const token = localStorage.getItem("access_token");

      console.log("Creating project with data:", {
        name: newProject.name,
        description: newProject.description || "",
        manager_id: managerId,
        status: "active", // Ensure new projects are active
      });

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
          status: "active", // Add status field to API request
        }),
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Response body:", responseText);

      const result = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(
          `Failed to create project: ${response.status} - ${
            result.error || "Unknown error"
          }`
        );
      }

      const createdProject = {
        ...newProject,
        _id: result.project_id,
        status: "active",
      };

      setProjects((prevProjects) => [...prevProjects, createdProject]);
      setActiveProjects((prevActiveProjects) => [
        ...prevActiveProjects,
        createdProject,
      ]);
      setNoProjects(false);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to create project");
    }
  };

  // Handle delete button click
  const handleDeleteClick = (e, project) => {
    e.preventDefault(); // Prevent navigation to project detail
    e.stopPropagation(); // Prevent event bubbling
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  // Delete project
  const deleteProject = async () => {
    if (!projectToDelete) return;

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:5050/project/${projectToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.status}`);
      }

      const result = await response.json();
      console.log("Delete response:", result);

      // Remove from both state arrays
      setProjects((prevProjects) =>
        prevProjects.filter((p) => p._id !== projectToDelete._id)
      );

      setActiveProjects((prevActiveProjects) =>
        prevActiveProjects.filter((p) => p._id !== projectToDelete._id)
      );

      // Check if we need to show the no projects message
      if (activeProjects.length === 1) {
        setNoProjects(true);
      }

      // Close modal
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(`Failed to delete project: ${err.message}`);
    } finally {
      setDeleteLoading(false);
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
          <p className="no-projects-message">No active projects found.</p>
        </div>
      )}

      {/* Project Cards Section - Only showing ACTIVE projects */}
      {!loading && !error && activeProjects.length > 0 && (
        <div className="project-cards">
          {activeProjects.map((project) => (
            <div key={project._id || project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="project-card-footer">
                <Link
                  to={`/project/${project._id || project.id}`}
                  className="project-link"
                >
                  View Project
                </Link>
                <button
                  className="delete-project-btn"
                  onClick={(e) => handleDeleteClick(e, project)}
                  aria-label="Delete project"
                >
                  <span className="delete-icon">🗑️</span>
                </button>
              </div>
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

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteProject}
        projectName={projectToDelete?.name || ""}
      />
    </div>
  );
};

export default ManagementBoard;
