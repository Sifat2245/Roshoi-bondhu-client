import React from "react";
import ApolloProvider from "./ApolloProvider";
import QueryProvider from "./QueryProvider";
import AuthProvider from "./AuthProvider";
import { ThemeProvider } from "../../context/ThemeContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { ToastProvider } from "../../context/ToastContext";
import { SocketProvider } from "../../context/SocketContext";
import { NotificationProvider } from "../../context/NotificationContext";
import { ChatDockProvider } from "../../context/ChatDockContext";
import { UploadProvider } from "../../context/UploadContext";
import NotificationPopupDock from "../../features/notifications/components/NotificationPopupDock";

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
                <SocketProvider>
                  <NotificationProvider>
                    <ChatDockProvider>
                      <UploadProvider>
                        {children}
                        <NotificationPopupDock />
                      </UploadProvider>
                    </ChatDockProvider>
                  </NotificationProvider>
                </SocketProvider>
              </ToastProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryProvider>
    </ApolloProvider>
  );
};

export default AppProviders;
