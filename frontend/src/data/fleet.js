export const FLEET = [
  {id: 'RB-101', country: 'LU', site: 'Luxembourg HQ', lat: 49.6116, lng: 6.1319},
  {id: 'RB-102', country: 'DE', site: 'Munich Solar Park', lat: 48.1351, lng: 11.582},
  {id: 'RB-103', country: 'FR', site: 'Lyon Solar Farm', lat: 45.764, lng: 4.8357},
  {id: 'RB-104', country: 'ES', site: 'Seville Plant', lat: 37.3891, lng: -5.9845},
  {id: 'RB-105', country: 'IT', site: 'Milan Installation', lat: 45.4642, lng: 9.19},
  {id: 'RB-106', country: 'NL', site: 'Rotterdam Site', lat: 51.9244, lng: 4.4777},
  {id: 'RB-107', country: 'BE', site: 'Brussels Array', lat: 50.8503, lng: 4.3517},
  {id: 'RB-108', country: 'AT', site: 'Vienna Field', lat: 48.2082, lng: 16.3738},
  {id: 'RB-109', country: 'PL', site: 'Warsaw Farm', lat: 52.2297, lng: 21.0122},
  {id: 'RB-110', country: 'PT', site: 'Lisbon Plant', lat: 38.7223, lng: -9.1393},
];

export const COUNTRY_NAMES = {
  LU: 'Luxembourg',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  BE: 'Belgium',
  AT: 'Austria',
  PL: 'Poland',
  PT: 'Portugal',
};

export const initialRobots = FLEET.map(robot => ({
  ...robot,
  battery: 100,
  status: 'idle',
  water_level: 100,
  panels_cleaned: 0,
  updatedAt: null,
}));
