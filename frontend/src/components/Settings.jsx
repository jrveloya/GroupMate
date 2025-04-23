import React, { useState, useEffect } from "react";
import "./Settings.css";

const Settings = () => {
  const [user, setUser] = useState({ username: "" });

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUser({ name: data.username });
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:5000/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      alert("Profile updated!");
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <form onSubmit={handleSubmit} className="settings-form">
        <label>
          Change Username:
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default Settings;
