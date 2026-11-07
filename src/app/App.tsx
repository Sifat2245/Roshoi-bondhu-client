import React, { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './router/index';
import AppProviders from './providers/AppProviders';
import SplashScreen from '../components/common/SplashScreen';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen duration={1200} onFinish={() => setShowSplash(false)} />
      )}
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </>
  );
};

export default App;

