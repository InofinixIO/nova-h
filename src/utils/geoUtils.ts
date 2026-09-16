// Utility to resolve nearest Indian metro based on GPS coordinates or IP fallback

export interface Coordinates {
  lat: number;
  lng: number;
}

export const CITY_COORDINATES: Record<string, Coordinates> = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi NCR': { lat: 28.6139, lng: 77.2090 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 }
};

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest registered NOVA city to user coordinates
export function getClosestCity(lat: number, lng: number): { city: string; distanceKm: number } {
  let closestCity = 'Mumbai';
  let minDistance = Infinity;

  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    const dist = calculateDistanceKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = city;
    }
  }

  return { city: closestCity, distanceKm: Math.round(minDistance) };
}

// Attempt to detect location using browser Geolocation with IP fallback
export async function detectUserCity(): Promise<{ city: string; method: 'gps' | 'ip' | 'fallback'; distanceKm?: number }> {
  // 1. Try HTML5 Geolocation
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 6000,
          maximumAge: 60000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      const { city, distanceKm } = getClosestCity(latitude, longitude);
      return { city, method: 'gps', distanceKm };
    } catch (err) {
      console.warn('Browser GPS unavailable or denied, attempting network IP detection...', err);
    }
  }

  // 2. Try lightweight IP lookup fallback
  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
    if (response.ok) {
      const data = await response.json();
      if (data.city) {
        // Match against known cities or calculate by lat/long
        if (data.latitude && data.longitude) {
          const { city, distanceKm } = getClosestCity(data.latitude, data.longitude);
          return { city, method: 'ip', distanceKm };
        }
        for (const knownCity of Object.keys(CITY_COORDINATES)) {
          if (data.city.toLowerCase().includes(knownCity.toLowerCase())) {
            return { city: knownCity, method: 'ip' };
          }
        }
      }
    }
  } catch (ipErr) {
    console.warn('IP location detection timed out or failed:', ipErr);
  }

  // 3. Default fallback
  return { city: 'Mumbai', method: 'fallback' };
}
