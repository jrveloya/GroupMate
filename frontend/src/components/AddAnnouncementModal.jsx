import React, { useState } from "react";
import "./ModalStyles.css";

// Modal component for adding new announcements
const AddAnnouncementModal = ({ isOpen, onClose, onAddAnnouncement }) => {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (announcementTitle.trim() && announcementContent.trim()) {
      const newAnnouncement = {
        title: announcementTitle,
        content: announcementContent,
        id: Date.now(),
      };
      onAddAnnouncement(newAnnouncement);
      setAnnouncementTitle(""); // Clear title input field
      setAnnouncementContent(""); // Clear content input field
      onClose(); // Close the modal
    }
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header-container">
          <h2>Create New Announcement</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="announcement-form" onSubmit={handleAddAnnouncement}>
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
          <button className="add-announcement-btn" type="submit">
            Create Announcement
          </button>
        </form>
      </div>
    </div>
  ) : null;
};

export default AddAnnouncementModal;
