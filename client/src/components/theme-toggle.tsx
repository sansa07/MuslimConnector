import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation-with-defaults";

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

    // İslami temaları özel olarak işle
    if (theme.startsWith("islamic-")) {
      // Temel aydınlık/karanlık mod için
      const baseTheme = theme.includes("navy") ? "dark" : "light";
      root.classList.add(baseTheme);
    }
    
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
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-gray-100 dark:hover:bg-navy"
        >
          {theme === "light" && (
            <Sun className="h-5 w-5 text-gray-600" />
          )}
          {theme === "dark" && (
            <Moon className="h-5 w-5 text-yellow-300" />
          )}
          {theme === "islamic-green" && (
            <Palette className="h-5 w-5 text-green-600" />
          )}
          {theme === "islamic-gold" && (
            <Palette className="h-5 w-5 text-yellow-500" />
          )}
          {theme === "islamic-navy" && (
            <Palette className="h-5 w-5 text-blue-800" />
          )}
          {theme === "system" && (
            <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
          <span className="sr-only">{t('themes.themeOptions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>{t('themes.light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>{t('themes.dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("islamic-green")}>
          <Palette className="mr-2 h-4 w-4 text-green-600" />
          <span>{t('themes.islamicGreen')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("islamic-gold")}>
          <Palette className="mr-2 h-4 w-4 text-yellow-500" />
          <span>{t('themes.islamicGold')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("islamic-navy")}>
          <Palette className="mr-2 h-4 w-4 text-blue-800" />
          <span>{t('themes.islamicNavy')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Palette className="mr-2 h-4 w-4" />
          <span>{t('themes.system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
