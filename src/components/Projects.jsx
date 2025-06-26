import React, { useEffect, useState } from "react";
import "../styles/Projects.css";

const Projects = () => {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch("https://api.github.com/users/TARDIGRADES-ARE-COOL/repos")
      .then((res) => res.json())
      .then((data) => setRepos(data.slice(0, 6))) // Adjust number as needed
      .catch((err) => console.error(err));
  }, []);

  return (
    <section id="projects">
      <h2>GitHub Projects</h2>
      <div className="projects-grid">
        {repos.map((repo) => (
          <div className="project-card" key={repo.id}>
            <a href={repo.html_url} target="_blank" rel="noreferrer">
              {repo.name}
            </a>
            <p>{repo.description || "No description provided."}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
export default Projects;
