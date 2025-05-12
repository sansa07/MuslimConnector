import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';

interface HijriDate {
  date: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
}

const HijriCalendar = () => {
  const [today, setToday] = useState(new Date());

  // Her 24 saatte bir tarihi güncelle
  useEffect(() => {
    const updateDate = () => {
      setToday(new Date());
    };

    const intervalId = setInterval(updateDate, 24 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // API'den bugünün hicri tarihini al
  const { data: hijriData, isLoading, error } = useQuery<{ hijri: HijriDate }>({
    queryKey: ['/api/hijri-date'],
    // Eğer API isteği başarısız olursa, basit bir hesaplama yöntemi kullan
    placeholderData: calculateApproximateHijriDate(today),
  });

  // Hicri ayların Türkçe karşılıkları
  const hijriMonthsTR = [
    'Muharrem',
    'Safer',
    'Rebiülevvel',
    'Rebiülahir',
    'Cemaziyelevvel',
    'Cemaziyelahir',
    'Recep',
    'Şaban',
    'Ramazan',
    'Şevval',
    'Zilkade',
    'Zilhicce'
  ];

  // Önemli İslami günler
  const importantIslamicDays = [
    { month: 1, day: 1, name: 'Hicri Yılbaşı' },
    { month: 1, day: 10, name: 'Aşure Günü' },
    { month: 3, day: 12, name: 'Mevlid Kandili' },
    { month: 7, day: 27, name: 'Regaib Kandili' },
    { month: 8, day: 15, name: 'Berat Kandili' },
    { month: 9, day: 1, name: 'Ramazan Başlangıcı' },
    { month: 9, day: 27, name: 'Kadir Gecesi' },
    { month: 10, day: 1, name: 'Ramazan Bayramı' },
    { month: 12, day: 10, name: 'Kurban Bayramı' },
    // Diğer önemli günler eklenebilir
  ];

  // Bugün için önemli İslami günleri kontrol et
  const todaysImportantDay = hijriData ? importantIslamicDays.find(
    day => day.month === hijriData.hijri.month.number && parseInt(hijriData.hijri.date) === day.day
  ) : null;

  // Yaklaşan önemli günleri bul (önümüzdeki 30 gün içindeki)
  const findUpcomingImportantDays = () => {
    if (!hijriData) return [];
    
    const currentMonth = hijriData.hijri.month.number;
    const currentDay = parseInt(hijriData.hijri.date);
    const currentYear = parseInt(hijriData.hijri.year);
    
    return importantIslamicDays
      .filter(day => {
        // Ay ve gün karşılaştırması yap
        if (day.month > currentMonth || (day.month === currentMonth && day.day > currentDay)) {
          return true; // Bu yıl içinde ve henüz gelmemiş
        }
        return false;
      })
      .slice(0, 3); // Yaklaşan 3 önemli günü göster
  };

  const upcomingDays = findUpcomingImportantDays();

  // Yaklaşım bir Hicri tarih hesaplama (API çalışmazsa yedek olarak)
  function calculateApproximateHijriDate(date: Date) {
    // Bu basit bir yaklaşımdır ve tahmini bir sonuç verir
    // Gerçek hesaplama için ayrıntılı bir algoritma gerekir
    
    // Miladi-Hicri dönüşüm için yaklaşık 33 yılda 1 ay kayma olur
    // 1970-01-01'in Hicri karşılığı 1389-10-22 (yaklaşık)
    const gregorianDate = date.getTime();
    const baseGregorian = new Date('1970-01-01').getTime();
    const daysDiff = Math.floor((gregorianDate - baseGregorian) / (1000 * 60 * 60 * 24));
    
    // Hicri yıllar miladi yıllardan %3 kadar daha kısadır (355 gün / 365 gün)
    // Bu oran ile hesaplama yapılır
    const hijriDaysSinceBase = daysDiff * 1.03;
    
    // 1389-10-22 (Base Hijri date)
    let hijriYear = 1389;
    let hijriMonth = 10;
    let hijriDay = 22;
    
    // Günleri ekle
    hijriDay += Math.floor(hijriDaysSinceBase);
    
    // Ayları düzelt
    while (hijriDay > 30) { // Basitlik için tüm ayları 30 gün sayıyoruz
      hijriDay -= 30;
      hijriMonth++;
      
      if (hijriMonth > 12) {
        hijriMonth = 1;
        hijriYear++;
      }
    }
    
    return {
      hijri: {
        date: hijriDay.toString(),
        month: {
          number: hijriMonth,
          en: hijriMonthsTR[hijriMonth - 1],
          ar: ''
        },
        year: hijriYear.toString()
      }
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Hicri Takvim
        </CardTitle>
        <CardDescription>
          Bugünün hicri tarihi ve yaklaşan önemli günler
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">Hicri takvim bilgisi alınamadı.</div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <p className="text-2xl font-bold">
                {hijriData?.hijri.date} {hijriMonthsTR[hijriData?.hijri.month.number - 1]} {hijriData?.hijri.year}
              </p>
              <p className="text-sm text-gray-500">
                {today.toLocaleDateString('tr-TR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
            
            {todaysImportantDay && (
              <div className="bg-primary bg-opacity-10 p-3 rounded-md mb-4">
                <p className="font-semibold">Bugün: {todaysImportantDay.name}</p>
                <p className="text-sm text-gray-600">Hayırlı kandiller ve önemli günler!</p>
              </div>
            )}
            
            {upcomingDays.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Yaklaşan Önemli Günler:</h4>
                <ul className="space-y-1">
                  {upcomingDays.map((day, index) => (
                    <li key={index} className="text-sm flex justify-between">
                      <span>{day.name}</span>
                      <span className="text-gray-500">
                        {day.day} {hijriMonthsTR[day.month - 1]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HijriCalendar;