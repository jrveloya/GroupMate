import React, { useState, useEffect } from "react";
import "./ModalStyles.css";

// AnnouncementViewEditModal component for viewing and editing announcements
const AnnouncementViewEditModal = ({
  isOpen,
  onClose,
  announcement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (announcement) {
      setAnnouncementTitle(announcement.title || "");
      setAnnouncementContent(announcement.content || "");
      // Reset editing state when a new announcement is loaded
      setIsEditing(false);
      setError("");
      setLoading(false);
      setIsConfirmingDelete(false);
    }
  }, [announcement]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updatedAnnouncement = {
        ...announcement,
        title: announcementTitle,
        content: announcementContent,
      };

      await onUpdateAnnouncement(updatedAnnouncement);
      // After successful update, close the modal
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update announcement");
      setLoading(false);
      // Reset editing state if there's an error
      setIsEditing(false);
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await onDeleteAnnouncement(announcement._id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete announcement");
      setLoading(false);
      setIsConfirmingDelete(false);
    }
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <div className="modal-header">
          <h2>{isEditing ? "Edit Announcement" : announcement.title}</h2>
          <div className="modal-actions">
            <button
              className={`edit-toggle-btn ${isEditing ? "cancel" : "edit"}`}
              onClick={handleEditToggle}
              disabled={isConfirmingDelete}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {isConfirmingDelete ? (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this announcement?</p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="delete-actions">
              <button
                className="cancel-delete-btn"
                onClick={handleCancelDelete}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <form
            className="announcement-form"
            onSubmit={handleUpdateAnnouncement}
          >
            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="Enter announcement title"
              required
            />
            <textarea
              className="announcement-description"
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              placeholder="Enter announcement content"
              rows="4"
              required
            />
            {error && <p className="error-message">{error}</p>}
            <button
              className="update-announcement-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Announcement"}
            </button>
          </form>
        ) : (
          <div className="announcement-details">
            <p className="announcement-content-text">{announcement.content}</p>
            <p className="announcement-meta">
              <small>
                Posted on:{" "}
                {new Date(announcement.created_at).toLocaleDateString()} at{" "}
                {new Date(announcement.created_at).toLocaleTimeString()}
              </small>
            </p>

            {/* Delete button placed at the bottom */}
            <div className="bottom-actions">
              <button className="delete-btn" onClick={handleDeleteClick}>
                Delete Announcement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementViewEditModal;
