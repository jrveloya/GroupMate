import React, { useState } from "react";
import { useNavigate } from "react-router";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Placeholder for real login logic (e.g. POST to Flask backend)

    console.log("Logging in with:", formData);

    // IF successful then redirect to dashboard
    navigate("/dashboard");
    setError("");
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
