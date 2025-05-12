import { createContext, useContext, useEffect, useState } from "react";
import { IconMoon, IconSun } from "@/lib/icons";

type Theme = "dark" | "light" | "system" | "islamic-green" | "islamic-gold" | "islamic-navy";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Tüm tema sınıflarını kaldır
    root.classList.remove("light", "dark", "islamic-green", "islamic-gold", "islamic-navy");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    // Tema sınıfını ekle
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// useTheme export - önemli: useTheme'in export default veya named export oluşu değişmemelidir
export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // İslami temalar için gösterilen simgeler ve renkler
  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <IconSun className="text-yellow-300" />;
      case "islamic-green":
        return <div className="w-5 h-5 rounded-full bg-[#1e8449]" />;
      case "islamic-gold":
        return <div className="w-5 h-5 rounded-full bg-[#d4af37]" />;
      case "islamic-navy":
        return <div className="w-5 h-5 rounded-full bg-[#143459]" />;
      default:
        return <IconMoon className="text-gray-600" />;
    }
  };

  // Bir sonraki tema döngüsü
  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "islamic-green", "islamic-gold", "islamic-navy"];
    const currentIndex = themes.indexOf(theme === "system" ? "light" : theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      title="Temayı değiştir"
    >
      {getThemeIcon()}
    </button>
  );
}