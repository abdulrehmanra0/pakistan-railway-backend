const SOURCES = {
  PRIMARY: {
    trains:      'https://traintracking.pk/data/Trains.json',
    timetables:  'https://traintracking.pk/data/TrainStations.json',
    stations:    'https://traintracking.pk/data/StationsData.json',
    live:        'https://traintracking.pk/api/live-trains',
  },

   // ADD THIS NEW SECTION BELOW
  LIVE_TELEMETRY: {
    base_url: 'https://wdlhkrsiijccwcwydeij.supabase.co/functions/v1/train-positions',
  },
  FALLBACK: {
    // Replace YOUR_USERNAME and YOUR_REPO with your GitHub details later
    // For now, we leave these as placeholders
    trains:     'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/trains.json',
    timetables: 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/timetables.json',
    stations:   'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/stations.json',
  }
}

module.exports = SOURCES