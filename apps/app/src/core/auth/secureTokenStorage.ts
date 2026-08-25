import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "metanol-fc-token";

export const secureTokenStorage = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};
