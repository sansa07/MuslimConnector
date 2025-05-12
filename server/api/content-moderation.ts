import { containsForbiddenWords, ContentModerationResult } from "@shared/forbidden-words";

/**
 * Gelişmiş yerel içerik denetimi
 * OpenAI API kullanmadan içerik denetimi yapar
 */
export async function moderateContent(content: string): Promise<ContentModerationResult> {
  // İçerik boş veya çok kısaysa muhtemelen güvenlidir
  if (!content || content.trim().length < 2) {
    return getDefaultResult();
  }

  // Yasaklı kelimeler listesi kontrolü
  const localCheck = containsForbiddenWords(content);
  if (localCheck.found) {
    return {
      toxic: 0.9,
      obscene: 0.3,
      hate: 0.7,
      threat: 0.5,
      harassment: 0.8,
      selfHarm: 0.1,
      extremism: 0.4,
      overall: 0.8,
      flagged: true,
      reason: `Uygunsuz içerik tespit edildi: ${localCheck.words.join(', ')}`
    };
  }
  
  // Ek düzenli ifadelerle içerik denetimi
  const result = analyzeContentWithRegex(content);
  if (result.flagged) {
    return result;
  }
  
  // Güvenli içerik
  return getDefaultResult();
}


/**
 * Daha karmaşık regex tabanlı içerik analizi
 */
