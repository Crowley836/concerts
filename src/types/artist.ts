export interface ArtistMetadata {
  [artistNormalized: string]: {
    name: string;
    image?: string;
    bio?: string;
    genres?: string[];
    formed?: string;
    source: 'theaudiodb' | 'lastfm' | 'manual';
    fetchedAt: string;
  };
}

export interface FilterState {
  artists: string[];
  genres: string[];
  venues: string[];
  cities: string[];
  yearRange: [number, number];
  searchQuery: string;
  hasOpeners: boolean | null;
}
