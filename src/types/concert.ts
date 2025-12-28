export interface Concert {
  id: string;
  date: string; // ISO 8601: "2023-06-15"
  headliner: string;
  headlinerNormalized: string;
  genre: string;
  openers: string[];
  venue: string;
  city: string;
  state: string;
  cityState: string;
  reference?: string;

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
