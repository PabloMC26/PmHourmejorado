
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;

  try {
    const url = new URL('data/news.json', window.location.href).toString();
    console.log('[NEWS] Pidiendo:', url);

    const res = await fetch(url, { cache: 'no-store' });
    console.log('[NEWS] Status:', res.status, res.statusText);

    const raw = await res.text(); // leemos texto para poder ver errores de formato
    console.log('[NEWS] Respuesta (texto):', raw);

    if (!res.ok) throw new Error('HTTP ' + res.status + ' al pedir news.json');

    let items;
    try {
      items = JSON.parse(raw);
    } catch (e) {
      console.error('[NEWS] Error parseando JSON:', e);
      throw new Error('El archivo data/news.json NO es JSON válido (revisa comas, llaves, comillas)');
    }

    grid.innerHTML = items.map(n => `
      <article class="card">
        <div class="content">
          <h3>${n.titulo}</h3>
          <p class="muted">${new Date(n.fecha).toLocaleDateString('es-ES')}</p>
          <p>${n.resumen}</p>
          <a class="btn" href="${n.link}">Leer más</a>
        </div>
      </article>
    `).join('');

  } catch (e) {
    console.error('[NEWS] ERROR:', e);
    grid.innerHTML = '<p>Error cargando las noticias.</p>';
  }
});
