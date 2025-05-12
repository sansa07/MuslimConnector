import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const QiblaDirection = () => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceDirection, setDeviceDirection] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isMobile = useIsMobile();

  // Mekke koordinatları
  const KAABA_COORDS = {
    latitude: 21.4225,
    longitude: 39.8262
  };

  const calculateQiblaDirection = (userLat: number, userLng: number) => {
    // Qibla yönünü hesaplama formülü
    const latKaaba = KAABA_COORDS.latitude * (Math.PI / 180);
    const lngKaaba = KAABA_COORDS.longitude * (Math.PI / 180);
    const latUser = userLat * (Math.PI / 180);
    const lngUser = userLng * (Math.PI / 180);
    
    const y = Math.sin(lngKaaba - lngUser);
    const x = Math.cos(latUser) * Math.tan(latKaaba) - Math.sin(latUser) * Math.cos(lngKaaba - lngUser);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    
    // Pozitif değere çevir
    if (qibla < 0) {
      qibla += 360;
    }
    
    return qibla;
  };

  const handleStartCompass = () => {
    setIsCalibrating(true);
    setErrorMessage("");

    if (!isMobile) {
      setErrorMessage("Kıble pusulası sadece mobil cihazlarda çalışır.");
      setIsCalibrating(false);
      return;
    }

    if (!navigator.geolocation) {
      setErrorMessage("Tarayıcınız konum özelliğini desteklemiyor.");
      setIsCalibrating(false);
      return;
    }

    // Kullanıcının konumunu al
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const qiblaAngle = calculateQiblaDirection(latitude, longitude);
        setQiblaDirection(qiblaAngle);
        
        // Pusula izni kontrolü ve başlatma
        if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          // iOS 13+ için izin isteme
          (DeviceOrientationEvent as any).requestPermission()
            .then((response: string) => {
              if (response === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
                setHasPermission(true);
              } else {
                setErrorMessage("Pusula iznine ihtiyacımız var.");
                setIsCalibrating(false);
              }
            })
            .catch(() => {
              setErrorMessage("Pusula iznine ihtiyacımız var.");
              setIsCalibrating(false);
            });
        } else if (window.DeviceOrientationEvent) {
          // Diğer cihazlar için
          window.addEventListener('deviceorientation', handleOrientation);
          setHasPermission(true);
        } else {
          setErrorMessage("Cihazınız pusula özelliğini desteklemiyor.");
          setIsCalibrating(false);
        }
      },
      (error) => {
        console.error("Konum alınamadı:", error);
        setErrorMessage("Konum izni reddedildi veya alınamadı.");
        setIsCalibrating(false);
      }
    );
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // Alpha değeri pusula yönünü verir (derece cinsinden 0-360)
    if (event.alpha !== null) {
      setDeviceDirection(event.alpha);
      setIsCalibrating(false);
    }
  };

  // Bileşen temizliği
  useEffect(() => {
    return () => {
      if (hasPermission) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [hasPermission]);

  // Pusula gösterimi için stil hesaplama
  const compassStyle = {
    transform: `rotate(${deviceDirection}deg)`
  };

  const arrowStyle = qiblaDirection ? {
    transform: `rotate(${qiblaDirection - deviceDirection}deg)`
  } : {};

  if (!isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kıble Yönü</CardTitle>
          <CardDescription>
            Bu özellik sadece mobil cihazlarda kullanılabilir.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5" />
          Kıble Yönü
        </CardTitle>
        <CardDescription>
          Cihazınızın pusulasını kullanarak kıble yönünü bulun
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {errorMessage ? (
          <div className="text-red-500 mb-4">{errorMessage}</div>
        ) : qiblaDirection && hasPermission ? (
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pusula gösterimi */}
            <div className="relative w-full h-full" style={compassStyle}>
              <div className="absolute inset-0 border-4 border-primary rounded-full"></div>
              <div className="absolute top-0 left-1/2 h-1/2 w-1 bg-gray-400 -translate-x-1/2 origin-bottom"></div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 font-bold">K</div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-bold">G</div>
              <div className="absolute left-8 top-1/2 -translate-y-1/2 font-bold">B</div>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 font-bold">D</div>
            </div>
            
            {/* Kıble yönü oku */}
            <div 
              className="absolute w-6 h-40 flex flex-col items-center" 
              style={arrowStyle}
            >
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-green-600"></div>
              <div className="w-2 h-32 bg-green-600"></div>
              <span className="mt-1 text-xs font-semibold">Kıble</span>
            </div>
          </div>
        ) : isCalibrating ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Pusula kalibre ediliyor...</p>
            <p className="text-sm text-gray-500 mt-2">Lütfen cihazınızı sekiz rakamı çizer şekilde hareket ettirin</p>
          </div>
        ) : (
          <Button onClick={handleStartCompass} className="my-4">
            Pusulayı Başlat
          </Button>
        )}
      </CardContent>
      {qiblaDirection && (
        <CardFooter className="flex flex-col items-center text-sm text-gray-500">
          <p>Kıble açısı: {qiblaDirection.toFixed(1)}°</p>
          <p>Kuzey'den Kıble'ye doğru saat yönünde ölçülür</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default QiblaDirection;