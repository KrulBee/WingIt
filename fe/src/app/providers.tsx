"use client";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { checkAndCacheCurrentUserAdminStatus } from "@/utils/adminUtils";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

// Create a simple store with a dummy reducer to prevent the combineReducers error
const dummyReducer = (state = {}, action: any) => state;

const store = configureStore({
  reducer: {
    dummy: dummyReducer,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize admin cache on app startup
  useEffect(() => {
    // Check current user's admin status and cache it
    checkAndCacheCurrentUserAdminStatus().catch(() => {
      // Silently fail - user is not admin or not logged in
    });
  }, []);
  return (
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Provider store={store}>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </Provider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
