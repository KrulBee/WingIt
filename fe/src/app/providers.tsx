"use client";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

// Create a simple store with a dummy reducer to prevent the combineReducers error
const dummyReducer = (state = {}, action: any) => state;

const store = configureStore({
  reducer: {
    dummy: dummyReducer,
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
