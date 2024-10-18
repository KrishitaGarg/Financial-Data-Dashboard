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

const Header = styled.div`
  width: 100%;
  height: 8%;
  padding: 20px;
  background-color: #1e1e1e;
  color: white;
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 15px;
  }
`;

const Container = styled.div`
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 90%;
  max-width: 900px;
  margin: 30px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;
  margin-top: 6%;
  @media (max-width: 768px) {
    height: auto;
    margin-top: 10%;
  }
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
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    transform: translateX(0);
    position: relative;
  }
`;

const SignInContainer = styled.div`
  position: absolute;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  opacity: ${(props) => (props.signingIn ? "1" : "0")};
  ${(props) => (props.signingIn ? null : `transform: translateX(100%);`)};
  @media (max-width: 768px) {
    width: 50%;
    opacity: 1;
    transform: translateY(0);
  }
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
  @media (max-width: 768px) {
    width: 50%;
    opacity: 1;
    transform: translateY(0);
  }
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
  @media (max-width: 768px) {
    padding: 10px;
    width: 50%;
    height: auto;
  }
  ${(props) =>
    props.signingIn !== true ? `transform: translateX(0%);` : null};
`;

const Form = styled.form`
  background: #2c2c2c;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Title = styled.h1`
  font-weight: bold;
  font-size: 2rem;
  color: #e6e6e6;
  margin: 0;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0;
  }
`;

const Input = styled.input`
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  transition: border-color 0.3s;
  &:focus {
    border-color: #5a9a61;
    outline: none;
  }
  @media (max-width: 768px) {
    padding: 5px;
    margin-bottom: 2px;
  }
`;

const Button = styled.button`
  border-radius: 10px;
  margin-top: 15px;
  border: none;
  background-color: #5a9a61;
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: background-color 0.3s, transform 80ms ease-in;
  &:hover {
    background-color: #4e8d55;
  }
  &:active {
    transform: scale(0.95);
  }
  &:focus {
    outline: none;
  }
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.8rem;
  }
`;

const GhostButton = styled(Button)`
  background-color: transparent;
  color: #5a9a61;
  border: 1px solid #5a9a61;
  &:hover {
    background-color: rgba(90, 154, 97, 0.1);
    font-size: 0.8rem;
  }
`;

const WelcomeTitle = styled.h1`
  color: #ffffff;
  animation: ${fadeIn} 0.6s ease-in-out forwards;
  font-size: 1.8rem;
  width: 90%;
  text-align: center;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
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
    <>
      <Header>Stock Market KPI Dashboard</Header>
      <Container>
        <SignUpContainer signingIn={signIn}>
          <Form
            onSubmit={handleSignUp}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
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
            <GhostButton
              onClick={handleGoogleSignUp}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
              }}
            >
              <img
                src={GoogleIcon}
                alt="Google"
                style={{ marginRight: "10px", width: "30px" }}
              />
              Sign Up with Google
            </GhostButton>
            <Button
              type="submit"
              style={{
                width: "100%",
                fontSize: "14px",
                backgroundColor: "green",
                color: "white",
              }}
            >
              Sign Up
            </Button>
          </Form>
        </SignUpContainer>

        <SignInContainer signingIn={signIn}>
          <Form
            onSubmit={handleSignIn}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
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
            <Button
              type="submit"
              style={{
                width: "100%",
                fontSize: "14px",
                backgroundColor: "green",
                color: "white",
              }}
            >
              Sign In
            </Button>
            <img
              src={SignOr}
              alt="Or"
              style={{ marginRight: "10px", width: "350px", marginTop: "15px" }}
            />
            <GhostButton
              onClick={handleGoogleSignIn}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
              }}
            >
              <img
                src={GoogleIcon}
                alt="Google"
                style={{ marginRight: "10px", width: "30px" }}
              />
              Sign In with Google
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
    </>
  );
};

export default SignInSignUp;
