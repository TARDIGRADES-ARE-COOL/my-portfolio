import React from "react";
import Navbar from "./components/Navbar";
import AboutMe from "./components/AboutMe";
import Projects from "./components/Projects";
import Footer from "./components/Footer";
//import "./App.css"; // ✅ New
import "./styles/App.css";

function App() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="hero">
        <h1>Hi, I'm Sarvesh</h1>
        <p>AI + Cybersecurity Explorer | Building cool things</p>
      </section>

      <AboutMe />
      <Projects />
      <Footer />
    </>
  );
}

export default App;
