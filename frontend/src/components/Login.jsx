import React, { useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5050/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login success:", data);

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
        console.log(data.access_token);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed");
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
    <div className="login-container">
      <button onClick={goBack} className="back-button">
        ← Back
      </button>
      <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
