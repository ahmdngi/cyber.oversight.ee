(function(){
  const vessels=[
    {id:'atlantic',name:'VST AMARA',imo:'IMO 9742211',type:'Crude Oil Tanker',photo:'https://static.vesselfinder.net/ship-photo/9742211-477057300-9a4dbe86ab1b07573664b00308b7b8be/1?v1',pos:[42,-10],route:[[51.8,3.5],[48,-6],[44,-12],[42,-10],[38,-8]],speed:'12.4 kn',heading:'074°'},
    {id:'redsea',name:'VICTORIA',imo:'IMO 9410234',type:'Crude Oil Tanker',photo:'https://static.vesselfinder.net/ship-photo/9410234-240960000-1ee173ef069c549017bac197b8190402/1?v1',pos:[15,42],route:[[12,38],[15,42],[20,48]],speed:'16.8 kn',heading:'118°'},
    {id:'gulf',name:'EVER GIVEN',imo:'IMO 9811000',type:'Container Ship',photo:'https://static.vesselfinder.net/ship-photo/9811000-353136000-47a37bcd0d022df56c45b94d8db6b20d/1?v1',pos:[25,53],route:[[25,48],[25,53],[27,57]],speed:'11.2 kn',heading:'032°'},
    {id:'northsea',name:'LNG Northstar',imo:'IMO 9654122',type:'LNG Carrier',photo:'https://static.vesselfinder.net/ship-photo/9311581-310565000-8e04197df64fc87e70916f2bb2ee25c1/1?v1',pos:[57,4],route:[[57,4],[55,10],[59,18]],speed:'18.1 kn',heading:'086°'}
  ];

  function init(){
    const el=document.getElementById('fleet-map');
    if(!el || !window.L) return;
    const map = L.map('fleet-map').setView([38, -5], 5);

    // OpenStreetMap tiles, free and no API key required.
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        crossOrigin: true
      }
    ).addTo(map);

    function syncMapTheme(){
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      el.classList.toggle('map-light', isLight);
      el.classList.toggle('map-dark', !isLight);
    }
    syncMapTheme();
    new MutationObserver(syncMapTheme).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});

    L.control.zoom({position:'bottomright'}).addTo(map);
    const markers={};

    vessels.forEach(v=>{
      L.polyline(v.route,{color:'#a8d506',weight:3,opacity:.7,dashArray:'8 10'}).addTo(map);
      const icon=L.divIcon({className:'fleet-pin',html:'<span></span>',iconSize:[22,22],iconAnchor:[11,11]});
      const popupPhoto=v.photo?'<img src="'+v.photo+'" alt="'+v.name+'" style="display:block;width:220px;height:112px;object-fit:cover;border-radius:7px;margin-bottom:8px" onerror="this.style.display=\'none\'">':'';
      const marker=L.marker(v.pos,{icon}).addTo(map).bindPopup(popupPhoto+'<strong>'+v.name+'</strong><br>'+v.imo+' · '+v.type+'<br><span style="color:#5d8200">AIS signal · Online</span>');
      marker.on('click',()=>select(v.id));
      markers[v.id]=marker;
    });

    function select(id){
      const v=vessels.find(x=>x.id===id); if(!v)return;
      document.querySelectorAll('.vessel-row').forEach(x=>x.classList.toggle('active',x.dataset.vessel===id));
      const name=document.getElementById('selected-vessel');
      const heading=document.getElementById('selected-heading');
      if(name)name.textContent=v.name;
      if(heading)heading.textContent=v.heading;
      Object.entries(markers).forEach(([key,marker])=>marker.getElement().classList.toggle('selected',key===id));
      map.flyTo(v.pos,5,{duration:.8});
      markers[id].openPopup();
    }

    document.querySelectorAll('.vessel-row').forEach(row=>row.addEventListener('click',()=>select(row.dataset.vessel)));
    document.querySelectorAll('.map-btn').forEach(btn=>btn.addEventListener('click',()=>{
      document.querySelectorAll('.map-btn').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
    }));
    select('atlantic');
    setTimeout(()=>map.invalidateSize(),150);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

