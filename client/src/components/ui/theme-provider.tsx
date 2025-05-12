import { createContext, useContext, useEffect, useState } from "react";
import { IconMoon, IconSun, IconPlus } from "@/lib/icons";

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

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const themes = [
    { name: "light", label: "Açık Tema", icon: <IconMoon className="text-gray-600" /> },
    { name: "dark", label: "Koyu Tema", icon: <IconSun className="text-yellow-300" /> },
    { name: "islamic-green", label: "İslami Yeşil", color: "#1e8449" },
    { name: "islamic-gold", label: "İslami Altın", color: "#d4af37" },
    { name: "islamic-navy", label: "İslami Lacivert", color: "#143459" }
  ];
  
  // Geçerli tema için simgeyi döndür
  const getCurrentIcon = () => {
    const currentTheme = themes.find(t => t.name === theme) || themes[0];
    if (currentTheme.icon) return currentTheme.icon;
    if (currentTheme.color) return <div className="w-5 h-5 rounded-full" style={{ backgroundColor: currentTheme.color }} />;
    return <IconMoon className="text-gray-600" />;
  };
  
  return (
    <div className="relative group">
      <button 
        className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
      >
        {getCurrentIcon()}
      </button>
      
      <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded shadow-xl border border-gray-200 dark:border-gray-700 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
        <p className="px-4 pb-2 pt-1 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Tema Seçenekleri</p>
        
        {themes.map((t) => (
          <button 
            key={t.name}
            onClick={() => setTheme(t.name as Theme)}
            className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t.icon ? (
              t.icon
            ) : (
              <div 
                className="w-4 h-4 rounded-full mr-3" 
                style={{ backgroundColor: t.color }}
              />
            )}
            <span className="ml-3">{t.label}</span>
            {theme === t.name && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}