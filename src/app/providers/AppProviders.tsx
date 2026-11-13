import React from "react";
import ApolloProvider from "./ApolloProvider";
import QueryProvider from "./QueryProvider";
import AuthProvider from "./AuthProvider";
import { ThemeProvider } from "../../context/ThemeContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { ToastProvider } from "../../context/ToastContext";
import { ChatDockProvider } from "../../context/ChatDockContext";
import { UploadProvider } from "../../context/UploadContext";

export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ApolloProvider>
      <QueryProvider>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <ToastProvider>
                <ChatDockProvider>
                  <UploadProvider>{children}</UploadProvider>
                </ChatDockProvider>
              </ToastProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryProvider>
    </ApolloProvider>
  );
};

export default AppProviders;
