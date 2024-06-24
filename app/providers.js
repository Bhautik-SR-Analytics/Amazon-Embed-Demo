"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { AppContextWrapper } from "@/utils/appcontext";

function Provider({ children }) {
  return (
    <SessionProvider>
      <AppContextWrapper>{children}</AppContextWrapper>
    </SessionProvider>
  );
}

export default Provider;
