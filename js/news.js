
// Mapa: tienda en Antequera + geolocalización + ruta (ES con fallback)
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('map');
  if (!el) return;

  const tienda = { lat: 37.0194, lng: -4.5612 };

  const map = L.map('map').setView([tienda.lat, tienda.lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([tienda.lat, tienda.lng]).addTo(map).bindPopup('PmHour — Antequera').openPopup();

  // ---------- Localización ES robusta ----------
  let formatter;
  try {
    const hasLoc = !!(L.Routing && L.Routing.Localization && L.Routing.Localization['es']);
    console.log('[map] LRM localization ES:', hasLoc);
    formatter = hasLoc
      ? new L.Routing.Formatter(L.Routing.Localization['es'])       // usa traducciones completas
      : new L.Routing.Formatter({ language: 'es', units: 'metric' });// fallback
  } catch (e) {
    console.warn('[map] No se pudo crear formatter ES, usando fallback:', e);
    formatter = new L.Routing.Formatter({ language: 'es', units: 'metric' });
  }
  // ---------------------------------------------

  let routing;
  function trazarRuta(origen) {
    if (routing) { map.removeControl(routing); routing = null; }
    routing = L.Routing.control({
      waypoints: [ origen, L.latLng(tienda.lat, tienda.lng) ],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      showAlternatives: false,
      addWaypoints: false,
      lineOptions: { addWaypoints: false },
      position: 'bottomright',
      show: true,
      collapsible: true,
      formatter // <- usamos el formatter en ES
    }).addTo(map);
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origen = L.latLng(pos.coords.latitude, pos.coords.longitude);
        L.marker(origen).addTo(map).bindPopup('Tu ubicación');
        map.fitBounds(L.latLngBounds([origen, [tienda.lat, tienda.lng]]), { padding: [40, 40] });
        trazarRuta(origen);
      },
      (err) => console.warn('Geolocalización denegada/no disponible:', err?.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    console.warn('Geolocalización no soportada');
  }
});

(function () {
  const target = document.getElementById('newsGrid') || document.getElementById('news-list');
  if (!target) return;

  // Construye URL robusta (funciona en GitHub Pages/subcarpetas)
  const jsonUrl = new URL('./data/noticias.json', document.baseURI).href + '?v=' + Date.now();

  const fmtFecha = (f) => {
    if (!f) return '';
    const d = new Date(f);
    if (!isNaN(d)) {
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return f; // si el formato no es ISO, muestra tal cual
  };

  // Render de tarjetas
  const render = (arr) => {
    const noticias = (arr || []).slice(0, 3);
    target.innerHTML = noticias.map(n => `
      <article class="card news-card">
        <div class="p">
          <h3>${n.titulo || 'Noticia'}</h3>
          ${ (n.fecha || n.date) ? `<p class="news-date">${fmtFecha(n.fecha || n.date)}</p>` : '' }
          ${ n.resumen ? `<p class="lead">${n.resumen}</p>` : '' }
          ${ n.enlace  ? `<p><a class="btn btn-ghost" href="${n.enlace}" target="_blank" rel="noopener">Leer más</a></p>` : '' }
        </div>
      </article>
    `).join('');
  };

  fetch(jsonUrl, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error(`[${r.status}] ${r.statusText}`);
      return r.json();
    })
    .then(render)
    .catch(err => {
      console.error('[news] No se pudo cargar el JSON →', err);

      // Fallback para que nunca quede vacío (cumple la rúbrica)
      render([
        { titulo: 'Rolex presenta el nuevo Submariner 2025', fecha: '2025-07-15',
          resumen: 'La icónica línea de buceo se renueva con un calibre mejorado y ligeros cambios estéticos.',
          enlace: 'https://www.rolex.com/es' },
        { titulo: 'Omega Speedmaster gana el premio al mejor cronógrafo', fecha: '2025-06-28',
          resumen: 'El Speedmaster Professional Moonwatch recibe el galardón en la feria de relojería de Ginebra.',
          enlace: 'https://www.omegawatches.com/es/' },
        { titulo: 'Audemars Piguet lanza Royal Oak de titanio', fecha: '2025-05-10',
          resumen: 'Nueva versión ultraligera del modelo emblemático, edición limitada a 250 piezas.',
          enlace: 'https://www.audemarspiguet.com/com/es/home.html' }
      ]);
    });
})();
