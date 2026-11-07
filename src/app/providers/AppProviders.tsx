import React from 'react';
import QueryProvider from './QueryProvider';
import AuthProvider from './AuthProvider';
import { ThemeProvider } from '../../context/ThemeContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { ToastProvider } from '../../context/ToastContext';
import { ChatDockProvider } from '../../context/ChatDockContext';

export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <ChatDockProvider>
                {children}
              </ChatDockProvider>
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryProvider>
  );
};

export default AppProviders;

