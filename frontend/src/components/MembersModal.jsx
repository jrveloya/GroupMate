import React, { useState } from "react";
import "./ModalStyles.css";

// Modal component for displaying project members and adding new members
const MembersModal = ({ isOpen, onClose, members, onAddUser }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await onAddUser(username);
      setMessage(response.message);
      setUsername(""); // Clear input on success
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content members-modal">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Project Members</h2>

        {/* Add Member Form */}
        <form onSubmit={handleSubmit} className="add-member-form">
          <div className="form-row">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username to add"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="add-member-btn"
              disabled={loading || !username.trim()}
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`form-message ${
              message.toLowerCase().includes("error") ? "error" : "success"
            }`}
          >
            {message}
          </p>
        )}

        <div className="members-list">
          {members && members.length > 0 ? (
            members.map((member, index) => (
              <div key={member.member_id || index} className="member-item">
                <div className="member-info">
                  <span className="member-username">{member.username}</span>
                  <span className="member-id">ID: {member.member_id}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-members">No members in this project</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
