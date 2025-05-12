import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation-with-defaults";
import { Book, BookOpen, BookText, ScrollText } from "lucide-react";

interface QuranVerse {
  id: number;
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  surahName: string;
}

interface Hadith {
  id: number;
  text: string;
  narrator: string;
  source: string;
}

interface Dua {
  id: number;
  arabicText: string;
  translation: string;
  source: string;
}

interface IslamicStory {
  id: number;
  title: string;
  content: string;
  source: string;
  reference: string;
}

const DailyWisdom = () => {
  const { t } = useTranslation();
  
  // Quran verse query
  const { 
    data: verseData, 
    isLoading: verseLoading 
  } = useQuery<QuranVerse>({
    queryKey: ['/api/daily-verse'],
  });

  // Hadith query
  const { 
    data: hadithData, 
    isLoading: hadithLoading 
  } = useQuery<Hadith>({
    queryKey: ['/api/daily-hadith'],
  });

  // Dua query
  const { 
    data: duaData, 
    isLoading: duaLoading 
  } = useQuery<Dua>({
    queryKey: ['/api/daily-dua'],
  });

  // Story query
  const { 
    data: storyData, 
    isLoading: storyLoading 
  } = useQuery<IslamicStory>({
    queryKey: ['/api/daily-story'],
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Hakikat</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Verse Card */}
        <Card className="islamic-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Günün Ayeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verseLoading ? (
              <>
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-10 w-3/4" />
              </>
            ) : (
              <>
                <p className="mb-2 text-lg">
                  {verseData?.translation}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {verseData?.surahName} {verseData?.ayah}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Daily Hadith Card */}
        <Card className="islamic-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5 text-primary" />
              {t('dailyWisdom.hadith')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hadithLoading ? (
              <>
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-10 w-3/4" />
              </>
            ) : (
              <>
                <p className="mb-4">
                  {hadithData?.text}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {hadithData?.narrator} - {hadithData?.source}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Daily Dua Card */}
        <Card className="islamic-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <BookText className="mr-2 h-5 w-5 text-primary" />
              {t('dailyWisdom.dua')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {duaLoading ? (
              <>
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-10 w-3/4" />
              </>
            ) : (
              <>
                <p className="mb-2 text-lg">
                  {duaData?.translation}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {duaData?.source}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Daily Story Card */}
        <Card className="islamic-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <ScrollText className="mr-2 h-5 w-5 text-primary" />
              {t('dailyWisdom.story')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storyLoading ? (
              <>
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-10 w-3/4" />
              </>
            ) : (
              <>
                <h3 className="font-bold mb-2">{storyData?.title}</h3>
                <p className="mb-2">
                  {storyData?.content}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {storyData?.source} {storyData?.reference}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyWisdom;