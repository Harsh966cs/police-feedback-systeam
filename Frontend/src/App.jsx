import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import Login from "./pages/LoginPage/login";
import Singupe from "./pages/Singupe/Singupe";
import Main from "./pages/RAJASTHAN POLICE FEEDBACK SYSTEM/Main";
import "./App.css";

const App = () => {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState({
    name: "",
    email: "",
    mobileNo: "",
  });

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
    window.history.pushState({ loggedOut: true }, "", window.location.href);
  };

  if (screen === "login") {
    return (
      <Login
        onLoginSuccess={(payload) => {
          setUser(payload);
          setScreen("feedback");
        }}
        onGoSignup={() => setScreen("signup")}
      />
    );
  }

  if (screen === "signup") {
    return (
      <Singupe
        onSignupComplete={(payload) => {
          setUser(payload);
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