import { useTranslation as useI18nTranslation } from 'react-i18next';

// Bu hook, eksik çeviriler olduğunda hata oluşmasını önlemek için varsayılan bir değer sağlar
export function useTranslation() {
  const { t: originalT, i18n } = useI18nTranslation();
  
  // Özel t fonksiyonu oluştur
  const t = (key: string, options?: any): string => {
    const translation = originalT(key, options);
    
    // Eğer çeviri bulunamazsa (i18next anahtarı döndürürse) varsayılan değeri döndür
    if (translation === key) {
      // Örneğin: 'nav.home' -> 'Home'
      const defaultValue = key.split('.').pop() || key;
      return defaultValue.charAt(0).toUpperCase() + defaultValue.slice(1);
    }
    
    return translation as string;
  };
  
  return { t, i18n };
}