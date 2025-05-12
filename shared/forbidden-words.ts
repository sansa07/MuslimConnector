// Bu liste, platformda izin verilmeyen kelimeleri içerir
// Türkçe küfür, hakaret ve uygunsuz içerikleri içeren bir listedir
// Bu liste içerik denetimi için kullanılacaktır

export const forbiddenWords = [
  // Küfürler
  "amına", "siktir", "piç", "orospu", "yavşak", "göt", "yarrak", "taşak", "amcık", "sik", "sikerim",
  
  // Hakaretler
  "geri zekalı", "mal", "gerizekalı", "aptal", "saftirik", "ahmak", "salak",
  
  // İslamofobik içerikler
  "terörist", "cihatçı", "yobaz", "müslüm*n ter*rist", "islam ter*r",
  
  // Nefret söylemi
  "arap uşağı", "ar*p", "k*rt", "kafir", "münafık", "gavur", "dinsiz", "imansız", "zındık",
  
  // Dinsel nefret
  "allah belanı", "din düşmanı", "din düşmanlığı", "dini değerlere hakaret", "kuran yakma",
  
  // Irkçılık ve ayrımcılık
  "ırkçılık", "ayrımcılık", "ırkçı", "ayrımcı", 
  
  // Cinsellik ve müstehcenlik
  "porno", "seks", "erotik", "cinsel ilişki", "mastürbasyon",
  
  // Şiddet
  "öldürmek", "katliam", "infaz", "cinayet", "kesmek", "kafa kesmek",
  
  // Uyuşturucu
  "esrar", "eroin", "kokain", "uyuşturucu", "hap", "extacy", "mdma", "lsd", "marihuana",
  
  // Diğer
  "pkk", "terör", "terör örgütü", "intihar", "intihar saldırısı", "intihar bombacısı", "canlı bomba",
  
  // İngilizce yaygın küfürler (uluslararası kullanıcılar için)
  "fuck", "shit", "bitch", "ass", "dick", "pussy", "asshole", "cunt", "motherfucker", "bastard",
  "whore", "slut", "retard", "faggot", "nigger", "nigga"
];

// Bu fonksiyon, belirli bir metinde yasaklı kelime olup olmadığını kontrol eder
export function containsForbiddenWords(text: string): { found: boolean; words: string[] } {
  const lowerText = text.toLowerCase();
  const foundWords: string[] = [];
  
  for (const word of forbiddenWords) {
    if (lowerText.includes(word.toLowerCase())) {
      foundWords.push(word);
    }
  }
  
  return {
    found: foundWords.length > 0,
    words: foundWords
  };
}

// Bu fonksiyon, içeriği OpenAI API kullanarak denetler
// Küfür, hakaret, şiddet, cinsellik, radikalleşme gibi içerikleri tespit eder
export function isContentAppropriate(text: string): Promise<{
  appropriate: boolean;
  categories: string[];
  reason: string;
  score: number;
}> {
  // Bu fonksiyon OpenAI API ile entegre edilecek
  // Şu anda sadece yasaklı kelimeler listesini kullanıyor
  const { found, words } = containsForbiddenWords(text);
  
  return Promise.resolve({
    appropriate: !found,
    categories: found ? ['toxic_content'] : [],
    reason: found ? `İçerik uygunsuz kelimeler içeriyor: ${words.join(', ')}` : '',
    score: found ? 0.9 : 0.1
  });
}

// İçerik puanlama sistemi (0-1 arası, yükseldikçe daha uygunsuz içerik)
export interface ContentModerationResult {
  toxic: number;      // Küfür, hakaret, tehdit
  obscene: number;    // Müstehcen, cinsel içerik
  hate: number;       // Nefret söylemi, ayrımcılık
  threat: number;     // Tehdit, şiddet
  harassment: number; // Taciz
  selfHarm: number;   // İntihar, kendine zarar verme
  extremism: number;  // Aşırıcılık, radikalleşme
  overall: number;    // Genel uygunsuzluk puanı
  flagged: boolean;   // İçerik bayraklandı mı?
  reason: string;     // Bayraklanma sebebi
}

// Bu fonksiyon daha ileri seviyede içerik denetimi sağlayacak (OpenAI API ile)
export async function analyzeContent(text: string): Promise<ContentModerationResult> {
  // Bu fonksiyon OpenAI API ile entegre edilecek
  // OpenAI'nin moderasyon API'si içeriği denetleyecek
  // Şu anlık basit bir denetim yapıyor
  const { found, words } = containsForbiddenWords(text);
  
  const defaultResult: ContentModerationResult = {
    toxic: 0,
    obscene: 0,
    hate: 0,
    threat: 0,
    harassment: 0,
    selfHarm: 0,
    extremism: 0,
    overall: 0,
    flagged: false,
    reason: ''
  };
  
  if (found) {
    return {
      ...defaultResult,
      toxic: 0.9,
      overall: 0.7,
      flagged: true,
      reason: `İçerik uygunsuz kelimeler içeriyor: ${words.join(', ')}`
    };
  }
  
  return defaultResult;
}