/**
 * Static mapping of cities to geographic coordinates
 * This avoids the need for geocoding API calls at runtime
 *
 * To add new cities:
 * 1. Find coordinates at https://www.latlong.net/
 * 2. Add entry in format: 'City, ST': { lat: X.XXXX, lng: -Y.YYYY }
 */

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Colorado
  'Morrison, CO': { lat: 39.6653, lng: -105.2055 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Boulder, CO': { lat: 40.0150, lng: -105.2705 },
  'Colorado Springs, CO': { lat: 38.8339, lng: -104.8214 },
  'Fort Collins, CO': { lat: 40.5853, lng: -105.0844 },
  'Aspen, CO': { lat: 39.1911, lng: -106.8175 },
  'Telluride, CO': { lat: 37.9375, lng: -107.8123 },

  // New York
  'Syracuse, NY': { lat: 43.0481, lng: -76.1474 },
  'Rochester, NY': { lat: 43.1566, lng: -77.6088 },
  'Buffalo, NY': { lat: 42.8864, lng: -78.8784 },
  'Vernon, NY': { lat: 43.0801, lng: -75.5410 },
  'Liverpool, NY': { lat: 43.1064, lng: -76.2177 },
  'Darien Center, NY': { lat: 42.9287, lng: -78.3934 },
  'Saratoga, NY': { lat: 43.0748, lng: -73.7864 },
  'New York City, NY': { lat: 40.7128, lng: -74.0060 },
  'Poughkeepsie, NY': { lat: 41.7004, lng: -73.9210 },

  // Maryland & DC
  'Baltimore, MD': { lat: 39.2904, lng: -76.6122 },
  'Towson, MD': { lat: 39.4015, lng: -76.6019 },
  'Silver Spring, MD': { lat: 38.9907, lng: -77.0261 },
  'Columbia, MD': { lat: 39.2037, lng: -76.8610 },
  'Hagerstown, MD': { lat: 39.6418, lng: -77.7200 },
  'Washington, DC': { lat: 38.9072, lng: -77.0369 },

  // Pennsylvania
  'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
  'Hershey, PA': { lat: 40.2859, lng: -76.6502 },

  // Virginia
  'Springfield, VA': { lat: 38.7891, lng: -77.1870 },
  'Bristow, VA': { lat: 38.7212, lng: -77.5458 },

  // Others
  'New Orleans, LA': { lat: 29.9511, lng: -90.0715 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Fort Lauderdale, FL': { lat: 26.1224, lng: -80.1373 },
  'St. Petersburg, FL': { lat: 27.7676, lng: -82.6403 },
  'Worcester, MA': { lat: 42.2626, lng: -71.8023 },
  'Camden, NJ': { lat: 39.9259, lng: -75.1196 },
  'Sayreville, NJ': { lat: 40.4573, lng: -74.3640 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },

  // Add more cities as needed below
  // Format: 'City, State': { lat: latitude, lng: longitude },
}

/**
 * Get coordinates for a city/state string
 * Returns undefined if city not found in mapping
 */
export function getCityCoordinates(cityState: string): { lat: number; lng: number } | undefined {
  return CITY_COORDINATES[cityState]
}

/**
 * Get a default/fallback coordinate (Denver, CO)
 */
export function getDefaultCoordinates(): { lat: number; lng: number } {
  return { lat: 39.7392, lng: -104.9903 }
}
