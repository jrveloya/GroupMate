import React, { useState } from "react";
import "./ModalStyles.css";

// Modal component for displaying project members and adding new members
const MembersModal = ({
  isOpen,
  onClose,
  members,
  onAddUser,
  onRemoveUser,
  projectId,
  currentUserId,
  ownerId,
}) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [removingUserId, setRemovingUserId] = useState(null);

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

  const handleRemoveUser = async (userId, username) => {
    setRemovingUserId(userId);
    setMessage("");

    try {
      await onRemoveUser(userId);
      setMessage(`Successfully removed ${username} from the project`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setRemovingUserId(null);
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
            members.map((member, index) => {
              const isOwner = member.member_id === ownerId;
              return (
                <div
                  key={member.member_id || index}
                  className={`member-item ${isOwner ? "owner" : ""}`}
                >
                  <div className="member-info">
                    <div className="member-username-container">
                      <span className="member-username">{member.username}</span>
                      {isOwner && (
                        <span className="owner-badge" style={{ color: "cyan" }}>
                          {" "}
                          Owner
                        </span>
                      )}
                    </div>
                    <span className="member-id">ID: {member.member_id}</span>
                  </div>
                  <div className="member-actions">
                    {member.member_id !== currentUserId &&
                      member.member_id !== ownerId && (
                        <button
                          className="remove-member-btn"
                          onClick={() =>
                            handleRemoveUser(member.member_id, member.username)
                          }
                          disabled={removingUserId === member.member_id}
                        >
                          {removingUserId === member.member_id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-members">No members in this project</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
