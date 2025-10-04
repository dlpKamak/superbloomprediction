document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    const bloomEvents = [
        { id: 1, location: 'California Poppy Fields', lat: 34.5, lng: -118.2, intensity: 0.9, species: 'Eschscholzia californica', peak: '2024-04-15', ecosystem: 'Mediterranean', pollinators: ['Bees', 'Beetles'] },
        { id: 2, location: 'Texas Bluebonnets', lat: 30.3, lng: -97.7, intensity: 0.8, species: 'Lupinus texensis', peak: '2024-03-20', ecosystem: 'Prairie', pollinators: ['Bees', 'Hummingbirds'] },
        { id: 3, location: 'Japanese Cherry Blossoms', lat: 35.7, lng: 139.7, intensity: 0.95, species: 'Prunus serrulata', peak: '2024-04-05', ecosystem: 'Temperate', pollinators: ['Bees', 'Beetles'] },
        { id: 4, location: 'Dutch Tulip Fields', lat: 52.3, lng: 4.9, intensity: 0.85, species: 'Tulipa gesneriana', peak: '2024-04-25', ecosystem: 'Agricultural', pollinators: ['Bees'] },
        { id: 5, location: 'Amazon Rainforest Canopy', lat: -3.1, lng: -60.0, intensity: 0.75, species: 'Mixed tropical species', peak: '2024-05-01', ecosystem: 'Tropical Rainforest', pollinators: ['Bees', 'Birds', 'Bats'] }
    ];

    // State
    let map;
    let nasaLayer;
    let isPlaying = false;
    let animationInterval;
    let currentDate = new Date('2024-04-15');
    let showNASALayer = true;
    let layerOpacity = 0.6;

    // Initialize map
    map = L.map('map').setView([20, 0], 2);

    // Base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Function to get bloom color
    function getBloomColor(intensity) {
        if (intensity >= 0.9) return '#ec4899';
        if (intensity >= 0.7) return '#fbbf24';
        if (intensity >= 0.5) return '#4ade80';
        return '#93c5fd';
    }

    // Function to update NASA layer
    function updateNASALayer() {
        if (nasaLayer) {
            map.removeLayer(nasaLayer);
        }
        if (showNASALayer) {
            const dateStr = currentDate.toISOString().split('T')[0];
            nasaLayer = L.tileLayer(
                `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${dateStr}/250m/{z}/{y}/{x}.png`,
                {
                    attribution: 'NASA GIBS MODIS Terra NDVI',
                    opacity: layerOpacity,
                    maxZoom: 9
                }
            ).addTo(map);
        }
    }

    // Add bloom markers
    bloomEvents.forEach(event => {
        const marker = L.circleMarker([event.lat, event.lng], {
            radius: 8 + event.intensity * 12,
            fillColor: getBloomColor(event.intensity),
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
            <div style="font-family: sans-serif;">
                <strong>${event.location}</strong><br/>
                <em>${event.species}</em><br/>
                Intensity: ${(event.intensity * 100).toFixed(0)}%<br/>
                Peak: ${event.peak}<br/>
                Ecosystem: ${event.ecosystem}
            </div>
        `);
    });

    // Initialize NASA layer
    updateNASALayer();

    // Render bloom events
    function renderBloomEvents() {
        const container = document.getElementById('bloom-events');
        container.innerHTML = bloomEvents.map(event => `
            <div class="bloom-event" onclick="map.setView([${event.lat}, ${event.lng}], 8)">
                <div class="bloom-header">
                    <div class="bloom-title">${event.location}</div>
                    <div class="intensity-badge" style="background: ${getBloomColor(event.intensity)}">
                        ${(event.intensity * 100).toFixed(0)}%
                    </div>
                </div>
                <div class="bloom-details">
                    <div>
                        <span class="bloom-label">Key Pollinators:</span>
                        <div class="pollinators">
                            ${event.pollinators.map(p => `<span class="pollinator-tag">${p}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="bloom-footer">
                    Peak: ${event.peak} • Coordinates: ${event.lat}°, ${event.lng}°
                </div>
            </div>
        `).join('');
    }

    // Update alerts
    function updateAlerts() {
        const alertsContainer = document.getElementById('alerts-container');
        const alerts = bloomEvents.filter(event => {
            const peakDate = new Date(event.peak);
            const daysDiff = Math.abs(currentDate - peakDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7 && event.intensity > 0.8;
        });

        document.getElementById('alert-count').textContent = alerts.length;

        if (alerts.length > 0) {
            alertsContainer.innerHTML = alerts.map(alert => `
                <div class="alert-box">
                    <div class="alert-location">${alert.location}</div>
                    <div class="alert-date">Peak bloom expected: ${alert.peak}</div>
                    <div class="alert-intensity">Intensity: ${(alert.intensity * 100).toFixed(0)}%</div>
                </div>
            `).join('');
        } else {
            alertsContainer.innerHTML = '<p class="no-alerts">No active bloom alerts for current timeframe</p>';
        }
    }

    // Date picker change
    document.getElementById('date-picker').addEventListener('change', function(e) {
        currentDate = new Date(e.target.value);
        updateNASALayer();
        updateAlerts();
    });

    // Opacity slider
    document.getElementById('opacity-slider').addEventListener('input', function(e) {
        layerOpacity = parseFloat(e.target.value);
        document.getElementById('opacity-value').textContent = (layerOpacity * 100).toFixed(0) + '%';
        updateNASALayer();
    });

    // Toggle NASA layer
    document.getElementById('toggle-layer-btn').addEventListener('click', function() {
        showNASALayer = !showNASALayer;
        this.classList.toggle('inactive', !showNASALayer);
        updateNASALayer();
    });

    // Animation
    document.getElementById('animate-btn').addEventListener('click', function() {
        isPlaying = !isPlaying;
        const playIcon = document.getElementById('play-icon');

        if (isPlaying) {
            playIcon.textContent = '⏸';
            animationInterval = setInterval(() => {
                currentDate.setDate(currentDate.getDate() + 1);
                document.getElementById('date-picker').value = currentDate.toISOString().split('T')[0];
                updateNASALayer();
                updateAlerts();
            }, 1000);
        } else {
            playIcon.textContent = '▶';
            clearInterval(animationInterval);
        }
    });

    // Region select
    document.getElementById('region-select').addEventListener('change', function(e) {
        const regions = {
            'global': [20, 0, 2],
            'north-america': [40, -100, 4],
            'europe': [50, 10, 4],
            'asia': [35, 105, 4],
            'south-america': [-10, -60, 4]
        };
        const [lat, lng, zoom] = regions[e.target.value];
        map.setView([lat, lng], zoom);
    });

    // Initial render
    renderBloomEvents();
    updateAlerts();
});