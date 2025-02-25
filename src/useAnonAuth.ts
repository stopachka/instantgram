/**
 * This hook is used to get or create an anonymous user.
 *
 * In most apps, you would use the `db.useAuth` hook directly.
 */
import { User } from "@instantdb/react";
import clientDB from "./clientDB";
import { useEffect, useState } from "react";

const initPromise = clientDB.getAuth().then(async (user) => {
  if (user) return user;
  const { refresh_token } = await createAnonUser();
  return clientDB.auth.signInWithToken(refresh_token);
});

type AnonState =
  | { isLoading: true; error: undefined; user: undefined }
  | { isLoading: false; error: { message: string }; user: undefined }
  | { isLoading: false; error: undefined; user: User };

type InitState =
  | { isLoading: true; error: undefined }
  | { isLoading: false; error: { message: string } }
  | { isLoading: false; error: undefined };

export default function useAnonAuth(): AnonState {
  const authState = clientDB.useAuth();
  const [initState, setInitState] = useState<InitState>({
    isLoading: true,
    error: undefined,
  });
  useEffect(() => {
    let isMounted = true;
    initPromise
      .then(
        () => ({ isLoading: false as const, error: undefined }),
        (error) => ({
          isLoading: false as const,
          error: { message: error?.message as string },
        })
      )
      .then((state: InitState) => {
        if (isMounted) {
          setInitState(state);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (initState.isLoading || initState.error) {
    return { ...initState, user: undefined };
  }
  if (authState.isLoading || authState.error) {
    return authState;
  }

  return { isLoading: false, error: undefined, user: authState.user! };
}

async function createAnonUser(): Promise<{ refresh_token: string }> {
  const res = await fetch("/api/create-user", { method: "POST" });
  const json = await res.json();
  return json;
}
