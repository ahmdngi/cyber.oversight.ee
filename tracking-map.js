(function(){
  const vessels=[
    {
      id:'atlantic',
      name:'M/V DEMO BALTIC',
      imo:'IMO 0097421 · SIMULATED',
      type:'Bulk Carrier (Demo)',
      photo:'vessel-bulk.jpg',
      pos:[42,-10],
      route:[[51.8,3.5],[48,-6],[44,-12],[42,-10],[38,-8]],
      speed:'12.4 kn',
      heading:'074°',
      draft:'9.7 m',
      shield:'NOMINAL · 0 EXPOSURE',
      shieldClass:'safe',
      edgeNode:'Haris Node v2.4 (Active)',
      gpsDrift:'0.0 ns (Verified)',
      vsatPort:'Port 443 (TLS 1.3)',
      uplink:'Inmarsat L-Band · Enclave OK',
      threatLevel:'A+ / SECURE'
    },
    {
      id:'redsea',
      name:'M/V SIM RED SEA',
      imo:'IMO 0094102 · SIMULATED',
      type:'Crude Oil Tanker (Demo)',
      photo:'vessel-tanker.jpg',
      pos:[15,42],
      route:[[12,38],[15,42],[20,48]],
      speed:'16.8 kn',
      heading:'118°',
      draft:'14.2 m',
      shield:'GPS RECOVERY ARMED',
      shieldClass:'safe',
      edgeNode:'Haris Node v2.4 (Active)',
      gpsDrift:'+340ns (Spoofing Shielded)',
      vsatPort:'Port 22 (SSH Enclave)',
      uplink:'Iridium Certus · Encrypted',
      threatLevel:'A / MITIGATED'
    },
    {
      id:'gulf',
      name:'M/V TEST GULF',
      imo:'IMO 0098110 · SIMULATED',
      type:'Container Ship (Demo)',
      photo:'vessel-container.jpg',
      pos:[25,53],
      route:[[25,48],[25,53],[27,57]],
      speed:'11.2 kn',
      heading:'032°',
      draft:'11.5 m',
      shield:'PORT 23 ISOLATED BY EDGE',
      shieldClass:'warn',
      edgeNode:'Haris Node v2.4 (Active)',
      gpsDrift:'0.0 ns (Nominal)',
      vsatPort:'Port 23 (Telnet Blocked)',
      uplink:'VSAT Ku-Band · Filtered',
      threatLevel:'B+ / ISOLATED'
    },
    {
      id:'northsea',
      name:'M/V LAB NORTHSTAR',
      imo:'IMO 0096541 · SIMULATED',
      type:'LNG Carrier (Demo)',
      photo:'vessel-lng.jpg',
      pos:[57,4],
      route:[[57,4],[55,10],[59,18]],
      speed:'18.1 kn',
      heading:'086°',
      draft:'10.8 m',
      shield:'CVE PATCH SCHEDULED',
      shieldClass:'warn',
      edgeNode:'Haris Node v2.4 (Active)',
      gpsDrift:'0.0 ns (Nominal)',
      vsatPort:'Sailor 900 (Vessel LAN)',
      uplink:'FleetBroadband · Guarded',
      threatLevel:'B / ATTN'
    }
  ];

  const TILE_DARK = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  const TILE_LIGHT = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  const TILE_SAT = 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  function init(){
    const el = document.getElementById('fleet-map');
    if(!el || !window.L) return;

    // Initialize map
    const map = L.map('fleet-map', {
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 12
    }).setView([38, -5], 5);

    // Single zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    let activeTileLayer = null;

    function getThemeTileUrl() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      return isLight ? TILE_LIGHT : TILE_DARK;
    }

    function setTileLayer(url) {
      if (activeTileLayer) {
        map.removeLayer(activeTileLayer);
      }
      activeTileLayer = L.tileLayer(url, {
        maxZoom: 12,
        crossOrigin: true
      }).addTo(map);
    }

    // Set initial tile layer
    setTileLayer(getThemeTileUrl());

    function syncMapTheme(){
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      el.classList.toggle('map-light', isLight);
      el.classList.toggle('map-dark', !isLight);
      setTileLayer(getThemeTileUrl());

      // update polyline colors
      const lineColor = isLight ? '#5d8200' : '#a8d506';
      routes.forEach(r => r.setStyle({ color: lineColor }));
    }

    new MutationObserver(syncMapTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    const markers = {};
    const routes = [];
    const geofences = [];

    vessels.forEach(v => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      
      // Cyber Defense Geofence Circle (Tactical radar range)
      const fenceColor = v.shieldClass === 'warn' ? '#ebb432' : (isLight ? '#5d8200' : '#a8d506');
      const fence = L.circle(v.pos, {
        radius: 240000,
        color: fenceColor,
        weight: 1,
        dashArray: '4 8',
        opacity: .45,
        fillColor: fenceColor,
        fillOpacity: .05
      }).addTo(map);
      geofences.push(fence);

      // Route lane
      const r = L.polyline(v.route, {
        color: isLight ? '#5d8200' : '#a8d506',
        weight: 2,
        opacity: .8,
        dashArray: '6 8'
      }).addTo(map);
      routes.push(r);

      const isWarn = v.shieldClass === 'warn';
      const icon = L.divIcon({
        className: 'fleet-pin' + (isWarn ? ' warn-pin' : ''),
        html: '<span class="pin-ring"></span><span class="pin-core"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(v.pos, { icon }).addTo(map).bindPopup(
        `<div class="popup-hud-tag">
          <div class="hud-tag-top">
            <strong class="hud-tag-name">${v.name}</strong>
            <span class="hud-badge ${isWarn ? 'badge-amber' : 'badge-lime'}">${v.threatLevel}</span>
          </div>
          <div class="hud-tag-bot">
            <span>${v.speed}</span>
            <span class="hud-sep">·</span>
            <span>${v.heading}</span>
            <span class="hud-sep">·</span>
            <span class="hud-shield-tag ${isWarn ? 'warn' : 'safe'}">${isWarn ? 'ISOLATED' : 'SHIELD OK'}</span>
          </div>
        </div>`,
        {
          autoPan: true,
          autoPanPaddingTopLeft: [15, 50],
          autoPanPaddingBottomRight: [15, 20],
          offset: [0, -8],
          closeButton: false
        }
      );

      marker.on('click', () => {
        stopAutoCycle();
        select(v.id, true);
        setTimeout(startAutoCycle, 5000);
      });
      markers[v.id] = marker;
    });

    let currentIndex = 0;
    let autoPlayTimer = null;

    function select(id, userInitiated){
      const v = vessels.find(x => x.id === id);
      if(!v) return;

      const idx = vessels.findIndex(x => x.id === id);
      if(idx !== -1) currentIndex = idx;

      document.querySelectorAll('.vessel-row').forEach(x => x.classList.toggle('active', x.dataset.vessel === id));
      
      const name = document.getElementById('selected-vessel');
      const heading = document.getElementById('selected-heading');
      const draft = document.getElementById('selected-draft');
      const shield = document.getElementById('selected-shield');
      const edge = document.getElementById('selected-edge');
      const gps = document.getElementById('selected-gps');
      const uplink = document.getElementById('selected-uplink');
      const photo = document.getElementById('selected-photo');

      if(name) name.textContent = v.name;
      if(heading) heading.textContent = v.heading;
      if(draft) draft.textContent = v.draft;
      if(shield) {
        shield.textContent = v.shield;
        shield.className = v.shieldClass === 'warn' ? 'cyber-badge warn' : 'cyber-badge safe';
      }
      if(edge) edge.textContent = v.edgeNode;
      if(gps) gps.textContent = v.gpsDrift;
      if(uplink) uplink.textContent = v.uplink;
      if(photo && v.photo) {
        photo.src = v.photo;
        photo.alt = v.name;
      }

      Object.entries(markers).forEach(([key, marker]) => {
        const markerEl = marker.getElement();
        if(markerEl) markerEl.classList.toggle('selected', key === id);
      });

      const latOffset = window.innerWidth < 768 ? 4.8 : 3.0;
      map.flyTo([v.pos[0] + latOffset, v.pos[1]], 5, { duration: .6 });
      markers[id].openPopup();
    }

    function startAutoCycle(){
      stopAutoCycle();
      autoPlayTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % vessels.length;
        select(vessels[currentIndex].id, false);
      }, 3000);
    }

    function stopAutoCycle(){
      if(autoPlayTimer) clearInterval(autoPlayTimer);
    }

    document.querySelectorAll('.vessel-row').forEach(row => {
      row.addEventListener('click', () => {
        stopAutoCycle();
        select(row.dataset.vessel, true);
        setTimeout(startAutoCycle, 5000);
      });
    });

    // Layer switcher buttons
    const mapBtns = document.querySelectorAll('.map-btn');
    mapBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mapBtns.forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mapLayer;
        if(mode === 'dark') {
          setTileLayer(TILE_DARK);
        } else if(mode === 'sat') {
          setTileLayer(TILE_SAT);
        } else {
          setTileLayer(TILE_LIGHT);
        }
      });
    });

    select('atlantic', false);
    startAutoCycle();
    setTimeout(() => map.invalidateSize(), 200);
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function(){
  const css = document.createElement('style');
  css.textContent = `
    .tracking-shell {
      margin-top: 34px;
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
      background: var(--panel);
      box-shadow: 0 24px 60px rgba(0,0,0,.5);
      position: relative;
      z-index: 2;
    }
    .tracking-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid var(--line);
      font-family: var(--mono);
      font-size: .64rem;
      letter-spacing: .12em;
      color: var(--text);
      background: rgba(6,12,7,.75);
      backdrop-filter: blur(12px);
    }
    .tracking-toolbar > div:first-child {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tracking-toolbar small {
      color: var(--dim);
      font-size: .56rem;
      margin-left: 9px;
    }
    .tracking-live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--lime);
      box-shadow: 0 0 10px var(--lime);
      animation: feedPulse 2s infinite;
    }
    .tracking-actions { display: flex; gap: 6px; }
    .map-btn {
      border: 1px solid var(--line);
      background: rgba(255,255,255,.04);
      color: var(--mut);
      padding: 6px 12px;
      border-radius: 6px;
      font: inherit;
      font-size: .58rem;
      cursor: pointer;
      transition: all .2s;
    }
    .map-btn.active, .map-btn:hover {
      color: var(--void);
      background: var(--lime);
      border-color: var(--lime);
      font-weight: 500;
    }

    .tracking-grid {
      display: grid;
      grid-template-columns: 1fr 330px;
      min-height: 520px;
    }
    .tracking-map-wrap {
      position: relative;
      min-height: 520px;
      background: #080d09;
    }
    .fleet-map {
      position: absolute;
      inset: 0;
      overflow: hidden;
      cursor: grab;
      background: #080d09;
    }
    .fleet-map:active { cursor: grabbing; }

    /* Map HUD Overlays */
    .map-hud-tl {
      position: absolute;
      top: 16px;
      left: 18px;
      z-index: 500;
      font: .54rem var(--mono);
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--lime);
      background: rgba(6,12,7,.85);
      border: 1px solid var(--lime-dim);
      padding: 5px 10px;
      border-radius: 6px;
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .map-hud-tl i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--lime);
      box-shadow: 0 0 8px var(--lime);
    }
    .map-hud-scanline {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 400;
      background: linear-gradient(rgba(168,213,6,.015) 50%, rgba(0,0,0,.15) 50%);
      background-size: 100% 4px;
      opacity: .65;
    }

    .leaflet-container {
      font-family: var(--mono);
      background: #080d09;
    }
    .leaflet-control-zoom {
      border: 1px solid var(--line) !important;
      border-radius: 8px !important;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,.5) !important;
      margin-right: 18px !important;
      margin-bottom: 18px !important;
    }
    .leaflet-control-zoom a {
      color: var(--lime) !important;
      background: var(--panel) !important;
      border-color: var(--line) !important;
      transition: background .2s, color .2s;
    }
    .leaflet-control-zoom a:hover {
      background: var(--lime) !important;
      color: var(--void) !important;
    }

    /* Tactical HUD Popup Tag */
    .leaflet-popup-content-wrapper {
      border-radius: 8px !important;
      background: rgba(9,15,10,.94) !important;
      color: var(--text) !important;
      border: 1px solid var(--line) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,.65) !important;
      overflow: hidden !important;
      padding: 0 !important;
      backdrop-filter: blur(12px);
    }
    .leaflet-popup-tip {
      background: rgba(9,15,10,.94) !important;
    }
    .leaflet-popup-content {
      font: 11px var(--mono) !important;
      color: var(--text) !important;
      margin: 0 !important;
      width: auto !important;
      min-width: 175px !important;
      max-width: 230px !important;
    }
    .popup-hud-tag {
      padding: 7px 11px 8px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .hud-tag-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .hud-tag-name {
      font: 600 12px var(--sans);
      color: var(--text);
      white-space: nowrap;
      letter-spacing: .02em;
    }
    .hud-badge {
      display: inline-block;
      font: 600 .48rem var(--mono);
      letter-spacing: .08em;
      padding: 1px 5px;
      border-radius: 3px;
      white-space: nowrap;
    }
    .badge-lime { background: rgba(168,213,6,.15); color: var(--lime); border: 1px solid var(--lime-dim); }
    .badge-amber { background: rgba(235,180,50,.18); color: #ebb432; border: 1px solid rgba(235,180,50,.4); }
    .hud-tag-bot {
      display: flex;
      align-items: center;
      gap: 5px;
      font: .54rem var(--mono);
      color: var(--dim);
    }
    .hud-sep { opacity: .4; }
    .hud-shield-tag {
      font-weight: 600;
      letter-spacing: .06em;
    }
    .hud-shield-tag.safe { color: var(--lime); }
    .hud-shield-tag.warn { color: #ebb432; }

    /* Pins */
    .fleet-pin { background: none !important; border: 0 !important; position: relative; }
    .fleet-pin .pin-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--lime);
      border: 2px solid #fff;
      box-shadow: 0 0 10px var(--lime);
      transition: all .2s;
    }
    .fleet-pin .pin-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid rgba(168,213,6,.5);
      animation: pinRadarWave 2s infinite linear;
    }
    .fleet-pin.warn-pin .pin-core {
      background: #ebb432;
      box-shadow: 0 0 10px #ebb432;
    }
    .fleet-pin.warn-pin .pin-ring {
      border-color: rgba(235,180,50,.5);
    }
    .fleet-pin.selected .pin-core {
      background: var(--void);
      transform: translate(-50%,-50%) scale(1.3);
      border-color: var(--lime);
      box-shadow: 0 0 0 3px var(--lime), 0 0 20px var(--lime);
    }
    @keyframes pinRadarWave {
      0% { transform: translate(-50%,-50%) scale(0.6); opacity: 1; }
      100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
    }

    .map-scale, .map-coordinates {
      position: absolute;
      z-index: 500;
      bottom: 16px;
      font: .56rem var(--mono);
      letter-spacing: .12em;
      color: var(--mut);
      background: rgba(6,12,7,.88);
      backdrop-filter: blur(8px);
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--line);
    }
    .map-scale { left: 18px; border-bottom: 2px solid var(--lime); }
    .map-coordinates { right: 70px; color: var(--lime); }

    /* Vessel Panel */
    .vessel-panel {
      border-left: 1px solid var(--line);
      background: rgba(8,14,9,.88);
      backdrop-filter: blur(22px);
      padding: 16px 0;
      display: flex;
      flex-direction: column;
    }
    .panel-heading {
      display: flex;
      justify-content: space-between;
      padding: 0 18px 12px;
      font: .62rem var(--mono);
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--dim);
      border-bottom: 1px solid var(--line);
    }
    .panel-heading b { color: var(--lime); font-weight: 500; }

    .vessel-row {
      width: 100%;
      display: grid;
      grid-template-columns: 10px 1fr auto;
      gap: 10px;
      align-items: center;
      text-align: left;
      padding: 11px 18px;
      border: 0;
      border-bottom: 1px solid var(--line);
      background: transparent;
      color: var(--mut);
      cursor: pointer;
      transition: background .2s var(--ease-spring), color .2s;
    }
    .vessel-row:hover, .vessel-row.active {
      background: rgba(168,213,6,.08);
      color: var(--text);
    }
    .vessel-row.active { box-shadow: inset 3px 0 0 var(--lime); }
    .vessel-row b, .vessel-row small { display: block; }
    .vessel-row b { font: 500 .74rem var(--sans); color: var(--text); }
    .vessel-row small { font: .52rem var(--mono); color: var(--dim); margin-top: 1px; }
    .vessel-row strong { font: .60rem var(--mono); color: var(--lime); font-weight: 500; }

    .vessel-status {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--lime);
      box-shadow: 0 0 7px var(--lime);
    }
    .vessel-status.warning {
      background: #ebb432;
      box-shadow: 0 0 7px #ebb432;
    }

    .vessel-detail {
      padding: 16px 18px;
      border-top: 1px solid var(--line);
      margin-top: auto;
      background: rgba(0,0,0,.25);
    }
    .detail-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .detail-label {
      font: .54rem var(--mono);
      letter-spacing: .15em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .cyber-badge {
      font: 600 .50rem var(--mono);
      letter-spacing: .1em;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
    }
    .cyber-badge.safe { background: rgba(168,213,6,.15); color: var(--lime); border: 1px solid var(--lime-dim); }
    .cyber-badge.warn { background: rgba(235,180,50,.18); color: #ebb432; border: 1px solid rgba(235,180,50,.35); }

    .vessel-detail h3 {
      font: 500 1.2rem var(--serif);
      margin: 0 0 10px;
      color: var(--text);
    }
    .vessel-preview-box {
      width: 100%;
      height: 90px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 12px;
      border: 1px solid var(--line);
      background: rgba(0,0,0,.3);
    }
    .vessel-thumb-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform .3s var(--ease-spring);
    }
    .vessel-preview-box:hover .vessel-thumb-preview {
      transform: scale(1.05);
    }

    .cyber-spec-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font: .56rem var(--mono);
      color: var(--dim);
      margin-bottom: 10px;
    }
    .cyber-spec-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: rgba(255,255,255,.02);
      border: 1px solid var(--line);
      padding: 5px 8px;
      border-radius: 5px;
    }
    .cyber-spec-item b {
      color: var(--text);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cyber-spec-item.full {
      grid-column: 1 / -1;
    }

    .detail-route {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      font: .50rem var(--mono);
      color: var(--dim);
    }
    .detail-route i { height: 1px; flex: 1; background: var(--lime); opacity: .5; }

    /* ── Light Theme Overrides ── */
    :root[data-theme="light"] .tracking-shell {
      background: #fbfcf7;
      border-color: rgba(20,23,19,.10);
      box-shadow: 0 20px 50px rgba(0,0,0,.08);
    }
    :root[data-theme="light"] .tracking-toolbar {
      background: #edf3e7;
      border-bottom-color: rgba(20,23,19,.10);
      color: #141713;
    }
    :root[data-theme="light"] .tracking-toolbar small { color: #6b7066; }
    :root[data-theme="light"] .vessel-panel {
      background: #f4f8ee;
      border-left-color: rgba(20,23,19,.10);
    }
    :root[data-theme="light"] .vessel-detail {
      background: #e9f0e1;
      border-top-color: rgba(20,23,19,.10);
    }
    :root[data-theme="light"] .cyber-spec-item {
      background: #ffffff;
      border-color: rgba(20,23,19,.10);
    }
    :root[data-theme="light"] .cyber-spec-item b { color: #141713; }
    :root[data-theme="light"] .panel-heading {
      color: #6b7066;
      border-bottom-color: rgba(20,23,19,.10);
    }
    :root[data-theme="light"] .panel-heading b { color: #5d8200; }
    :root[data-theme="light"] .vessel-row {
      border-bottom-color: rgba(20,23,19,.08);
      color: #43483f;
    }
    :root[data-theme="light"] .vessel-row b { color: #141713; font-weight: 600; }
    :root[data-theme="light"] .vessel-row small { color: #6b7066; }
    :root[data-theme="light"] .vessel-row strong { color: #5d8200; font-weight: 600; }
    :root[data-theme="light"] .vessel-row:hover,
    :root[data-theme="light"] .vessel-row.active {
      background: rgba(107,141,0,.14);
      color: #141713;
    }
    :root[data-theme="light"] .vessel-row.active {
      box-shadow: inset 3px 0 0 #5d8200;
    }
    :root[data-theme="light"] .vessel-detail h3 { color: #141713; }
    :root[data-theme="light"] .vessel-preview-box { background: #e2e9d8; border-color: rgba(20,23,19,.12); }
    :root[data-theme="light"] .detail-label { color: #6b7066; }
    :root[data-theme="light"] .detail-route { color: #6b7066; }
    :root[data-theme="light"] .detail-route i { background: #5d8200; }
    :root[data-theme="light"] .map-btn {
      background: #ffffff;
      border-color: rgba(20,23,19,.15);
      color: #43483f;
    }
    :root[data-theme="light"] .map-btn.active,
    :root[data-theme="light"] .map-btn:hover {
      background: #6b8d00;
      border-color: #6b8d00;
      color: #ffffff;
    }
    :root[data-theme="light"] .map-hud-tl {
      background: rgba(255,255,255,.94);
      border-color: rgba(107,141,0,.4);
      color: #4d7c0f;
    }
    :root[data-theme="light"] .map-scale,
    :root[data-theme="light"] .map-coordinates {
      background: rgba(255,255,255,.94);
      border-color: rgba(20,23,19,.12);
      color: #43483f;
    }
    :root[data-theme="light"] .map-scale { border-bottom-color: #5d8200; }
    :root[data-theme="light"] .map-coordinates { color: #5d8200; }
    :root[data-theme="light"] .leaflet-container { background: #eaf1e3; }
    :root[data-theme="light"] .tracking-map-wrap { background: #eaf1e3; }
    :root[data-theme="light"] .fleet-map { background: #eaf1e3; }
    :root[data-theme="light"] .leaflet-popup-content-wrapper {
      background: #ffffff !important;
      color: #141713 !important;
      border-color: rgba(20,23,19,.12) !important;
      box-shadow: 0 12px 32px rgba(0,0,0,.15) !important;
    }
    :root[data-theme="light"] .leaflet-popup-tip { background: #ffffff !important; }
    :root[data-theme="light"] .hud-tag-name { color: #141713; }
    :root[data-theme="light"] .hud-tag-bot { color: #6b7066; }
    :root[data-theme="light"] .hud-shield-tag.safe { color: #5d8200; }
    :root[data-theme="light"] .leaflet-control-zoom a {
      background: #ffffff !important;
      color: #5d8200 !important;
      border-color: rgba(20,23,19,.15) !important;
    }
    :root[data-theme="light"] .leaflet-control-zoom a:hover {
      background: #6b8d00 !important;
      color: #ffffff !important;
    }

    @media(max-width:900px){
      .tracking-grid { grid-template-columns: 1fr; }
      .vessel-panel { border-left: 0; border-top: 1px solid var(--line); }
      .tracking-map-wrap { min-height: 380px; }
      .tracking-toolbar { align-items: flex-start; gap: 10px; flex-direction: column; }
      .tracking-toolbar small { display: block; margin: 4px 0 0 16px; }
    }

    @media(max-width:600px){
      .tracking-map-wrap { min-height: 360px; }
      .map-scale { display: none; }
      .map-coordinates {
        left: 10px;
        right: auto;
        bottom: 10px;
        font-size: .46rem;
        padding: 4px 8px;
      }
      .map-hud-tl {
        top: 8px;
        left: 8px;
        font-size: .44rem;
        padding: 3px 7px;
      }
      .leaflet-control-zoom {
        margin-right: 10px !important;
        margin-bottom: 10px !important;
      }
      .leaflet-popup-content {
        min-width: 160px !important;
        max-width: 210px !important;
      }
      .hud-tag-name {
        font-size: 11px;
      }
      .hud-tag-bot {
        font-size: .50rem;
      }
    }
  `;
  document.head.appendChild(css);
})();
