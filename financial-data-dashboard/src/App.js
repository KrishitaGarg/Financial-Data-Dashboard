import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login/login";
import Dashboard from "./components/Dashboard";
import "./App.css";
import { auth } from "./auth";

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    return storedLoginStatus === "true";
  });

  useEffect(() => {
    // Retrieve user info from local storage if logged in
    const storedUserInfo = localStorage.getItem("userInfo");
    if (isLoggedIn && storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      // Simulating user login process
      const currentUser = auth.currentUser; // Assume auth is properly set up
      if (currentUser) {
        const userInfo = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        };
        setUserInfo(userInfo);
        setIsLoggedIn(true);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        localStorage.setItem("isLoggedIn", "true");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Failed to log in. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem("userInfo");
      localStorage.removeItem("isLoggedIn");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
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
              <Dashboard userInfo={userInfo} onLogout={handleLogout} />
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
