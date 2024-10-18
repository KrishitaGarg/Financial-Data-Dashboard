import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login/login";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    return storedLoginStatus === "true";
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
