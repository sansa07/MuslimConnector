import { QuranVerse, Hadith, IslamicStory, DailyDua } from "@shared/schema";

export function getDailyVerseForDay(day: number): Promise<QuranVerse> {
  // 365 gün için farklı ayetler
  const dayIndex = (day % 365) + 1;
  
  return Promise.resolve({
    id: dayIndex,
    surah: ((dayIndex % 114) || 114), // 1-114 arası (Kuran'da 114 sure var)
    ayah: ((dayIndex % 10) || 1), // Örnek olarak 1-10 ayet numaraları
    arabicText: getArabicVerseForDay(dayIndex),
    translation: getTurkishVerseForDay(dayIndex),
    surahName: getSurahNameForNumber((dayIndex % 114) || 114),
  });
}

export function getDailyHadithForDay(day: number): Promise<Hadith> {
  // 365 gün için farklı hadisler
  const dayIndex = (day % 365) + 1;
  
  return Promise.resolve({
    id: dayIndex,
    text: getHadithTextForDay(dayIndex),
    narrator: getHadithNarratorForDay(dayIndex),
    source: getHadithSourceForDay(dayIndex),
  });
}

export function getDailyDuaForDay(day: number): Promise<DailyDua> {
  // 365 gün için farklı dualar
  const dayIndex = (day % 365) + 1;
  
  return Promise.resolve({
    id: dayIndex,
    arabicText: getArabicDuaForDay(dayIndex),
    translation: getTurkishDuaForDay(dayIndex),
    source: getDuaSourceForDay(dayIndex),
  });
}

export function getDailyStoryForDay(day: number): Promise<IslamicStory> {
  // 365 gün için farklı kıssalar
  const dayIndex = (day % 365) + 1;
  
  return Promise.resolve({
    id: dayIndex,
    title: getStoryTitleForDay(dayIndex),
    content: getStoryContentForDay(dayIndex),
    source: getStorySourceForDay(dayIndex),
    reference: getStoryReferenceForDay(dayIndex),
  });
}

// Helper fonksiyonlar - Gerçek verilerin geleceği yerler
// Gerçek veri tabanından veya API'dan gelecek bu veriler şimdilik örnek olarak eklenmiştir

function getArabicVerseForDay(day: number): string {
  const verses = [
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", // 1
    "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", // 2
    "الرَّحْمَٰنِ الرَّحِيمِ", // 3
    "مَالِكِ يَوْمِ الدِّينِ", // 4
    "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", // 5
    "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ", // 6
    "وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ", // 7
    "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", // 8
    "إِنَّ مَعَ الْعُسْرِ يُسْرًا", // 9
    "قُلْ هُوَ اللَّهُ أَحَدٌ", // 10
  ];
  
  return verses[(day - 1) % verses.length];
}

function getTurkishVerseForDay(day: number): string {
  const translations = [
    "Rahman ve Rahim olan Allah'ın adıyla", // 1
    "Hamd, Alemlerin Rabbi Allah'a mahsustur", // 2
    "O, Rahman'dır, Rahim'dir", // 3
    "Din (hesap) gününün malikidir", // 4
    "Ancak sana ibadet eder ve ancak senden yardım dileriz", // 5
    "Şüphesiz, biz onu (Kur'an'ı) Kadir gecesinde indirdik", // 6
    "Kadir gecesinin ne olduğunu sen ne bileceksin?", // 7
    "Şüphesiz güçlükle beraber bir kolaylık vardır", // 8
    "Gerçekten, güçlükle beraber bir kolaylık daha vardır", // 9
    "De ki: O, Allah'tır, bir tektir", // 10
  ];
  
  return translations[(day - 1) % translations.length];
}

function getSurahNameForNumber(surahNumber: number): string {
  const surahNames = [
    "Fatiha", "Bakara", "Âl-i İmran", "Nisa", "Maide", "En'am", "A'raf", "Enfal", "Tevbe", "Yunus",
    // Tüm sure isimleri...
  ];
  
  return `Surah ${surahNumber}${surahNumber <= surahNames.length ? ': ' + surahNames[surahNumber - 1] : ''}`;
}

