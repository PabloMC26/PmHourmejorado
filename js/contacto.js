document.addEventListener('DOMContentLoaded', () => {
  const MAP_ID = 'map';
  const mapEl = document.getElementById(MAP_ID);
  if (!mapEl) return;

  // 📍 Coordenadas de la tienda (Antequera)
  const TIENDA = { lat: 37.0194, lng: -4.5612, nombre: 'PmHour - Antequera' };

  // 1) Inicializa mapa
  const map = L.map(MAP_ID, { zoomControl: true }).setView([TIENDA.lat, TIENDA.lng], 13);

  // 2) Capa base
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  }).addTo(map);

  // 3) Marcador tienda
  const tiendaMarker = L.marker([TIENDA.lat, TIENDA.lng]).addTo(map)
    .bindPopup(`<b>${TIENDA.nombre}</b><br>C/ Antequera, Málaga`);

  // 4) Intenta geolocalizar al usuario (necesita HTTPS y permiso)
  const opcionesGeo = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

  function trazarRuta(origen) {
    // Si la librería de routing no está, no hacemos nada (evita errores)
    if (!L.Routing) {
      console.warn('[MAPA] Falta Leaflet Routing Machine.');
      return;
    }

    // Limpia controles anteriores si recargas
    if (window._routingControl) {
      map.removeControl(window._routingControl);
      window._routingControl = null;
    }

    // 5) Crea control de ruta (OSRM demo; español)
    const control = L.Routing.control({
      waypoints: [
        L.latLng(origen.lat, origen.lng),
        L.latLng(TIENDA.lat, TIENDA.lng)
      ],
      router: L.Routing.osrmv1({ language: 'es', profile: 'car' }),
      lineOptions: { addWaypoints: false, extendToWaypoints: true, missingRouteTolerance: 30 },
      routeWhileDragging: false,
      show: true,             // muestra panel integrado
      collapsible: true,      // permite plegar
      autoRoute: true
    })
    .on('routingerror', (e) => {
      console.error('[MAPA] Error de enrutado:', e && e.error);
    })
    .addTo(map);

    window._routingControl = control;

    // Ajusta vista a la ruta cuando esté lista
    control.on('routesfound', (e) => {
      const route = e.routes && e.routes[0];
      if (route && route.coordinates) {
        const bounds = L.latLngBounds(route.coordinates);
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    });
  }

  function onGeoOk(pos) {
    const { latitude, longitude } = pos.coords;
    const yo = { lat: latitude, lng: longitude };
    // Marcador usuario
    L.marker([yo.lat, yo.lng], { title: 'Tu ubicación' })
      .addTo(map)
      .bindPopup('Tu ubicación aproximada');
    trazarRuta(yo);
  }

  function onGeoError(err) {
    console.warn('[MAPA] Geolocalización no disponible:', err && err.message);
    // Fallback: centra en tienda y muestra solo su marcador
    map.setView([TIENDA.lat, TIENDA.lng], 13);
    tiendaMarker.openPopup();
    // Si quieres trazar una ruta de ejemplo desde el centro de Antequera, descomenta:
    // trazarRuta({ lat: 37.018, lng: -4.559 });
  }

  // Dispara geolocalización
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(onGeoOk, onGeoError, opcionesGeo);
  } else {
    onGeoError(new Error('Geolocalización no soportada'));
  }

  // Por si el mapa se renderiza oculto y luego aparece
  setTimeout(() => map.invalidateSize(), 300);
});

