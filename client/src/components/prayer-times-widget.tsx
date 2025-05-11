import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation-with-defaults";

export default function PrayerTimesWidget() {
  const { t } = useTranslation();
  const [city, setCity] = useState<string>('istanbul');
  const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(false);
  
  const { data: prayerTimes, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/prayer-times', city],
    queryFn: () => fetch(`/api/prayer-times?city=${encodeURIComponent(city)}`).then(res => res.json()),
  });
  
  useEffect(() => {
    // Check if location was previously saved in localStorage
    const savedCity = localStorage.getItem('prayerCity');
    if (savedCity) {
      setCity(savedCity);
    }
  }, []);

  // Find which prayer time is next
  const getCurrentPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const prayers = [
      { name: 'İmsak', time: prayerTimes.imsak },
      { name: 'Güneş', time: prayerTimes.gunes },
      { name: 'Öğle', time: prayerTimes.ogle },
      { name: 'İkindi', time: prayerTimes.ikindi },
      { name: 'Akşam', time: prayerTimes.aksam },
      { name: 'Yatsı', time: prayerTimes.yatsi },
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

  if (isLoading) {
    return (
      <Card className="islamic-border mb-6 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex justify-between text-sm">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="text-center p-2">
                <Skeleton className="h-4 w-12 mb-2 mx-auto" />
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="islamic-border mb-6 overflow-hidden">
        <CardContent className="p-4">
          <h2 className="font-amiri text-lg font-bold mb-2 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" /> 
            Namaz Vakitleri - İstanbul
          </h2>
          <p className="text-red-500">Namaz vakitleri yüklenirken bir hata oluştu.</p>
        </CardContent>
      </Card>
    );
  }

  // Function to handle location request
  const handleRequestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we would convert the lat/lng to a city name using reverse geocoding
          // For now, we'll just simulate it 
          const nearestCities = {
            'istanbul': { lat: 41.0082, lng: 28.9784 },
            'ankara': { lat: 39.9334, lng: 32.8597 },
            'izmir': { lat: 38.4237, lng: 27.1428 },
            'bursa': { lat: 40.1885, lng: 29.0610 },
            'antalya': { lat: 36.8969, lng: 30.7133 }
          };
          
          // Find the nearest city (simplified example)
          let nearestCity = 'istanbul';
          let minDistance = Number.MAX_VALUE;
          
          for (const [city, coords] of Object.entries(nearestCities)) {
            const distance = Math.sqrt(
              Math.pow(position.coords.latitude - coords.lat, 2) + 
              Math.pow(position.coords.longitude - coords.lng, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestCity = city;
            }
          }
          
          setCity(nearestCity);
          localStorage.setItem('prayerCity', nearestCity);
          setShowLocationPrompt(false);
          refetch();
        },
        (error) => {
          console.error("Error getting location:", error);
          setShowLocationPrompt(false);
        }
      );
    }
  };
  
  // Handle city selection directly
  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    localStorage.setItem('prayerCity', selectedCity);
    setShowLocationPrompt(false);
    refetch();
  };

  return (
    <Card className="islamic-border mb-6 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-amiri text-lg font-bold flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" /> 
            {t('prayerTimes.title')} - {city.charAt(0).toUpperCase() + city.slice(1)}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary-dark"
            onClick={() => setShowLocationPrompt(true)}
          >
            <MapPin className="h-4 w-4 mr-1" />
            {t('prayerTimes.change')}
          </Button>
        </div>
        
        {/* Location selection prompt */}
        {showLocationPrompt && (
          <div className="mb-4 p-3 bg-primary/5 rounded-md">
            <h3 className="font-medium mb-2">{t('prayerTimes.locationNotice')}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Button 
                size="sm" 
                onClick={handleRequestLocation}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                {t('prayerTimes.currentLocation')}
              </Button>
              
              {/* Pre-selected cities */}
              {['istanbul', 'ankara', 'izmir', 'bursa', 'antalya'].map(cityName => (
                <Button 
                  key={cityName}
                  size="sm" 
                  variant={city === cityName ? "default" : "outline"}
                  onClick={() => handleCitySelect(cityName)}
                >
                  {cityName.charAt(0).toUpperCase() + cityName.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <div className={`text-center p-2 ${currentPrayer === 'İmsak' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">{t('prayerTimes.imsak')}</div>
            <div className={`${currentPrayer === 'İmsak' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.imsak}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'Güneş' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">{t('prayerTimes.sunrise')}</div>
            <div className={`${currentPrayer === 'Güneş' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.gunes}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'Öğle' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">{t('prayerTimes.dhuhr')}</div>
            <div className={`${currentPrayer === 'Öğle' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.ogle}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'İkindi' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">{t('prayerTimes.asr')}</div>
            <div className={`${currentPrayer === 'İkindi' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.ikindi}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'Akşam' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">{t('prayerTimes.maghrib')}</div>
            <div className={`${currentPrayer === 'Akşam' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.aksam}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'Yatsı' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">{t('prayerTimes.isha')}</div>
            <div className={`${currentPrayer === 'Yatsı' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.yatsi}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
