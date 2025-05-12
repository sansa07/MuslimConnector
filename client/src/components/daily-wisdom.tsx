import { useQuery } from "@tanstack/react-query";
import { BookOpen, BookText, Heart, LucideIcon, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translation-with-defaults";

interface DailyWisdomProps {
  isMinimal?: boolean;
}

export default function DailyWisdom({ isMinimal = false }: DailyWisdomProps) {
  const { t } = useTranslation();
  
  // Daily verse query
  const { 
    data: verse, 
    isLoading: verseLoading, 
    error: verseError 
  } = useQuery({
    queryKey: ['/api/daily-verse'],
  });

  // Daily hadith query  
  const { 
    data: hadith, 
    isLoading: hadithLoading, 
    error: hadithError 
  } = useQuery({
    queryKey: ['/api/daily-hadith'],
  });

  // Daily dua query
  const { 
    data: dua, 
    isLoading: duaLoading, 
    error: duaError 
  } = useQuery({
    queryKey: ['/api/daily-dua'],
  });

  // Daily story query
  const { 
    data: story, 
    isLoading: storyLoading, 
    error: storyError 
  } = useQuery({
    queryKey: ['/api/daily-story'],
  });

  if (isMinimal) {
    // Minimal view for mobile menu
    return (
      <Card className="islamic-border overflow-hidden">
        <CardContent className="p-3">
          <Tabs defaultValue="verse">
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="verse">
                <BookOpen className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="hadith">
                <BookText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="dua">
                <Heart className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="story">
                <ScrollText className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="verse" className="mt-0">
              {verseLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : verseError ? (
                <p className="text-sm text-red-500">{t('errors.failedToLoad')}</p>
              ) : (
                <div className="text-xs">
                  <p className="text-gray-700 dark:text-gray-300 mb-1">
                    {verse?.translation || "Ben cinleri ve insanları, ancak bana kulluk etsinler diye yarattım."}
                  </p>
                  <p className="text-primary text-right text-xs font-medium">
                    {verse?.reference || "Zariyat Suresi, 56. Ayet"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="hadith" className="mt-0">
              {hadithLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : hadithError ? (
                <p className="text-sm text-red-500">{t('errors.failedToLoad')}</p>
              ) : (
                <div className="text-xs">
                  <p className="mb-1 text-gray-700 dark:text-gray-300">
                    {hadith?.translation || "İnsanlara merhamet etmeyene Allah da merhamet etmez."}
                  </p>
                  <p className="text-primary text-right text-xs">
                    {hadith?.source || "Buhârî, Müslim"} 
                    {hadith?.reference ? <span className="ml-1">- {hadith.reference}</span> : null}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="dua" className="mt-0">
              {duaLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : duaError ? (
                <p className="text-sm text-red-500">{t('errors.failedToLoad')}</p>
              ) : (
                <div className="text-xs">
                  <p className="text-gray-700 dark:text-gray-300 mb-1">
                    {dua?.translation || "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver. Bizi cehennem azabından koru!"}
                  </p>
                  <p className="text-primary text-right text-xs">
                    {dua?.source || "Bakara Suresi, 201"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="story" className="mt-0">
              {storyLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : storyError ? (
                <p className="text-sm text-red-500">{t('errors.failedToLoad')}</p>
              ) : (
                <div className="text-xs">
                  <p className="font-medium mb-1">
                    {story?.title || "Hz. İbrahim'in İmtihanı"}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                    {story?.summary || "Hz. İbrahim'in oğlu Hz. İsmail'i kurban etmesi emredildiğinde..."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Full detailed view
  return (
    <Card className="islamic-border mb-6 overflow-hidden">
      <CardContent className="p-5">
        <h2 className="font-amiri text-lg font-bold mb-3 flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-accent" /> 
          {t('home.dailyWisdom')}
        </h2>
        
        <Tabs defaultValue="verse">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="verse">{t('wisdom.verse')}</TabsTrigger>
            <TabsTrigger value="hadith">{t('wisdom.hadith')}</TabsTrigger>
            <TabsTrigger value="dua">{t('wisdom.dua')}</TabsTrigger>
            <TabsTrigger value="story">{t('wisdom.story')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verse">
            {verseLoading ? (
              <div className="text-center py-4">
                <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
                <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                <Skeleton className="h-4 w-4/6 mx-auto mb-3" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            ) : verseError ? (
              <p className="text-red-500 text-center py-4">{t('errors.verseLoadFailed')}</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-lg">
                  {verse?.translation || "Ben cinleri ve insanları, ancak bana kulluk etsinler diye yarattım."}
                </p>
                <p className="text-sm text-primary dark:text-primary-light font-medium">
                  {verse?.reference || "Zariyat Suresi, 56. Ayet"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hadith">
            {hadithLoading ? (
              <div className="text-center py-4">
                <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                <Skeleton className="h-4 w-4/6 mx-auto mb-3" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            ) : hadithError ? (
              <p className="text-red-500 text-center py-4">{t('errors.hadithLoadFailed')}</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-lg leading-relaxed mb-3 text-gray-700 dark:text-gray-300">
                  {hadith?.translation || "İnsanlara merhamet etmeyene Allah da merhamet etmez."}
                </p>
                <p className="text-sm text-primary dark:text-primary-light">
                  {hadith?.source || "Buhârî, Müslim"} 
                  {hadith?.reference ? <span className="ml-1">- {hadith.reference}</span> : null}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dua">
            {duaLoading ? (
              <div className="text-center py-4">
                <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
                <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            ) : duaError ? (
              <p className="text-red-500 text-center py-4">{t('errors.duaLoadFailed')}</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-lg">
                  {dua?.translation || "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver. Bizi cehennem azabından koru!"}
                </p>
                <p className="text-sm text-primary dark:text-primary-light">
                  {dua?.source || "Bakara Suresi, 201. Ayet"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="story">
            {storyLoading ? (
              <div className="text-center py-4">
                <Skeleton className="h-5 w-1/2 mx-auto mb-3" />
                <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            ) : storyError ? (
              <p className="text-red-500 text-center py-4">{t('errors.storyLoadFailed')}</p>
            ) : (
              <div className="py-4">
                <h3 className="text-lg font-bold text-center mb-3">
                  {story?.title || "Hz. İbrahim'in İmtihanı"}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                  {story?.content || "Hz. İbrahim'in oğlu Hz. İsmail'i kurban etmesi emredildiğinde, Hz. İbrahim tereddüt etmeden Allah'ın emrine boyun eğmiştir. Bu imtihandan başarıyla çıkan Hz. İbrahim'e, Allah tarafından oğlunun yerine kurban edilmek üzere bir koç gönderilmiştir. Bu kıssa, Allah'a olan itaatin ve teslimiyetin en güzel örneklerinden biridir."}
                </p>
                <p className="text-sm text-primary dark:text-primary-light text-right">
                  {story?.source || "Kısas-ı Enbiya"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}