(function(){
  const css=document.createElement('style');
  css.textContent=`
    .tracking-shell{margin-top:34px;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--panel);box-shadow:0 24px 60px rgba(0,0,0,.4)}
    .tracking-toolbar{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:.65rem;letter-spacing:.12em;color:var(--text)}
    .tracking-toolbar>div:first-child{display:flex;align-items:center;gap:9px}.tracking-toolbar small{color:var(--dim);font-size:.58rem;margin-left:9px}.tracking-live-dot{width:7px;height:7px;border-radius:50%;background:var(--lime);box-shadow:0 0 10px var(--lime);animation:feedPulse 2s infinite}.tracking-actions{display:flex;gap:5px}.map-btn{border:1px solid var(--line);background:transparent;color:var(--mut);padding:7px 10px;border-radius:7px;font:inherit;font-size:.56rem;cursor:pointer}.map-btn.active,.map-btn:hover{color:var(--void);background:var(--lime);border-color:var(--lime)}
    .tracking-grid{display:grid;grid-template-columns:1fr 310px;min-height:480px}.tracking-map-wrap{position:relative;min-height:480px;background:#0b100b}.fleet-map{position:absolute;inset:0;overflow:hidden;cursor:grab}.fleet-map:active{cursor:grabbing}.leaflet-container{font-family:var(--mono);background:#0b100b}.leaflet-control-zoom a{color:var(--lime)!important;background:var(--panel)!important;border-color:var(--line)!important}.leaflet-popup-content-wrapper{border-radius:10px}.leaflet-popup-content{font:12px var(--mono);line-height:1.65;color:#1d261c}.fleet-pin{background:none!important;border:0!important}.fleet-pin span{display:block;width:12px;height:12px;border-radius:50%;background:#a8d506;border:3px solid #fff;box-shadow:0 0 0 3px rgba(70,100,10,.34),0 0 15px rgba(80,120,0,.7);animation:mapPinPulse 2s infinite}.fleet-pin.selected span{background:#263c0a;transform:scale(1.25);box-shadow:0 0 0 4px #a8d506,0 0 20px #a8d506}@keyframes mapPinPulse{0%,100%{box-shadow:0 0 0 3px rgba(70,100,10,.34),0 0 15px rgba(80,120,0,.7)}50%{box-shadow:0 0 0 8px rgba(70,100,10,.08),0 0 22px rgba(80,120,0,.35)}}.map-scale,.map-coordinates{position:absolute;z-index:500;bottom:18px;font:.56rem var(--mono);letter-spacing:.12em;color:var(--mut);background:var(--panel);padding:5px 7px;border-radius:4px;border:1px solid var(--line)}.map-scale{left:20px;border-bottom:2px solid var(--lime)}.map-coordinates{right:20px;color:var(--lime)}.vessel-panel{border-left:1px solid var(--line);background:rgba(18,23,15,.55);backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);padding:18px 0}.panel-heading{display:flex;justify-content:space-between;padding:0 18px 14px;font:.62rem var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--dim);border-bottom:1px solid var(--line)}.panel-heading b{color:var(--lime);font-weight:500}.vessel-row{width:100%;display:grid;grid-template-columns:10px 1fr auto;gap:9px;align-items:center;text-align:left;padding:14px 18px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--mut);cursor:pointer;transition:background .2s var(--ease-spring),color .2s}.vessel-row:hover,.vessel-row.active{background:rgba(168,213,6,.08);color:var(--text)}.vessel-row.active{box-shadow:inset 3px 0 0 var(--lime)}.vessel-row b,.vessel-row small{display:block}.vessel-row b{font:500 .72rem var(--sans)}.vessel-row small{font:.53rem var(--mono);color:var(--dim);margin-top:3px}.vessel-row strong{font:.62rem var(--mono);color:var(--lime);font-weight:500}.vessel-status{width:7px;height:7px;border-radius:50%;background:var(--lime);box-shadow:0 0 7px var(--lime)}.vessel-status.warning{background:#ebb432;box-shadow:0 0 7px #ebb432}.vessel-detail{padding:22px 18px}.detail-label{font:.55rem var(--mono);letter-spacing:.15em;color:var(--dim)}.vessel-detail h3{font:500 1.3rem var(--serif);margin:8px 0 18px;color:var(--text)}.detail-stats{display:flex;gap:12px;font:.58rem var(--mono);color:var(--dim)}.detail-stats b{display:block;color:var(--text);font-weight:500;margin-top:5px}.signal-good{color:var(--lime)!important}.detail-route{display:flex;align-items:center;gap:8px;margin-top:22px;font:.52rem var(--mono);color:var(--dim)}.detail-route i{height:1px;flex:1;background:var(--lime);opacity:.5}@media(max-width:900px){.tracking-grid{grid-template-columns:1fr}.vessel-panel{border-left:0;border-top:1px solid var(--line)}.tracking-map-wrap{min-height:360px}.tracking-toolbar{align-items:flex-start;gap:12px;flex-direction:column}.tracking-toolbar small{display:block;margin:5px 0 0 16px}}:root[data-theme="light"] .fleet-map{filter:none}.fleet-map{transition:filter .25s ease}.fleet-map.map-light{filter:brightness(1.08) saturate(.9)}.fleet-map.map-dark{filter:none}.fleet-map .leaflet-tile-pane{transition:opacity .2s ease}
  `;
  document.head.appendChild(css);
})();
