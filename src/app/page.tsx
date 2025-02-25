"use client";

import useAnonAuth from "@/useAnonAuth";
import React from "react";

export default function App() {
  const authState = useAnonAuth();
  return <div>{JSON.stringify(authState, null, 2)}</div>;
}
