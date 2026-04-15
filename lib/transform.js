function normalizeTrain(raw) {
  const desc = raw.TrainDescription || '';
  const toIdx = desc.toUpperCase().indexOf(' TO ');
  
  return {
    id:          raw.TrainId,
    trainNumber: raw.TrainNumber,
    name:        raw.TrainName,
    nameUrdu:    raw.TrainNameUR,
    origin:      toIdx > -1 ? desc.slice(0, toIdx).trim() : '',
    destination: toIdx > -1 ? desc.slice(toIdx + 4).trim() : '',
    direction:   raw.IsUp ? 'UP' : 'DN',
    isLive:      raw.IsLive || false,
    imei:        raw.Imei,
  };
}

function normalizeStation(raw) {
  return {
    id:        raw.StationDetailsId,
    name:      raw.StationName,
    nameUrdu:  raw.StationNameUR,
    city:      (raw.City || '').trim(),
    lat:       raw.Latitude,
    lng:       raw.Longitude,
    isActive:  raw.IsActive,
  };
}

function normalizeTimetableStop(raw) {
  return {
    stop:      raw.OrderNumber,
    stationId: raw.StationId,
    station:   raw.StationName,
    arrival:   raw.ArrivalTime   || '--:--',
    departure: raw.DepartureTime || '--:--',
    lat:       raw.Latitude,
    lng:       raw.Longitude,
    day:       raw.DayCount ? `Day ${Math.floor(raw.DayCount) + 1}` : 'Day 1',
    isDayChanged: !!raw.IsDayChanged,
  };
}

function buildSlug(trainName) {
  return trainName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

module.exports = {
  normalizeTrain,
  normalizeStation,
  normalizeTimetableStop,
  buildSlug,
};