function getHadithTextForDay(day: number): string {
  const hadithTexts = [
    "İslam beş esas üzerine bina edilmiştir: Allah'tan başka ilah olmadığına ve Muhammed'in Allah'ın Rasûlü olduğuna şehadet etmek, namaz kılmak, zekat vermek, Ramazan orucunu tutmak ve gücü yetenlerin hac ibadetini yapması.",
    "Ameller (başka değil) ancak niyetlere göredir ve herkes için niyet ettiğinin karşılığı vardır.",
    "Müslüman, müslümanların elinden ve dilinden güvende olduğu kimsedir.",
    "Hiçbiriniz, kendisi için istediğini (din) kardeşi için de istemedikçe (gerçek) iman etmiş olmaz.",
    "Hayâ imandandır.",
    "Güzel söz sadakadır.",
    "Güçlü kimse, (güreşte rakiplerini yenen) pehlivan değildir. Hakiki pehlivan öfke anında kendisine hâkim olandır.",
    "İnsanlar altın ve gümüş madenleri gibi madenlerdir.",
    "Bir işi sağlam yapmak, Allah'ın sevgisini kazandırır.",
    "Kolaylaştırın, zorlaştırmayın. Müjdeleyin, nefret ettirmeyin.",
  ];
  
  return hadithTexts[(day - 1) % hadithTexts.length];
}

function getHadithNarratorForDay(day: number): string {
  const narrators = [
    "Ebu Hureyre (r.a.)", "Ömer bin Hattab (r.a.)", "Abdullah bin Ömer (r.a.)", "Aişe (r.a.)",
    "Ali bin Ebu Talib (r.a.)", "Enes bin Malik (r.a.)", "Ebu Said el-Hudri (r.a.)",
    "Ebubekir (r.a.)", "Cabir bin Abdullah (r.a.)", "Ebu Zer Gıfari (r.a.)",
  ];
  
  return narrators[(day - 1) % narrators.length];
}

function getHadithSourceForDay(day: number): string {
  const sources = [
    "Buhari ve Müslim", "Müslim", "Buhari", "Ebu Davud", "Tirmizi", "Nesai", "İbn Mace",
    "Ahmed bin Hanbel", "Malik", "Hakim", "Beyhaki", "Taberani",
  ];
  
  return sources[(day - 1) % sources.length];
}

function getArabicDuaForDay(day: number): string {
  const arabicDuas = [
    "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    "اللَّهُمَّ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ",
    "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
  ];
  
  return arabicDuas[(day - 1) % arabicDuas.length];
}

function getTurkishDuaForDay(day: number): string {
  const turkishDuas = [
    "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver. Ve bizi cehennem azabından koru.",
    "Allah'ım! Senden hidayet, takva, iffet ve gönül zenginliği istiyorum.",
    "Rabbim! Göğsümü genişlet ve işimi kolaylaştır.",
    "Allah'ım! Kederden, üzüntüden, acizlikten, tembellikten, cimrilikten, korkaklıktan, borç yükünden ve insanların baskısından sana sığınırım.",
    "Rabbim! Hesap gününde beni, anne-babamı ve tüm müminleri bağışla.",
    "Allah'ım, Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver. Ve bizi cehennem azabından koru.",
    "Rabbimiz! Bizi doğru yola ilettikten sonra kalplerimizi eğriltme. Bize katından rahmet bağışla. Şüphesiz sen çok bağışlayansın.",
    "Allah bize yeter. O ne güzel vekildir.",
    "Allah'ım! İbrahim'e ve İbrahim'in ailesine salat ettiğin gibi, Muhammed'e ve Muhammed'in ailesine de salat et. Şüphesiz sen övülmeye layıksın, şan ve şeref sahibisin.",
    "Senden başka ilah yoktur. Seni tenzih ederim. Gerçekten ben zalimlerden oldum.",
  ];
  
  return turkishDuas[(day - 1) % turkishDuas.length];
}

function getDuaSourceForDay(day: number): string {
  const duaSources = [
    "Bakara Suresi, 201. Ayet", "Müslim", "Taha Suresi, 25-26. Ayetler", "Buhari", 
    "İbrahim Suresi, 41. Ayet", "Bakara Suresi, 201. Ayet", "Âl-i İmran Suresi, 8. Ayet",
    "Âl-i İmran Suresi, 173. Ayet", "Buhari ve Müslim", "Enbiya Suresi, 87. Ayet",
  ];
  
  return duaSources[(day - 1) % duaSources.length];
}

