import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import Login from "./pages/LoginPage/login";
import Singupe from "./pages/Singupe/Singupe";
import Main from "./pages/RAJASTHAN POLICE FEEDBACK SYSTEM/Main";
import "./App.css";

const AUTH_STORAGE_KEY = "police-feedback-user";

const getStoredUser = () => {
  try {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedUser) {
      return { name: "", email: "", mobileNo: "" };
    }

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.email) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return { name: "", email: "", mobileNo: "" };
    }

    return {
      name: parsedUser.name || "",
      email: parsedUser.email,
      mobileNo: parsedUser.mobileNo || "",
    };
  } catch (error) {
    console.error("Unable to restore login session:", error);
    return { name: "", email: "", mobileNo: "" };
  }
};

const App = () => {
  const [user, setUser] = useState(getStoredUser);
  const [screen, setScreen] = useState(() => (getStoredUser().email ? "feedback" : "login"));

  const prefill = useMemo(
    () => ({
      name: user.name || "",
      email: user.email || "",
      mobileNo: user.mobileNo || "",
    }),
    [user]
  );

  useEffect(() => {
    const handlePopState = () => {
      if (!user.email) {
        setScreen("login");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user.email]);

  const handleLogout = () => {
    setUser({ name: "", email: "", mobileNo: "" });
    setScreen("login");
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.history.pushState({ loggedOut: true }, "", window.location.href);
  };

  const handleLoginSuccess = (payload) => {
    setUser(payload);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    setScreen("feedback");
  };

  if (screen === "login") {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onGoSignup={() => setScreen("signup")}
      />
    );
  }

  if (screen === "signup") {
    return (
      <Singupe
        onSignupComplete={(payload) => {
          setUser(payload);
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
          setScreen("feedback");
        }}
        onGoLogin={() => setScreen("login")}
      />
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ p: 1, backgroundColor: "#F0E68C" }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Stack>
      <Main
        prefill={prefill}
        skipOtpVerification={Boolean(user.email)}
      />
      <Typography align="center" sx={{ pb: 2, color: "#444", fontSize: 12 }}>
        Logged in as {user.email || "guest"}
      </Typography>
    </Box>
  );
};

export default App;