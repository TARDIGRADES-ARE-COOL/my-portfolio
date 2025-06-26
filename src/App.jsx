import React from "react";
import Navbar from "./components/Navbar";
import AboutMe from "./components/AboutMe";
import Projects from "./components/Projects";
import Footer from "./components/Footer";
import "./styles/App.css";

function App() {
  return (
    <>
      <Navbar />
      <AboutMe />
      <Projects />
      <Footer />
    </>
  );
}

export default App;
