import React, { useEffect, useState, useCallback, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  apiFetch,
  setAccessToken,
  clearLegacyStorage,
} from "../lib/api/client";
import { AuthContext, type RegisterData } from "./auth-context";
import type { AuthUser } from "./auth-types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await apiFetch<AuthUser>("/auth/me");
      setUser(me);
      clearLegacyStorage();
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const saved = sessionStorage.getItem("asnafi_access_token");
      if (saved) {
        setAccessToken(saved);
        await refreshUser();
      }
      setIsLoading(false);
    };
    init();
  }, [refreshUser]);

  const applyAuthResponse = (res: { accessToken: string; user: AuthUser }) => {
    queryClient.clear();

    setAccessToken(res.accessToken);
    setUser(res.user);
    clearLegacyStorage();

    return res.user;
  };

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    return applyAuthResponse(res);
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>(
      "/auth/admin/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    return applyAuthResponse(res);
  };

  const requestRegistrationOtp = async (data: RegisterData) => {
    return apiFetch<{ message: string; email: string }>(
      "/auth/register/request-otp",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  };

  const verifyRegistrationOtp = async (email: string, code: string) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>(
      "/auth/register/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({ email, code }),
      },
    );
    return applyAuthResponse(res);
  };

  const resendRegistrationOtp = async (email: string) => {
    await apiFetch("/auth/register/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }

    setAccessToken(null);
    setUser(null);

    // Remove all cached data from the previous user
    queryClient.clear();
  };

  const setTokenAndLoadUser = async (token: string) => {
    setAccessToken(token);
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        adminLogin,
        requestRegistrationOtp,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        logout,
        refreshUser,
        setTokenAndLoadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export type { AuthUser } from "./auth-types";
export { useAuth, useHasSubscription, useEffectivePlanId } from "./useAuth";
