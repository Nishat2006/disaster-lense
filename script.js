// Disaster Lens Main JS

// Show loader for map
const mapLoader = document.getElementById('map-loader');
mapLoader.style.display = 'block';

// Initialize map
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

map.on('load', () => {
  mapLoader.style.display = 'none';
});
setTimeout(() => mapLoader.style.display = 'none', 1200); // fallback

// Fetch and display disasters
const disasterFeedLoader = document.getElementById('disaster-feed-loader');
disasterFeedLoader.style.display = 'block';
fetch('/api/disasters')
  .then(res => res.json())
  .then(disasters => {
    disasters.forEach(d => {
      const icon = L.divIcon({
        className: 'disaster-anim-icon',
        html: `<div class='disaster-pulse'></div><img src='https://cdn-icons-png.flaticon.com/512/616/616494.png' style='width:32px;height:32px;position:absolute;top:0;left:0;'>`,
        iconSize: [32,32],
        iconAnchor: [16,16]
      });
      L.marker([d.lat, d.lng], {icon})
        .addTo(map)
        .bindPopup(`<b>${d.type}</b><br>${d.location}<br>Severity: <span class="severity">${d.severity}</span><br><small>${new Date(d.time).toLocaleString()}</small>`);
    });
    document.getElementById('disaster-feed').innerHTML = disasters.map(d => `
      <div class="disaster-card">
        <b>${d.type}</b> in <span>${d.location}</span><br>
        <span class="severity">${d.severity}</span> &middot; <small>${new Date(d.time).toLocaleString()}</small>
      </div>
    `).join('');
    disasterFeedLoader.style.display = 'none';
  });

// Fetch and display user reports
const reportFeedLoader = document.getElementById('report-feed-loader');
function loadReports() {
  reportFeedLoader.style.display = 'block';
  fetch('/api/reports')
    .then(res => res.json())
    .then(reports => {
      document.getElementById('report-feed').innerHTML = reports.map(r => `
        <div class="report-card">
          <b>${r.name || 'Anonymous'}</b> reported: <br>
          <span>${r.description}</span><br>
          <small>${r.location || 'Unknown location'}</small>
        </div>
      `).join('');
      reports.forEach(r => {
        if (r.lat && r.lng) {
          L.circleMarker([r.lat, r.lng], {radius: 8, color: '#e11d48', fillOpacity: 0.7, className: 'report-anim-marker'}).addTo(map)
            .bindPopup(`<b>Report</b><br>${r.description}<br><small>${r.location || ''}</small>`);
        }
      });
      reportFeedLoader.style.display = 'none';
    });
}
loadReports();

// Handle report submission
const reportForm = document.getElementById('reportForm');
const reportSubmitLoader = document.getElementById('report-submit-loader');
reportForm.onsubmit = function(e) {
  e.preventDefault();
  reportSubmitLoader.style.display = 'block';
  const data = {
    name: reportForm.name.value,
    description: reportForm.description.value,
    location: reportForm.location.value,
    lat: parseFloat(reportForm.lat.value) || null,
    lng: parseFloat(reportForm.lng.value) || null
  };
  fetch('/api/reports', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }).then(res => res.json())
    .then(() => {
      reportForm.reset();
      loadReports();
      reportSubmitLoader.style.display = 'none';
      alert('Report submitted!');
    }).catch(() => {
      reportSubmitLoader.style.display = 'none';
      alert('Failed to submit report.');
    });
};

// Optional: Autofill lat/lng from map click
map.on('click', function(e) {
  reportForm.lat.value = e.latlng.lat.toFixed(5);
  reportForm.lng.value = e.latlng.lng.toFixed(5);
});

// Geocoding with Nominatim for Find Coordinates button
const findCoordsBtn = document.getElementById('findCoordsBtn');
const locationInput = document.getElementById('locationInput');
const geocodeStatus = document.getElementById('geocodeStatus');
findCoordsBtn.onclick = function() {
  const query = locationInput.value.trim();
  if (!query) {
    geocodeStatus.textContent = 'Please enter a location.';
    return;
  }
  geocodeStatus.textContent = 'Finding coordinates...';
  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
    .then(res => res.json())
    .then(results => {
      if (results && results.length > 0) {
        const lat = results[0].lat;
        const lon = results[0].lon;
        reportForm.lat.value = parseFloat(lat).toFixed(5);
        reportForm.lng.value = parseFloat(lon).toFixed(5);
        geocodeStatus.textContent = 'Coordinates found!';
      } else {
        geocodeStatus.textContent = 'No results found.';
      }
    })
    .catch(() => {
      geocodeStatus.textContent = 'Error finding coordinates.';
    });
}; 