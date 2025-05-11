import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, BookOpen, Quote, RefreshCw, Search } from "lucide-react";

export default function Quran() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurah, setSelectedSurah] = useState("");
  
  // Fetch daily verse
  const { 
    data: dailyVerse, 
    isLoading: isLoadingVerse,
    isError: isErrorVerse,
    refetch: refetchVerse
  } = useQuery({
    queryKey: ['/api/daily-verse'],
  });

  // Fetch random hadith
  const {
    data: randomHadith,
    isLoading: isLoadingHadith,
    isError: isErrorHadith,
    refetch: refetchHadith
  } = useQuery({
    queryKey: ['/api/random-hadith'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, we would call a search API endpoint
    console.log("Searching for:", searchTerm);
  };

  const handleSurahChange = (value: string) => {
    setSelectedSurah(value);
    // In a real implementation, we would fetch the surah
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-amiri text-primary dark:text-primary-light">Kuran & Hadisler</h1>
      </div>

      {/* Search Bar */}
      <Card className="islamic-border overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Ayet veya hadis ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Ara
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="quran" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="quran" className="flex-1">
            <BookOpen className="w-4 h-4 mr-2" />
            Kuran-ı Kerim
          </TabsTrigger>
          <TabsTrigger value="hadith" className="flex-1">
            <Quote className="w-4 h-4 mr-2" />
            Hadis-i Şerifler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quran" className="space-y-6">
          <Card className="islamic-border overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-amiri flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  Kuran-ı Kerim
                </h2>
                <Select value={selectedSurah} onValueChange={handleSurahChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sure seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1. Fatiha</SelectItem>
                    <SelectItem value="2">2. Bakara</SelectItem>
                    <SelectItem value="3">3. Al-i İmran</SelectItem>
                    <SelectItem value="4">4. Nisa</SelectItem>
                    <SelectItem value="5">5. Maide</SelectItem>
                    <SelectItem value="36">36. Yasin</SelectItem>
                    <SelectItem value="112">112. İhlas</SelectItem>
                    <SelectItem value="113">113. Felak</SelectItem>
                    <SelectItem value="114">114. Nas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-amiri text-lg font-bold mb-4 text-center">
                    Günün Ayeti
                  </h3>
                  {isLoadingVerse ? (
                    <div className="space-y-4 text-center">
                      <Skeleton className="h-8 w-3/4 mx-auto" />
                      <Skeleton className="h-4 w-5/6 mx-auto" />
                      <Skeleton className="h-4 w-1/2 mx-auto" />
                    </div>
                  ) : isErrorVerse ? (
                    <div className="text-center">
                      <p className="text-red-600 dark:text-red-400 mb-2">Ayet yüklenirken bir hata oluştu.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetchVerse()}
                        className="flex items-center mx-auto"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tekrar Dene
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-amiri text-xl leading-relaxed mb-4 rtl text-primary-foreground dark:text-gray-200" dir="rtl">
                        {dailyVerse?.arabicText}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {dailyVerse?.translation}
                      </p>
                      <p className="text-sm text-primary dark:text-primary-light">
                        {dailyVerse?.reference}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedSurah ? (
                <div className="bg-gray-50 dark:bg-gray-800/20 rounded-lg p-4">
                  <h3 className="font-amiri text-lg font-bold mb-4 text-center">
                    {selectedSurah === "1" ? "1. Fatiha Suresi" :
                     selectedSurah === "2" ? "2. Bakara Suresi" :
                     selectedSurah === "112" ? "112. İhlas Suresi" :
                     selectedSurah === "113" ? "113. Felak Suresi" :
                     selectedSurah === "114" ? "114. Nas Suresi" : "Sure"}
                  </h3>
                  
                  {selectedSurah === "1" && (
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-navy-dark rounded-lg p-4">
                        <p className="font-amiri text-xl leading-relaxed mb-2 rtl text-primary-foreground dark:text-gray-200 text-center" dir="rtl">
                          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                          Rahman ve Rahim olan Allah'ın adıyla.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-navy-dark rounded-lg p-4">
                        <p className="font-amiri text-xl leading-relaxed mb-2 rtl text-primary-foreground dark:text-gray-200 text-center" dir="rtl">
                          الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                          Hamd, Alemlerin Rabbi Allah'a mahsustur.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-navy-dark rounded-lg p-4">
                        <p className="font-amiri text-xl leading-relaxed mb-2 rtl text-primary-foreground dark:text-gray-200 text-center" dir="rtl">
                          الرَّحْمَنِ الرَّحِيمِ
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                          O, Rahman'dır, Rahim'dir.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedSurah === "112" && (
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-navy-dark rounded-lg p-4">
                        <p className="font-amiri text-xl leading-relaxed mb-2 rtl text-primary-foreground dark:text-gray-200 text-center" dir="rtl">
                          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                          Rahman ve Rahim olan Allah'ın adıyla.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-navy-dark rounded-lg p-4">
                        <p className="font-amiri text-xl leading-relaxed mb-2 rtl text-primary-foreground dark:text-gray-200 text-center" dir="rtl">
                          قُلْ هُوَ اللَّهُ أَحَدٌ
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                          De ki: O, Allah'tır, bir tektir.
                        </p>
                      </div>
                      <div className="bg-white dark:bg-navy-dark rounded-lg p-4">
                        <p className="font-amiri text-xl leading-relaxed mb-2 rtl text-primary-foreground dark:text-gray-200 text-center" dir="rtl">
                          اللَّهُ الصَّمَدُ
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                          Allah Samed'dir (Her şey O'na muhtaçtır, O hiçbir şeye muhtaç değildir).
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Book className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Lütfen bir sure seçin
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hadith" className="space-y-6">
          <Card className="islamic-border overflow-hidden">
            <CardHeader>
              <h2 className="text-xl font-bold font-amiri flex items-center">
                <Quote className="mr-2 h-5 w-5 text-primary" />
                Hadis-i Şerifler
              </h2>
            </CardHeader>
            <CardContent>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-amiri text-lg font-bold mb-4 text-center">
                    Günün Hadisi
                  </h3>
                  {isLoadingHadith ? (
                    <div className="space-y-4 text-center">
                      <Skeleton className="h-8 w-3/4 mx-auto" />
                      <Skeleton className="h-4 w-5/6 mx-auto" />
                      <Skeleton className="h-4 w-1/2 mx-auto" />
                    </div>
                  ) : isErrorHadith ? (
                    <div className="text-center">
                      <p className="text-red-600 dark:text-red-400 mb-2">Hadis yüklenirken bir hata oluştu.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetchHadith()}
                        className="flex items-center mx-auto"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tekrar Dene
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      {randomHadith?.arabicText && (
                        <p className="font-amiri text-xl leading-relaxed mb-4 rtl text-primary-foreground dark:text-gray-200" dir="rtl">
                          {randomHadith.arabicText}
                        </p>
                      )}
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {randomHadith?.translation || "المسلم من سلم المسلمون من لسانه ويده"}
                      </p>
                      <p className="text-sm text-primary dark:text-primary-light">
                        {randomHadith?.source || "Buhari ve Müslim"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Hadis Kategorileri</h3>
                    <ul className="space-y-2">
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        İbadet
                      </li>
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        Ahlak
                      </li>
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        Aile
                      </li>
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        İlim
                      </li>
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        Toplum
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Hadis Kaynakları</h3>
                    <ul className="space-y-2">
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        Buhari
                      </li>
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        Müslim
                      </li>
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        Tirmizi
                      </li>
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        Ebu Davud
                      </li>
                      <li className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/20 hover:bg-primary hover:bg-opacity-10 cursor-pointer">
                        İbn Mace
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
