"use client";

import useAnonAuth from "@/useAnonAuth";
import React from "react";

export default function App() {
  const { isLoading, error, user } = useAnonAuth();
  if (isLoading) return;
  if (error) return <ErrorScreen error={error} />;

  return <div>{JSON.stringify(user, null, 2)}</div>;
}

function ErrorScreen({ error }: { error: { message: string } }) {
  return <div>{error.message}</div>;
}
