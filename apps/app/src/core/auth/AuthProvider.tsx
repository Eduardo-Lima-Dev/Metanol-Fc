import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { LoginInput, RegisterUserInput, User } from "@metanol/shared";
import { httpClient } from "../api/httpClient";
import { endpoints } from "../api/endpoints";
import { secureTokenStorage } from "./secureTokenStorage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterUserInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const loadSession = useCallback(async () => {
    const token = await secureTokenStorage.get();
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const me = await httpClient.get<User>(endpoints.users.me);
      setUser(me);
      setStatus("authenticated");
    } catch {
      await secureTokenStorage.clear();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await httpClient.post<{ token: string }>(endpoints.auth.login, input, {
        auth: false,
      });
      await secureTokenStorage.set(response.token);
      await loadSession();
    },
    [loadSession],
  );

  const register = useCallback(async (input: RegisterUserInput) => {
    await httpClient.post(endpoints.auth.register, input, { auth: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await httpClient.post(endpoints.auth.logout);
    } catch {
      // mesmo se a chamada falhar (ex.: sem rede), a sessão local é encerrada
    }
    await secureTokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, refreshUser: loadSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
