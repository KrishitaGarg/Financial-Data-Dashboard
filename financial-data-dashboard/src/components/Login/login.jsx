import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../assets/google.png";
import SignOr from "../../assets/SignOr.png";
import {
  auth,
  googleProvider,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "../../auth";
import "./login.css";
import bg from "../../assets/complete-reg.png";

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 900px;
  max-width: 100%;
  margin: auto;
  top: 25%;
  left: 25%;
  transform: translate(-42%, 10%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;
`;

const SignUpContainer = styled.div`
  position: absolute;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  ${(props) =>
    props.signingIn !== true
      ? `
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;`
      : null};
`;

const SignInContainer = styled.div`
  position: absolute;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  opacity: ${(props) => (props.signingIn ? "1" : "0")}; // Set opacity here
  ${(props) => (props.signingIn ? null : `transform: translateX(100%);`)};
`;

const Form = styled.form`
  background: #1e1e1e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
  position: relative;
`;

const Title = styled.h1`
  font-weight: bold;
  font-size: 1.7rem;
  color: white;
  margin: 0;
  margin-bottom: 20px;
`;

const Input = styled.input`
  background-color: white;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
`;

const Button = styled.button`
  border-radius: 10px;
  margin-top: 15px;
  border: 1px solid black;
  background-color: #5a9a61;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  &:active {
    transform: scale(0.95);
  }
  &:focus {
    outline: none;
  }
`;

const GhostButton = styled(Button)`
  background-color: transparent;
  border: none;
`;

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  ${(props) =>
    props.signingIn !== true ? `transform: translateX(-100%);` : null};
`;

const Overlay = styled.div`
  background-image: url(${bg});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  color: black;
  position: relative;
  height: 100%;
  width: 100%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  ${(props) =>
    props.signingIn !== true ? `transform: translateX(0%);` : null};
`;

const WelcomeTitle = styled.h1`
  color: white;
  animation: ${fadeIn} 0.6s ease-in-out forwards;
  font-size: 2.5rem;
  width: 90%;
  text-align: center;
  margin: 0;
`;

const SignInSignUp = ({ onLogin }) => {
  const [signIn, toggle] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !username) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await signUpWithEmail(email, password);
      const user = userCredential.user;
      console.log("User signed up successfully:", user);
      alert(`Welcome to KPI Dashboard, ${username}! Please log in.`);
      navigate("/");
    } catch (error) {
      alert(`Failed to sign up. Error: ${error.message}`);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      await signInWithEmail(trimmedEmail, trimmedPassword);
      alert("Welcome to KPI Dashboard!");
      onLogin();
      navigate("/dashboard");
    } catch (error) {
      alert(`Failed to sign in. Error: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle(auth, googleProvider);
      alert("Welcome to KPI Dashboard!");
      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (error) {
      alert(`Failed to sign in with Google. Error: ${error.message}`);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithGoogle(auth, googleProvider);
      alert("Welcome to KPI Dashboard!");
      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (error) {
      alert(`Failed to sign up with Google. Error: ${error.message}`);
    }
  };

  const toggleSignIn = () => {
    toggle(!signIn);
  };

  return (
    <Container>
      <SignUpContainer signingIn={signIn}>
        <Form onSubmit={handleSignUp}>
          <Title>Create Account</Title>
          <Input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="email"
            id="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            id="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <img
            src={SignOr}
            alt="Or"
            style={{ marginRight: "10px", width: "350px", marginTop: "15px" }}
          />
          <GhostButton onClick={handleGoogleSignUp} style={{ width: "100%" }}>
            <img
              src={GoogleIcon}
              alt="Google"
              style={{ marginRight: "10px", width: "30px" }}
            />
          </GhostButton>
          <Button type="submit" style={{ width: "100%", fontSize: "14px" }}>
            Sign Up
          </Button>
        </Form>
      </SignUpContainer>

      <SignInContainer signingIn={signIn}>
        <Form onSubmit={handleSignIn}>
          <Title>Sign In</Title>
          <Input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" style={{ width: "100%", fontSize: "14px" }}>
            Sign In
          </Button>
          <img
            src={SignOr}
            alt="Or"
            style={{ marginRight: "10px", width: "350px", marginTop: "15px" }}
          />
          <GhostButton onClick={handleGoogleSignIn} style={{ width: "100%" }}>
            <img
              src={GoogleIcon}
              alt="Google"
              style={{ marginRight: "10px", width: "30px" }}
            />
          </GhostButton>
        </Form>
      </SignInContainer>

      <OverlayContainer signingIn={signIn}>
        <Overlay signingIn={signIn}>
          <WelcomeTitle
            style={{ background: "rgb(0, 0, 0, 0.5)", margin: "5%" }}
          >
            Welcome to Your KPI Dashboard
          </WelcomeTitle>
          <Button
            onClick={toggleSignIn}
            style={{
              backgroundColor: "rgb(0, 0, 0, 0.5)",
              margin: "5%",
              width: "90%",
              height: "8%",
              marginTop: "70%",
              fontSize: "13px",
            }}
          >
            {signIn
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Button>
        </Overlay>
      </OverlayContainer>
    </Container>
  );
};

export default SignInSignUp;
