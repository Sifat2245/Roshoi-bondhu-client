import React, { useState, useCallback } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router/index";
import AppProviders from "./providers/AppProviders";
import SplashScreen from "../components/common/SplashScreen";

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const finishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen duration={850} onFinish={finishSplash} />}
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </>
  );
};

export default App;
