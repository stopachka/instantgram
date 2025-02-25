import type { AuthState } from "@instantdb/react";
import clientDB from "./clientDB";

export default function useAnonAuth(): AuthState {
  return clientDB.useAuth();
}
