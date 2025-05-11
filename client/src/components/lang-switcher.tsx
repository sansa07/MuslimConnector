import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { availableLanguages } from '@/i18n';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    
    // If switching to Arabic or from Arabic, we need to update the document direction
    const isRtl = lng === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    
    // Update language in localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  // Get current language information
  const currentLang = availableLanguages.find(lang => lang.code === i18n.language) || availableLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('settings.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? "bg-muted" : ""}
          >
            <div className="flex items-center">
              <span className="mr-2">{language.nativeName}</span>
              {language.code === currentLang.code && (
                <span className="ml-auto text-primary text-xs">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}