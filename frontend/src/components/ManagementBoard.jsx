import React, { useState, useEffect } from "react";
import { Link } from "react-router";
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

  // Sample data for existing projects
  const sampleProjects = [
    {
      id: 1,
      name: "Project Alpha",
      description: "A comprehensive project to redesign the company website.",
    },
    {
      id: 2,
      name: "Project Beta",
      description: "A project to develop the mobile app for our services.",
    },
    {
      id: 3,
      name: "Project Gamma",
      description: "A project to improve internal company software.",
    },
    {
      id: 4,
      name: "Project Delta",
      description: "A project focused on marketing and branding strategy.",
    },
  ];

  // Simulate fetching projects (replace this with real API call)
  useEffect(() => {
    const fetchProjects = () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate a delay
        setTimeout(() => {
          setProjects(sampleProjects); // Using the sample data here
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to fetch projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Add a new project make calls to backend here
  const addProject = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  return (
    <div className="management-board">
      <h1>Management Board</h1>

      <button className="new-project-btn" onClick={() => setIsModalOpen(true)}>
        New Project
      </button>

      {loading && <p>Loading projects...</p>}
      {error && <p>Error: {error}</p>}

      {/* Project Cards Section */}
      <div className="project-cards">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <Link to={`/project/${project.id}`} className="project-link">
              View Project
            </Link>
          </div>
        ))}
      </div>

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
