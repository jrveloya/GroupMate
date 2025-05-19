import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./Settings.css";

const API_URL = process.env.REACT_APP_API_URL;

const Settings = () => {
  const [user, setUser] = useState({ username: "" });
  const [formValues, setFormValues] = useState({ username: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("access_token");
    const userId = Cookies.get("user_id");

    if (!userId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.status}`);
      }

      const data = await res.json();
      setUser({
        username: data.username,
        // You can add other fields here if needed
      });

      // Keep form values empty
      setFormValues({
        username: "",
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Only proceed if there's a value to update
    if (!formValues.username.trim()) {
      setError("Please enter a new username");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(
        `${API_URL}/users/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formValues.username,
            // Add any other fields you want to update
          }),
        }
      );

      if (res.status === 409) {
        setError("This username is already taken. Please choose another one.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to update profile: ${res.status}`);
      }

      setSuccess(true);

      // Reset form values
      setFormValues({
        username: "",
      });

      // Refresh user data
      fetchUserData();
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      {!loading && !error && (
        <div className="welcome-message">
          <p>
            Welcome, <strong>{user.username}</strong>! Here you can update your
            profile settings.
          </p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">Profile updated successfully!</div>
      )}

      {loading && !error ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="username">Change Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formValues.username}
              onChange={handleChange}
              disabled={loading}
              placeholder="Enter new username"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formValues.username.trim()}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Settings;
