import React from "react";
import { Link } from "react-router";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="nav-bar">
      <h1 className="title">Group</h1>
      <ul className="nav-links">
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
