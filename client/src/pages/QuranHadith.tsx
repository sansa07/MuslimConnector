import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconSearch, IconQuran, IconBook } from "@/lib/icons";
import IslamicBorder from "@/components/shared/IslamicBorder";

const QuranHadith = () => {
  const [quranSearchQuery, setQuranSearchQuery] = useState("");
  const [hadithSearchQuery, setHadithSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState("");
  const [selectedHadithBook, setSelectedHadithBook] = useState("");
  
  const { data: surahs, isLoading: surahsLoading } = useQuery({
    queryKey: ["/api/quran/surahs"],
  });
  
  const { data: hadithBooks, isLoading: hadithBooksLoading } = useQuery({
    queryKey: ["/api/hadith/books"],
  });
  
  const { data: quranVerses, isLoading: quranVersesLoading } = useQuery({
    queryKey: ["/api/quran/search", quranSearchQuery, selectedSurah],
    enabled: quranSearchQuery.length > 2 || !!selectedSurah,
  });
  
  const { data: hadithResults, isLoading: hadithResultsLoading } = useQuery({
    queryKey: ["/api/hadith/search", hadithSearchQuery, selectedHadithBook],
    enabled: hadithSearchQuery.length > 2 || !!selectedHadithBook,
  });
  
  const { data: randomVerse } = useQuery({
    queryKey: ["/api/quran/random"],
  });
  
  const { data: randomHadith } = useQuery({
    queryKey: ["/api/hadith/random"],
  });

  const handleQuranSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already triggered by the query hook
  };

  const handleHadithSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already triggered by the query hook
  };

  return (
    <>
      <div className="mb-6">
        <title>Kuran & Hadisler - MüslimNet</title>
        <meta name="description" content="Kuran-ı Kerim ayetleri ve Hadis-i Şerifler. Arama yapabilir, sure ve ayetleri okuyabilirsiniz." />
      </div>
      
      <Tabs defaultValue="quran">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="quran" className="flex-1 flex items-center">
            <IconQuran className="mr-2" /> Kuran-ı Kerim
          </TabsTrigger>
          <TabsTrigger value="hadith" className="flex-1 flex items-center">
            <IconBook className="mr-2" /> Hadisler
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="quran">
          <IslamicBorder className="mb-6">
            <div className="p-5">
              <h2 className="font-amiri text-lg font-bold mb-3">Kuran-ı Kerim Arama</h2>
              <div className="space-y-4">
                <form onSubmit={handleQuranSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Ayet ara..."
                      value={quranSearchQuery}
                      onChange={(e) => setQuranSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sure seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tüm Sureler</SelectItem>
                        {!surahsLoading && surahs?.map((surah: any) => (
                          <SelectItem key={surah.id} value={surah.id.toString()}>
                            {surah.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </div>
            </div>
          </IslamicBorder>
          
          {/* Random Verse Display */}
          {!quranSearchQuery && !selectedSurah && randomVerse && (
            <IslamicBorder>
              <div className="p-5">
                <h2 className="font-amiri text-lg font-bold mb-3">Rastgele Ayet</h2>
                <div className="text-center py-4">
                  <p className="font-amiri text-xl leading-relaxed mb-2 arabic-text text-navy-dark dark:text-gray-200">
                    {randomVerse.arabic}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {randomVerse.translation}
                  </p>
                  <p className="text-sm text-primary dark:text-primary-light">
                    {randomVerse.reference}
                  </p>
                </div>
              </div>
            </IslamicBorder>
          )}
          
          {/* Search Results */}
          {(quranSearchQuery || selectedSurah) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Arama Sonuçları {quranVersesLoading ? "(Yükleniyor...)" : quranVerses ? `(${quranVerses.length})` : ""}
              </h3>
              
              {quranVersesLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 mb-4 rounded-lg" />
                ))
              ) : quranVerses?.length > 0 ? (
                quranVerses.map((verse: any, index: number) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-5">
                      <div className="mb-2">
                        <span className="text-xs bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full">
                          {verse.reference}
                        </span>
                      </div>
                      <p className="font-amiri text-lg leading-relaxed mb-2 arabic-text text-navy-dark dark:text-gray-200">
                        {verse.arabic}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {verse.translation}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Arama kriterlerinize uygun ayet bulunamadı.
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="hadith">
          <IslamicBorder className="mb-6">
            <div className="p-5">
              <h2 className="font-amiri text-lg font-bold mb-3">Hadis Arama</h2>
              <div className="space-y-4">
                <form onSubmit={handleHadithSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Hadis ara..."
                      value={hadithSearchQuery}
                      onChange={(e) => setHadithSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <Select value={selectedHadithBook} onValueChange={setSelectedHadithBook}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hadis kitabı seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tüm Kitaplar</SelectItem>
                        {!hadithBooksLoading && hadithBooks?.map((book: any) => (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {book.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </div>
            </div>
          </IslamicBorder>
          
          {/* Random Hadith Display */}
          {!hadithSearchQuery && !selectedHadithBook && randomHadith && (
            <IslamicBorder>
              <div className="p-5">
                <h2 className="font-amiri text-lg font-bold mb-3">Rastgele Hadis</h2>
                <div className="text-center py-4">
                  <p className="font-amiri text-xl leading-relaxed mb-2 arabic-text text-navy-dark dark:text-gray-200">
                    {randomHadith.arabic}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {randomHadith.translation}
                  </p>
                  <p className="text-sm text-primary dark:text-primary-light">
                    {randomHadith.source}
                  </p>
                </div>
              </div>
            </IslamicBorder>
          )}
          
          {/* Hadith Search Results */}
          {(hadithSearchQuery || selectedHadithBook) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Arama Sonuçları {hadithResultsLoading ? "(Yükleniyor...)" : hadithResults ? `(${hadithResults.length})` : ""}
              </h3>
              
              {hadithResultsLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 mb-4 rounded-lg" />
                ))
              ) : hadithResults?.length > 0 ? (
                hadithResults.map((hadith: any, index: number) => (
                  <Card key={index} className="mb-4">
                    <CardContent className="p-5">
                      <div className="mb-2">
                        <span className="text-xs bg-gold bg-opacity-10 text-gold px-2 py-1 rounded-full">
                          {hadith.source}
                        </span>
                      </div>
                      {hadith.arabic && (
                        <p className="font-amiri text-lg leading-relaxed mb-2 arabic-text text-navy-dark dark:text-gray-200">
                          {hadith.arabic}
                        </p>
                      )}
                      <p className="text-gray-700 dark:text-gray-300">
                        {hadith.translation}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Arama kriterlerinize uygun hadis bulunamadı.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default QuranHadith;
