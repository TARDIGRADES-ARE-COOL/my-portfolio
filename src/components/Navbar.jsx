import React from "react";

const Navbar = () => (
  <nav>
    <h1>My Portfolio</h1>
    <ul>
      <li>
        <a href="#hero">Home</a>
      </li>
      <li>
        <a href="#about">About Me</a>
      </li>
      <li>
        <a href="#projects">Projects</a>
      </li>
      <li>
        <a
          href="https://github.com/TARDIGRADES-ARE-COOL"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </li>
    </ul>
  </nav>
);

export default Navbar;
