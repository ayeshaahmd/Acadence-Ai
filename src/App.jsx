import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import PaperDetail from "./pages/PaperDetail";
import MyPapers from "./pages/MyPapers";
import SciBotHome from "./pages/SciBotHome";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/papers" element={<MyPapers />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route path="/scibot" element={<SciBotHome />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" autoClose={5000} />
      </div>
    </Router>
  );
}

export default App;
