export interface Concert {
  id: string;
  date: string; // ISO 8601: "2023-06-15"
  headliner: string;
  headlinerNormalized: string;
  genre: string;
  genreNormalized: string; // ✨ NEW in v1.9.0
  openers: string[];
  venue: string;
  venueNormalized: string; // ✨ NEW in v1.9.0
  city: string;
  state: string;
  cityState: string;
  reference?: string;
  isFestival: boolean;

  // Parsed date fields
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
  decade: string;

  // Geographic data
  location: {
    lat: number;
    lng: number;
  };

  // Enriched fields
  headlinerImage?: string;
  headlinerBio?: string;
  openerImages?: Record<string, string>;
}

export interface ConcertData {
  concerts: Concert[];
  metadata: {
    lastUpdated: string;
    totalConcerts: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
    uniqueArtists: number;
    uniqueVenues: number;
    uniqueCities: number;
  };
}
