// Standaardinstellingen. Alles is ook op de TV aan te passen via het
// instellingenmenu (▲ naar het tandwiel, OK); dat wordt op de TV bewaard.
var DEFAULTS = {
  background: 'stars',        // 'stars' | 'aurora' | 'minimal'
  clock24: true,
  weather: true,
  location: null,             // { name, lat, lon } of null = automatisch via IP
  apps: ['youtube', 'spotify', 'netflix', 'prime', 'disney', 'npo'],
  hdmi: { 1: 'generic', 2: 'generic', 3: 'generic', 4: 'generic' },
  tvTile: true                // tegel voor antenne/kabel-TV
};
var FALLBACK_LOCATION = { name: 'Amsterdam', lat: 52.37, lon: 4.89 };
