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

interface PrayerTimesResponse {
  success: boolean;
  result: {
    times: {
      imsak: string;
      gunes: string;
      ogle: string;
      ikindi: string;
      aksam: string;
      yatsi: string;
    }
  };
}

export async function getPrayerTimes(city: string = 'istanbul'): Promise<typeof DEFAULT_PRAYER_TIMES> {
  try {
    // Using ezanvakti API for Turkey
    const response = await axios.get<PrayerTimesResponse>(
      `https://namaz-vakti-api.herokuapp.com/api/timesFromPlace?place=${encodeURIComponent(city)}`
    );

    if (response.data.success && response.data.result.times) {
      return {
        imsak: response.data.result.times.imsak,
        gunes: response.data.result.times.gunes,
        ogle: response.data.result.times.ogle,
        ikindi: response.data.result.times.ikindi,
        aksam: response.data.result.times.aksam,
        yatsi: response.data.result.times.yatsi,
      };
    }
    
    return DEFAULT_PRAYER_TIMES;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return DEFAULT_PRAYER_TIMES;
  }
}
