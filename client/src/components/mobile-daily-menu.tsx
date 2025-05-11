import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Book, BookOpen, BookText, Clock, Heart, ScrollText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation-with-defaults";
import DailyWisdom from "@/components/daily-wisdom";

export default function MobileDailyMenu() {
  const { t } = useTranslation();
  const [city, setCity] = useState<string>("istanbul");
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Prayer times query
  const { 
    data: prayerTimes, 
    isLoading: prayerTimesLoading, 
    error: prayerTimesError,
    refetch: refetchPrayerTimes
  } = useQuery({
    queryKey: [`/api/prayer-times?city=${city}`],
  });

  // Try to get user's location and find the nearest city
  useEffect(() => {
    if (navigator.geolocation && !locationPermission) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Simple approach to find nearest city by getting city name from reverse geocoding
            // In a real app, you'd use a more sophisticated approach 
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10&addressdetails=1`
            );
            const data = await response.json();
            
            // Set nearest city (this is a simple approach, in Turkey specifically get "ilce" if possible)
            if (data.address) {
              const cityName = data.address.city || 
                data.address.town || 
                data.address.county || 
                data.address.state || 
                "istanbul";
              
              setCity(cityName.toLowerCase());
              refetchPrayerTimes();
            }
            
            setLocationPermission(true);
          } catch (error) {
            console.error("Error getting location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationPermission(false);
        }
      );
    }
  }, [locationPermission, refetchPrayerTimes]);

  // Find which prayer time is next
  const getCurrentPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const prayers = [
      { name: t('prayerTimes.imsak'), time: prayerTimes.imsak },
      { name: t('prayerTimes.sunrise'), time: prayerTimes.gunes },
      { name: t('prayerTimes.dhuhr'), time: prayerTimes.ogle },
      { name: t('prayerTimes.asr'), time: prayerTimes.ikindi },
      { name: t('prayerTimes.maghrib'), time: prayerTimes.aksam },
      { name: t('prayerTimes.isha'), time: prayerTimes.yatsi },
    ];
    
    const prayerTimes24h = prayers.map(prayer => {
      const [hour, minute] = prayer.time.split(':').map(Number);
      return { ...prayer, minutes: hour * 60 + minute };
    });
    
    // Sort by time to handle day boundary (midnight)
    prayerTimes24h.sort((a, b) => a.minutes - b.minutes);
    
    // Find the next prayer
    const nextPrayer = prayerTimes24h.find(prayer => prayer.minutes > currentTime);
    
    // If no next prayer today, the next is the first prayer tomorrow
    return nextPrayer ? nextPrayer.name : prayerTimes24h[0].name;
  };
  
  const currentPrayer = getCurrentPrayer();

  return (
    <Tabs defaultValue="prayerTimes" className="w-full fixed bottom-16 left-0 right-0 px-4 pb-2 bg-white/80 dark:bg-navy/80 backdrop-blur-sm z-30 border-t border-gray-200 dark:border-gray-800 lg:hidden">
      <TabsList className="grid grid-cols-2 mb-2">
        <TabsTrigger value="prayerTimes">
          <Clock className="mr-2 h-4 w-4" />
          {t('prayerTimes.title')}
        </TabsTrigger>
        <TabsTrigger value="dailyWisdom">
          <Book className="mr-2 h-4 w-4" />
          {t('dailyWisdom.title')}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="prayerTimes" className="mt-0">
        {prayerTimesLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : prayerTimesError ? (
          <p className="text-red-500">{t('errors.prayerTimesLoadFailed')}</p>
        ) : (
          <Card className="islamic-border overflow-hidden">
            <CardContent className="p-3">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-primary" /> 
                {t('prayerTimes.title')} - {city.charAt(0).toUpperCase() + city.slice(1)}
              </h3>
              <div className="grid grid-cols-6 gap-1 text-xs">
                <div className={`text-center p-1 ${currentPrayer === t('prayerTimes.imsak') ? 'bg-primary bg-opacity-10 rounded' : ''}`}>
                  <div className="font-medium">{t('prayerTimes.imsak')}</div>
                  <div className={`${currentPrayer === t('prayerTimes.imsak') ? 'text-primary font-bold' : 'text-primary'}`}>
                    {prayerTimes?.imsak}
                  </div>
                </div>
                <div className={`text-center p-1 ${currentPrayer === t('prayerTimes.sunrise') ? 'bg-primary bg-opacity-10 rounded' : ''}`}>
                  <div className="font-medium">{t('prayerTimes.sunrise')}</div>
                  <div className={`${currentPrayer === t('prayerTimes.sunrise') ? 'text-primary font-bold' : 'text-primary'}`}>
                    {prayerTimes?.gunes}
                  </div>
                </div>
                <div className={`text-center p-1 ${currentPrayer === t('prayerTimes.dhuhr') ? 'bg-primary bg-opacity-10 rounded' : ''}`}>
                  <div className="font-medium">{t('prayerTimes.dhuhr')}</div>
                  <div className={`${currentPrayer === t('prayerTimes.dhuhr') ? 'text-primary font-bold' : 'text-primary'}`}>
                    {prayerTimes?.ogle}
                  </div>
                </div>
                <div className={`text-center p-1 ${currentPrayer === t('prayerTimes.asr') ? 'bg-primary bg-opacity-10 rounded' : ''}`}>
                  <div className="font-medium">{t('prayerTimes.asr')}</div>
                  <div className={`${currentPrayer === t('prayerTimes.asr') ? 'text-primary font-bold' : 'text-primary'}`}>
                    {prayerTimes?.ikindi}
                  </div>
                </div>
                <div className={`text-center p-1 ${currentPrayer === t('prayerTimes.maghrib') ? 'bg-primary bg-opacity-10 rounded' : ''}`}>
                  <div className="font-medium">{t('prayerTimes.maghrib')}</div>
                  <div className={`${currentPrayer === t('prayerTimes.maghrib') ? 'text-primary font-bold' : 'text-primary'}`}>
                    {prayerTimes?.aksam}
                  </div>
                </div>
                <div className={`text-center p-1 ${currentPrayer === t('prayerTimes.isha') ? 'bg-primary bg-opacity-10 rounded' : ''}`}>
                  <div className="font-medium">{t('prayerTimes.isha')}</div>
                  <div className={`${currentPrayer === t('prayerTimes.isha') ? 'text-primary font-bold' : 'text-primary'}`}>
                    {prayerTimes?.yatsi}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="dailyWisdom" className="mt-0">
        <DailyWisdom isMinimal={true} />
      </TabsContent>
    </Tabs>
  );
}