function getStoryTitleForDay(day: number): string {
  const storyTitles = [
    "Hz. İbrahim'in Ateşe Atılması",
    "Hz. Musa ve Hızır'ın Yolculuğu",
    "Hz. Yusuf'un Kuyuya Atılması",
    "Hz. Yunus'un Balığın Karnında Geçirdiği Günler",
    "Hz. Eyüp'ün Sabrı",
    "Hz. Lokman'ın Hikmetleri",
    "Hz. Süleyman ve Karınca",
    "Ashab-ı Kehf (Mağara Arkadaşları)",
    "Hz. Nuh'un Gemisi",
    "Hz. Muhammed'in Hira Mağarası'ndaki İlk Vahiy",
  ];
  
  return storyTitles[(day - 1) % storyTitles.length];
}

function getStoryContentForDay(day: number): string {
  const storyContents = [
    "Nemrut, ateşe tapan halkını Hz. İbrahim'in tek Allah inancına karşı kışkırttı. Hz. İbrahim, putları kırdığı için büyük bir ateşe atıldı. Ancak Allah, ateşe 'Serin ve esenlik ol' dedi ve İbrahim'e zarar vermedi.",
    "Hz. Musa, ilim öğrenmek için Hızır ile yolculuğa çıktı. Yolda Hızır'ın yaptığı görünüşte anlamsız işlerin arkasındaki hikmeti ancak sabırla öğrenebildi.",
    "Kardeşleri tarafından kıskanılan Hz. Yusuf bir kuyuya atıldı. Bu olay onun Mısır'a köle olarak satılmasına ve sonunda Mısır'ın hazinelerinden sorumlu vezir olmasına giden yolun başlangıcıydı.",
    "Hz. Yunus, kavminden umudunu kesip ayrıldıktan sonra bindiği gemi fırtınaya yakalandı. Kura çekilerek denize atıldı ve bir balık tarafından yutuldu. Balığın karnında Allah'a dua ederek pişmanlığını dile getirdi.",
    "Hz. Eyüp, sahip olduğu her şeyi ve sağlığını kaybetmesine rağmen sabırla Allah'a ibadet etmeye devam etti. Bu sabrı sonunda Allah'ın merhametiyle ödüllendirildi.",
    "Hz. Lokman oğluna verdiği öğütlerde Allah'a ortak koşmaması, ana-babasına iyi davranması, az da olsa iyilik yapması ve insanlara karşı kibirli olmaması gerektiğini söyledi.",
    "Hz. Süleyman bir gün ordusuyla yürürken bir karıncanın diğer karıncalara 'Yuvalarınıza girin, Süleyman ve ordusu farkında olmadan sizi ezmesin' dediğini duydu. Karıncanın bu sözüne güldü ve Allah'a şükretti.",
    "İnançları nedeniyle zulüm gören yedi genç, bir mağaraya sığınıp uyudular. Allah onları korumak için uzun yıllar uyuttu. Uyandıklarında şehirde artık inananların çoğunlukta olduğunu gördüler.",
    "Hz. Nuh, kavmine uzun yıllar Allah'ın varlığını ve birliğini anlattı. İnanmayanlar için büyük bir tufan geldi. Hz. Nuh, Allah'ın emriyle inşa ettiği gemiye inananları ve her canlıdan bir çift aldı.",
    "Hz. Muhammed, Hira Mağarası'nda ibadet ederken Cebrail tarafından ziyaret edildi ve ilk vahiy olan 'Oku' emrini aldı. Bu an, İslam'ın başlangıcı oldu.",
  ];
  
  return storyContents[(day - 1) % storyContents.length];
}

function getStorySourceForDay(day: number): string {
  const storySources = [
    "Enbiya Suresi", "Kehf Suresi", "Yusuf Suresi", "Saffat Suresi", "Enbiya Suresi",
    "Lokman Suresi", "Neml Suresi", "Kehf Suresi", "Hud Suresi", "Alak Suresi",
  ];
  
  return storySources[(day - 1) % storySources.length];
}

function getStoryReferenceForDay(day: number): string {
  const storyReferences = [
    "Ayetler 51-70", "Ayetler 60-82", "Ayetler 7-18", "Ayetler 139-148", "Ayetler 83-84",
    "Ayetler 12-19", "Ayetler 15-19", "Ayetler 9-26", "Ayetler 25-48", "Ayetler 1-5",
  ];
  
  return storyReferences[(day - 1) % storyReferences.length];
}

// Bugünün gününü hesaplayan fonksiyon
export function getCurrentDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}