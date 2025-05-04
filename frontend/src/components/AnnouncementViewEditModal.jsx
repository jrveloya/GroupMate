import React, { useState, useEffect } from "react";
import "./ModalStyles.css";

// AnnouncementViewEditModal component for viewing and editing announcements
const AnnouncementViewEditModal = ({
  isOpen,
  onClose,
  announcement,
  onUpdateAnnouncement,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (announcement) {
      setAnnouncementTitle(announcement.title || "");
      setAnnouncementContent(announcement.content || "");
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
          <button
            className={`edit-toggle-btn ${isEditing ? "cancel" : "edit"}`}
            onClick={handleEditToggle}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {isEditing ? (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementViewEditModal;
