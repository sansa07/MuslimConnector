import { useTheme } from "@/components/ui/theme-provider";
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation-with-defaults";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
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