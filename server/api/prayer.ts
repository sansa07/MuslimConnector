import axios from 'axios';

// Default prayer times if API fails (Istanbul times for demonstration)
const DEFAULT_PRAYER_TIMES = {
  imsak: "05:37",
  gunes: "07:05",
  ogle: "13:08",
  ikindi: "16:59",
  aksam: "20:30",
  yatsi: "22:03",
};

interface AdhanResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
      [key: string]: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
      };
      gregorian: {
        date: string;
        month: {
          number: number;
          en: string;
        };
        year: string;
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
      };
    };
  };
}

export async function getPrayerTimes(city: string = 'istanbul'): Promise<typeof DEFAULT_PRAYER_TIMES> {
  try {
    // Using aladhan.com API as a replacement
    const response = await axios.get<AdhanResponse>(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Turkey&method=13`
    );

    if (response.data.code === 200 && response.data.data.timings) {
      const timings = response.data.data.timings;
      
      // Convert from 24hr format to preferred format and map to Turkish names
      return {
        imsak: timings.Fajr,
        gunes: timings.Sunrise,
        ogle: timings.Dhuhr,
        ikindi: timings.Asr,
        aksam: timings.Maghrib,
        yatsi: timings.Isha,
      };
    }
    
    return DEFAULT_PRAYER_TIMES;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return DEFAULT_PRAYER_TIMES;
  }
}
