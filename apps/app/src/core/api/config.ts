const DEFAULT_API_URL = "http://localhost:3338/api";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

// Origem sem o /api — usada pra montar links "públicos" servidos fora do
// prefixo da API, como a página de convite (/join/:inviteCode).
export const WEB_URL = API_URL.replace(/\/api\/?$/, "");
