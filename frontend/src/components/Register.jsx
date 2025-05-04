import React, { useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import "./Login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    isManager: false, // Added manager role state
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, isManager } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Handle form submission (e.g., send to backend)
    try {
      const response = await fetch("http://127.0.0.1:5050/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role: isManager ? "manager" : "user", // Pass the role based on checkbox
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User created:", data);

        // If backend returns a JWT token:
        if (data.access_token) {
          // Optionally save the token to localStorage
          localStorage.setItem("access_token", data.access_token);
        }

        if (data.user_id) {
          Cookies.set("user_id", data.user_id, { expires: 7 }); // 7 days
        }
        if (data.role) {
          Cookies.set("role", data.role, { expires: 7 });
        }

        setError("");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to register");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  const goBack = () => {
    navigate("/"); // navigates to the previous page
  };

  return (
    <div className="register-container">
      <button onClick={goBack} className="back-button">
        ← Back
      </button>
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="username"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="isManager"
            name="isManager"
            checked={formData.isManager}
            onChange={handleChange}
          />
          <label htmlFor="isManager">Register as Manager</label>
        </div>
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default Register;
