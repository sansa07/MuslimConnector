import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation-with-defaults";
import { Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PrayerTimesData {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
}

const PrayerTimes = () => {
  const { t } = useTranslation();
  const [city, setCity] = useState<string>("istanbul");
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [searchCity, setSearchCity] = useState<string>("");

  // Prayer times query
  const { 
    data: prayerTimes, 
    isLoading: prayerTimesLoading, 
    error: prayerTimesError,
    refetch: refetchPrayerTimes
  } = useQuery<PrayerTimesData>({
    queryKey: [`/api/prayer-times?city=${city}`],
  });

  // Try to get user's location and find the nearest city
  useEffect(() => {
    if (navigator.geolocation && !locationPermission) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Simple approach to find nearest city by getting city name from reverse geocoding
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

  const handleSearchCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCity(searchCity.trim().toLowerCase());
      refetchPrayerTimes();
    }
  };

  const handleGetLocation = () => {
    setLocationPermission(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t('prayerTimes.title')}</h1>
      
      {/* City search form */}
      <Card className="mb-6 islamic-border">
        <CardContent className="pt-6">
          <form onSubmit={handleSearchCity} className="flex gap-2">
            <Input 
              placeholder={t('prayerTimes.searchCityPlaceholder')} 
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">{t('prayerTimes.search')}</Button>
            <Button type="button" variant="outline" onClick={handleGetLocation}>
              <MapPin className="mr-2 h-4 w-4" />
              {t('prayerTimes.useLocation')}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Prayer times display */}
      {prayerTimesLoading ? (
        <Card className="islamic-border">
          <CardContent className="pt-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : prayerTimesError ? (
        <Card className="islamic-border">
          <CardContent className="pt-6">
            <p className="text-red-500">{t('errors.prayerTimesLoadFailed')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="islamic-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              {t('prayerTimes.title')} - {city.charAt(0).toUpperCase() + city.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${currentPrayer === t('prayerTimes.imsak') ? 'bg-primary bg-opacity-10' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <h3 className={`font-medium mb-1 ${currentPrayer === t('prayerTimes.imsak') ? 'text-primary-foreground dark:text-primary-foreground font-bold' : ''}`}>
                  {t('prayerTimes.imsak')}
                </h3>
                <p className={`text-2xl ${currentPrayer === t('prayerTimes.imsak') ? 'text-primary dark:text-primary-foreground font-bold' : ''}`}>
                  {prayerTimes?.imsak}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${currentPrayer === t('prayerTimes.sunrise') ? 'bg-primary bg-opacity-10' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <h3 className={`font-medium mb-1 ${currentPrayer === t('prayerTimes.sunrise') ? 'text-primary-foreground dark:text-primary-foreground font-bold' : ''}`}>
                  {t('prayerTimes.sunrise')}
                </h3>
                <p className={`text-2xl ${currentPrayer === t('prayerTimes.sunrise') ? 'text-primary dark:text-primary-foreground font-bold' : ''}`}>
                  {prayerTimes?.gunes}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${currentPrayer === t('prayerTimes.dhuhr') ? 'bg-primary bg-opacity-10' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <h3 className={`font-medium mb-1 ${currentPrayer === t('prayerTimes.dhuhr') ? 'text-primary-foreground dark:text-primary-foreground font-bold' : ''}`}>
                  {t('prayerTimes.dhuhr')}
                </h3>
                <p className={`text-2xl ${currentPrayer === t('prayerTimes.dhuhr') ? 'text-primary dark:text-primary-foreground font-bold' : ''}`}>
                  {prayerTimes?.ogle}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${currentPrayer === t('prayerTimes.asr') ? 'bg-primary bg-opacity-10' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <h3 className={`font-medium mb-1 ${currentPrayer === t('prayerTimes.asr') ? 'text-primary-foreground dark:text-primary-foreground font-bold' : ''}`}>
                  {t('prayerTimes.asr')}
                </h3>
                <p className={`text-2xl ${currentPrayer === t('prayerTimes.asr') ? 'text-primary dark:text-primary-foreground font-bold' : ''}`}>
                  {prayerTimes?.ikindi}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${currentPrayer === t('prayerTimes.maghrib') ? 'bg-primary bg-opacity-10' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <h3 className={`font-medium mb-1 ${currentPrayer === t('prayerTimes.maghrib') ? 'text-primary-foreground dark:text-primary-foreground font-bold' : ''}`}>
                  {t('prayerTimes.maghrib')}
                </h3>
                <p className={`text-2xl ${currentPrayer === t('prayerTimes.maghrib') ? 'text-primary dark:text-primary-foreground font-bold' : ''}`}>
                  {prayerTimes?.aksam}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${currentPrayer === t('prayerTimes.isha') ? 'bg-primary bg-opacity-10' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <h3 className={`font-medium mb-1 ${currentPrayer === t('prayerTimes.isha') ? 'text-primary-foreground dark:text-primary-foreground font-bold' : ''}`}>
                  {t('prayerTimes.isha')}
                </h3>
                <p className={`text-2xl ${currentPrayer === t('prayerTimes.isha') ? 'text-primary dark:text-primary-foreground font-bold' : ''}`}>
                  {prayerTimes?.yatsi}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Additional prayer-related information could be added here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="islamic-border">
          <CardHeader>
            <CardTitle>{t('prayerTimes.qiblaDirection')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('prayerTimes.qiblaInfo')}</p>
          </CardContent>
        </Card>
        
        <Card className="islamic-border">
          <CardHeader>
            <CardTitle>{t('prayerTimes.hijriCalendar')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('prayerTimes.hijriInfo')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrayerTimes;