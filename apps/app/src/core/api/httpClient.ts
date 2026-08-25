import { API_URL } from "./config";
import { ApiError } from "./apiError";
import { secureTokenStorage } from "../auth/secureTokenStorage";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("message" in data)) return undefined;
  const { message } = data as { message: unknown };
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  return undefined;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await secureTokenStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const data: unknown = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(data) ?? "Não foi possível completar a operação.");
  }

  return data as T;
}

async function uploadFile<T>(path: string, formData: FormData): Promise<T> {
  const token = await secureTokenStorage.get();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const data: unknown = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(data) ?? "Não foi possível completar a operação.");
  }

  return data as T;
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, options?: { auth?: boolean }) =>
    request<T>(path, { method: "POST", body, ...options }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  uploadFile,
};
