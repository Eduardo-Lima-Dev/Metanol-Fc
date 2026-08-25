import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";

type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "metanol-fc-theme";
const DEFAULT_THEME: Theme = "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(THEME_STORAGE_KEY)
      .then((stored) => {
        setColorScheme(stored === "light" ? "light" : DEFAULT_THEME);
      })
      .finally(() => setIsHydrated(true));
  }, [setColorScheme]);

  const setTheme = (next: Theme) => {
    setColorScheme(next);
    SecureStore.setItemAsync(THEME_STORAGE_KEY, next).catch(() => {});
  };

  const theme: Theme = colorScheme === "light" ? "light" : "dark";

  if (!isHydrated) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return context;
}
