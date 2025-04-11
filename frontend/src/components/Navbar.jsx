import React from "react";
import { Link } from "react-router";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="nav-bar">
      <div className="title">
        <Link to="/">
          <h1>Group</h1>
        </Link>
      </div>
      <ul className="nav-links">
        <li></li>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/page">Page 1</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
