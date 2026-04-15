const { updateFile } = require('../../lib/github');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers['x-cron-secret'];
  if (authHeader !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = [];
  const timestamp = new Date().toISOString();

  const sources = [
    { name: 'trains', url: 'https://traintracking.pk/data/Trains.json', path: 'data/trains.json', extract: d => d.Response || d },
    { name: 'stations', url: 'https://traintracking.pk/data/StationsData.json', path: 'data/stations.json', extract: d => d.Response || d },
    { name: 'timetables', url: 'https://traintracking.pk/data/TrainStations.json', path: 'data/timetables.json', extract: d => Array.isArray(d) ? d : (d.Response || d) },
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url);
      const raw  = await response.json();
      const data = source.extract(raw);

      await updateFile(
        source.path,
        { updatedAt: timestamp, data },
        `chore: auto-backup ${source.name} data ${timestamp}`
      );

      results.push({ name: source.name, success: true, records: data.length });
    } catch (error) {
      results.push({ name: source.name, success: false, error: error.message });
    }
  }

  return res.status(200).json({ success: true, backupAt: timestamp, results });
};