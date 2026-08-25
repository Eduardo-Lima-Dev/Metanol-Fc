const DEFAULT_API_URL = "http://localhost:3338/api";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
