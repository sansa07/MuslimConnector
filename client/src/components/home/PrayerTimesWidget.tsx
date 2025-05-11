import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import IslamicBorder from "@/components/shared/IslamicBorder";
import { IconClock } from "@/lib/icons";

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
}

const PrayerTimesWidget = () => {
  const { data: prayerTimes, isLoading } = useQuery({
    queryKey: ["/api/prayer-times"],
  });

  if (isLoading) {
    return (
      <IslamicBorder>
        <div className="p-4">
          <h2 className="font-amiri text-lg font-bold mb-2 flex items-center">
            <IconClock className="text-primary mr-2" /> 
            Namaz Vakitleri
          </h2>
          <div className="flex justify-between text-sm">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="text-center p-2">
                <Skeleton className="h-5 w-16 mb-2" />
                <Skeleton className="h-5 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </IslamicBorder>
    );
  }

  if (!prayerTimes) {
    return (
      <IslamicBorder>
        <div className="p-4">
          <h2 className="font-amiri text-lg font-bold mb-2 flex items-center">
            <IconClock className="text-primary mr-2" /> 
            Namaz Vakitleri
          </h2>
          <p className="text-center py-4 text-gray-500">Namaz vakitleri yüklenemedi.</p>
        </div>
      </IslamicBorder>
    );
  }

  const prayers: PrayerTime[] = [
    { name: "İmsak", time: prayerTimes.imsak, isNext: prayerTimes.nextPrayer === "imsak" },
    { name: "Öğle", time: prayerTimes.dhuhr, isNext: prayerTimes.nextPrayer === "dhuhr" },
    { name: "İkindi", time: prayerTimes.asr, isNext: prayerTimes.nextPrayer === "asr" },
    { name: "Akşam", time: prayerTimes.maghrib, isNext: prayerTimes.nextPrayer === "maghrib" },
    { name: "Yatsı", time: prayerTimes.isha, isNext: prayerTimes.nextPrayer === "isha" },
  ];

  return (
    <IslamicBorder>
      <div className="p-4">
        <h2 className="font-amiri text-lg font-bold mb-2 flex items-center">
          <IconClock className="text-primary mr-2" /> 
          Namaz Vakitleri - {prayerTimes.city}
        </h2>
        <div className="flex justify-between text-sm">
          {prayers.map((prayer) => (
            <div 
              key={prayer.name} 
              className={`text-center p-2 ${prayer.isNext ? "bg-primary bg-opacity-10 rounded-md" : ""}`}
            >
              <div className="font-medium">{prayer.name}</div>
              <div className={`text-primary ${prayer.isNext ? "font-bold" : ""} dark:text-primary-light`}>
                {prayer.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </IslamicBorder>
  );
};

export default PrayerTimesWidget;
