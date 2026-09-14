import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MAP_CENTER } from '../constants.js';

const SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
const STREET_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

function parseCoords(str) {
  const [lat, lng] = String(str || '').split(',').map((s) => parseFloat(String(s).trim()));
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

function pinIcon(kind, pulse) {
  const html = `
    <div class="map-pin ${kind}">
      ${pulse ? '<span class="pin-pulse"></span>' : ''}
      <svg viewBox="0 0 30 42">
        <path d="M15 1C7.3 1 1 7.3 1 15c0 10.6 14 26 14 26s14-15.4 14-26C29 7.3 22.7 1 15 1z"/>
        <circle cx="15" cy="14.5" r="5.4"/>
      </svg>
    </div>`;
  return L.divIcon({
    className: '',
    html,
    iconSize: [30, 42],
    iconAnchor: [15, 40],
    popupAnchor: [0, -38],
  });
}

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

export default function MapView({ lotes, pickedCoord, onPick, activeLoteId, onSelectLote }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const pickedMarkerRef = useRef(null);
  const lotesLayerRef = useRef(null);

  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const onSelectLoteRef = useRef(onSelectLote);
  onSelectLoteRef.current = onSelectLote;

  useEffect(() => {
    if (!elRef.current || mapRef.current) return undefined;

    const map = L.map(elRef.current, {
      center: MAP_CENTER,
      zoom: 13,
      zoomControl: false,
      minZoom: 3,
      worldCopyJump: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    const satellite = L.tileLayer(SATELLITE_URL, {
      maxZoom: 19,
      attribution: 'Imágenes &copy; Esri, Maxar, Earthstar Geographics',
    });
    const labels = L.tileLayer(LABELS_URL, { maxZoom: 19, opacity: 0.85 });
    const satelliteGroup = L.layerGroup([satellite, labels]).addTo(map);
    const street = L.tileLayer(STREET_URL, {
      maxZoom: 19,
      attribution: '&copy; Colaboradores de OpenStreetMap',
    });

    L.control.layers(
      { 'Vista Satélite': satelliteGroup, 'Vista Callejero': street },
      null,
      { position: 'topright' }
    ).addTo(map);

    lotesLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e) => onPickRef.current?.(e.latlng));

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      pickedMarkerRef.current = null;
      lotesLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!pickedCoord) {
      if (pickedMarkerRef.current) {
        map.removeLayer(pickedMarkerRef.current);
        pickedMarkerRef.current = null;
      }
      return;
    }
    const ll = [pickedCoord.lat, pickedCoord.lng];
    if (pickedMarkerRef.current) {
      pickedMarkerRef.current.setLatLng(ll);
    } else {
      pickedMarkerRef.current = L.marker(ll, { icon: pinIcon('accent', true), draggable: true }).addTo(map);
      pickedMarkerRef.current.on('dragend', (e) => {
        const p = e.target.getLatLng();
        onPickRef.current?.(p);
      });
    }
  }, [pickedCoord]);

  useEffect(() => {
    const layer = lotesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    lotes.forEach((lote) => {
      const ll = parseCoords(lote.coordenadas);
      if (!ll) return;
      const marker = L.marker(ll, { icon: pinIcon('primary') });
      marker.bindPopup(
        `<b>${escapeHtml(lote.nombre)}</b><br/>${escapeHtml(lote.cultivo)} · ${lote.ha} Ha` +
          `<br/><span style="opacity:.7">${escapeHtml(lote.coordenadas)}</span>`
      );
      marker.on('click', () => onSelectLoteRef.current?.(lote.id));
      layer.addLayer(marker);
    });
  }, [lotes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeLoteId) return;
    const lote = lotes.find((x) => x.id === activeLoteId);
    const ll = lote ? parseCoords(lote.coordenadas) : null;
    if (ll) map.flyTo(ll, 15, { duration: 1.2 });
  }, [activeLoteId, lotes]);

  return (
    <div className="map-frame">
      <div id="map" ref={elRef} />
      <p className="map-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
        </svg>
        Haz clic sobre el mapa para georreferenciar · arrastra el marcador naranja para ajustar
      </p>
    </div>
  );
}
