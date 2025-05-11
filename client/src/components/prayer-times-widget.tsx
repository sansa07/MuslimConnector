import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrayerTimesWidget() {
  const { data: prayerTimes, isLoading, error } = useQuery({
    queryKey: ['/api/prayer-times'],
  });

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

  return (
    <Card className="islamic-border mb-6 overflow-hidden">
      <CardContent className="p-4">
        <h2 className="font-amiri text-lg font-bold mb-2 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" /> 
          Namaz Vakitleri - İstanbul
        </h2>
        <div className="flex justify-between text-sm">
          <div className={`text-center p-2 ${currentPrayer === 'İmsak' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">İmsak</div>
            <div className={`${currentPrayer === 'İmsak' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.imsak}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'Güneş' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">Güneş</div>
            <div className={`${currentPrayer === 'Güneş' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.gunes}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'Öğle' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">Öğle</div>
            <div className={`${currentPrayer === 'Öğle' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.ogle}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'İkindi' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">İkindi</div>
            <div className={`${currentPrayer === 'İkindi' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.ikindi}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'Akşam' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">Akşam</div>
            <div className={`${currentPrayer === 'Akşam' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.aksam}
            </div>
          </div>
          <div className={`text-center p-2 ${currentPrayer === 'Yatsı' ? 'bg-primary bg-opacity-10 rounded-md' : ''}`}>
            <div className="font-medium">Yatsı</div>
            <div className={`${currentPrayer === 'Yatsı' ? 'text-primary font-bold dark:text-primary-light' : 'text-primary dark:text-primary-light'}`}>
              {prayerTimes?.yatsi}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