function analyzeContentWithRegex(content: string): ContentModerationResult {
  // Temiz içerik için varsayılan sonuç
  const result: ContentModerationResult = getDefaultResult();
  
  // Küçük harfe çevir
  const lowerContent = content.toLowerCase();
  
  // Şiddet içeriği kontrol et
  const violencePatterns = [
    /öldür[a-z]*\b/,
    /katlet[a-z]*\b/,
    /vur[a-z]*\b/,
    /kır[a-z]*\b/,
    /parçala[a-z]*\b/,
    /vurabil[a-z]*\b/,
    /öldürebil[a-z]*\b/,
    /silah[a-z]*\b/,
    /bıçak[a-z]*\b/,
    /tabanca[a-z]*\b/,
    /tüfek[a-z]*\b/,
    /bomba[a-z]*\b/,
    /patlat[a-z]*\b/,
  ];
  
  // Cinsel içerik kontrol et
  const obscenePatterns = [
    /seks[a-z]*\b/,
    /cinsel[a-z]*\b/,
    /pornogra[a-z]*\b/,
    /erotik[a-z]*\b/,
    /sevişme[a-z]*\b/,
    /yatağa[a-z]*\b/,
    /çıplak[a-z]*\b/,
    /nud[a-z]*\b/,
  ];
  
  // Küfür/hakaret kontrol et (ek olarak)
  const toxicPatterns = [
    /salak[a-z]*\b/,
    /aptal[a-z]*\b/,
    /geri zekalı[a-z]*\b/,
    /ahmak[a-z]*\b/,
    /beyinsiz[a-z]*\b/,
    /enayi[a-z]*\b/,
    /karaktersiz[a-z]*\b/,
    /şerefsiz[a-z]*\b/,
    /şerefsiz[a-z]*\b/,
    /ahlaksız[a-z]*\b/,
  ];
  
  // Nefret söylemi kontrol et
  const hatePatterns = [
    /ırkçı[a-z]*\b/,
    /etnik[a-z]*\b/,
    /dışla[a-z]*\b/,
    /nefret[a-z]*\b/,
    /aşağıla[a-z]*\b/,
    /hor gör[a-z]*\b/,
    /aşağı [a-z]*\b/,
    /cahil[a-z]*\b/,
    /gerici[a-z]*\b/,
  ];
  
  // İntihar ve kendine zarar verme kontrol et
  const selfHarmPatterns = [
    /intihar[a-z]*\b/,
    /kendimi öldür[a-z]*\b/,
    /kendime zarar ver[a-z]*\b/,
    /canıma kıy[a-z]*\b/,
    /yaşamak istemi[a-z]*\b/,
    /kurtul[a-z]*\b/,
    /jilet[a-z]*\b/,
    /hap[a-z]*\b/,
    /acı çek[a-z]*\b/,
  ];
  
  // Şiddet kontrolü
  for (const pattern of violencePatterns) {
    if (pattern.test(lowerContent)) {
      result.threat += 0.3;
      result.extremism += 0.1;
    }
  }
  
  // Cinsel içerik kontrolü
  for (const pattern of obscenePatterns) {
    if (pattern.test(lowerContent)) {
      result.obscene += 0.3;
    }
  }
  
  // Küfür/hakaret kontrolü
  for (const pattern of toxicPatterns) {
    if (pattern.test(lowerContent)) {
      result.toxic += 0.3;
      result.harassment += 0.2;
    }
  }
  
  // Nefret söylemi kontrolü
  for (const pattern of hatePatterns) {
    if (pattern.test(lowerContent)) {
      result.hate += 0.3;
      result.extremism += 0.2;
    }
  }
  
  // İntihar ve kendine zarar kontrolü
  for (const pattern of selfHarmPatterns) {
    if (pattern.test(lowerContent)) {
      result.selfHarm += 0.5;
    }
  }
  
  // Üst üste tekrarlanan ünlem işaretleri (agresif içerik)
  if (/!{3,}/.test(content)) {
    result.toxic += 0.1;
    result.harassment += 0.1;
  }
  
  // Üst üste tekrarlanan büyük harfler (BAĞIRMA)
  if (/[A-ZĞÜŞİÖÇ]{5,}/.test(content)) {
    result.toxic += 0.1;
    result.harassment += 0.1;
  }
  
  // Overall puanı hesapla (tüm kategorilerin ortalaması)
  result.overall = (
    result.toxic + 
    result.obscene + 
    result.hate + 
    result.threat + 
    result.harassment + 
    result.selfHarm + 
    result.extremism
  ) / 7;
  
  // Eşik değeri 0.5'ten büyükse bayrak kaldır
  if (result.overall > 0.5 || 
      result.toxic > 0.6 || 
      result.obscene > 0.6 || 
      result.hate > 0.6 || 
      result.threat > 0.6 || 
      result.harassment > 0.6 || 
      result.selfHarm > 0.6 || 
      result.extremism > 0.6) {
    
    result.flagged = true;
    
    // En yüksek kategoriyi bul
    const categories = [
      { name: "küfür/hakaret", value: result.toxic },
      { name: "müstehcen içerik", value: result.obscene },
      { name: "nefret söylemi", value: result.hate },
      { name: "tehdit/şiddet", value: result.threat },
      { name: "taciz", value: result.harassment },
      { name: "kendine zarar verme", value: result.selfHarm },
      { name: "aşırılık/radikalizm", value: result.extremism },
    ];
    
    const highestCategory = categories.reduce((a, b) => a.value > b.value ? a : b);
    
    result.reason = `İçerik '${highestCategory.name}' kategorisinde uygunsuz bulundu.`;
  }
  
  return result;
}

/**
 * Varsayılan "güvenli" içerik denetimi sonucu döndürür
 */
function getDefaultResult(): ContentModerationResult {
  return {
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
}

/**
 * Determines if user should be warned or banned based on content and history
 */
export function determineAction(result: ContentModerationResult, userWarningCount: number): {
  action: 'none' | 'warn' | 'ban';
  reason: string;
} {
  if (!result.flagged) {
    return { action: 'none', reason: '' };
  }
  
  // Very severe content - automatic ban
  if (result.overall > 0.9 || 
      result.obscene > 0.8 || 
      result.extremism > 0.8 ||
      result.selfHarm > 0.9) {
    return { 
      action: 'ban', 
      reason: 'Platformun kullanım şartlarını ciddi şekilde ihlal eden içerik paylaşımı'
    };
  }
  
  // Escalating response based on warning count
  if (userWarningCount >= 3) {
    return { 
      action: 'ban', 
      reason: 'Mükerrer uyarılara rağmen uygunsuz içerik paylaşımı'
    };
  }
  
  if (result.overall > 0.6) {
    return { 
      action: 'warn', 
      reason: result.reason || 'Uygunsuz içerik tespiti'
    };
  }
  
  return { action: 'none', reason: '' };
}