import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import { router } from './router/Router.jsx';
import AuthProvider from './authProvider/AuthProvider.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import SplashScreen from './components/common/SplashScreen.jsx';

const AppRoot = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen duration={1200} onFinish={() => setShowSplash(false)} />
      )}
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
