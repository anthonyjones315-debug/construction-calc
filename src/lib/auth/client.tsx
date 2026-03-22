"use client";

import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession, SessionStatus } from "@/lib/auth/session";

type SessionContextValue = {
  data: AuthSession;
  status: SessionStatus;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function buildFallbackSession(params: {
  clerkUserId: string;
  email: string | null;
  name: string | null;
  image: string | null;
}): AuthSession {
  return {
    user: {
      id: params.clerkUserId,
      clerkUserId: params.clerkUserId,
      email: params.email,
      name: params.name,
      image: params.image,
      business_id: null,
      role: "none",
    },
  };
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState<AuthSession>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  const getFallbackSession = useCallback((): AuthSession => {
    if (!user || !userId) {
      return null;
    }

    return buildFallbackSession({
      clerkUserId: userId,
      email: user.primaryEmailAddress?.emailAddress ?? null,
      name: user.fullName ?? user.username ?? null,
      image: user.imageUrl ?? null,
    });
  }, [user, userId]);

  const refresh = useCallback(async () => {
    if (!isLoaded) {
      setStatus("loading");
      return;
    }

    if (!userId) {
      setData(null);
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Session request failed (${response.status})`);
      }

      const session = (await response.json()) as AuthSession;

      if (session?.user?.id) {
        setData(session);
        setStatus("authenticated");
        return;
      }

      const fallbackSession = getFallbackSession();
      setData(fallbackSession);
      setStatus(fallbackSession ? "authenticated" : "unauthenticated");
    } catch {
      const fallbackSession = getFallbackSession();
      setData(fallbackSession);
      setStatus(fallbackSession ? "authenticated" : "unauthenticated");
    }
  }, [getFallbackSession, isLoaded, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ data, status, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside AuthSessionProvider.");
  }

  return context;
}

export function useSignOut() {
  const clerk = useClerk();

  return async (options?: { callbackUrl?: string }) => {
    await clerk.signOut({ redirectUrl: options?.callbackUrl ?? "/" });
  };
}
