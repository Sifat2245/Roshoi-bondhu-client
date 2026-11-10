import React, { useState, useCallback } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router/index";
import AppProviders from "./providers/AppProviders";
import SplashScreen from "../components/common/SplashScreen";

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(
    () => sessionStorage.getItem("heshel:opened") !== "true",
  );
  const finishSplash = useCallback(() => {
    sessionStorage.setItem("heshel:opened", "true");
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen duration={650} onFinish={finishSplash} />}
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </>
  );
};

export default App;
