"use client";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

// Create a simple store with no reducers for now
const store = configureStore({
  reducer: {
    // We'll add reducers here when needed
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Provider store={store}>{children}</Provider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
