import React, { useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import "./Auth.css";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    isManager: false,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setRegisterData({
      ...registerData,
      [e.target.name]: value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = loginData;

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(
        "http://groupmate-alb-1871461292.us-west-1.elb.amazonaws.com:5050/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }

        if (data.user_id) {
          Cookies.set("user_id", data.user_id, { expires: 7 });
        }
        if (data.role) {
          Cookies.set("role", data.role, { expires: 7 });
        }

        setError("");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, isManager } = registerData;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://groupmate-alb-1871461292.us-west-1.elb.amazonaws.com:5050/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            role: isManager ? "manager" : "user",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }

        if (data.user_id) {
          Cookies.set("user_id", data.user_id, { expires: 7 });
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>GroupMate</h1>
          <p>Your personal task management system</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("register");
              setError("");
            }}
          >
            Register
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>
            <button type="submit" className="auth-button">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="isManager"
                name="isManager"
                checked={registerData.isManager}
                onChange={handleRegisterChange}
              />
              <label htmlFor="isManager">Register as Manager</label>
            </div>
            <button type="submit" className="auth-button">
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
