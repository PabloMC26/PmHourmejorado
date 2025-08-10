document.addEventListener('DOMContentLoaded', async () => {
  const cont = document.getElementById('galeria');
  if (!cont) { 
    console.error('[GAL] Falta #galeria en el HTML');
    return;
  }

  try {
    // Desde /views/galeria.html el JSON está en /data/relojes.json → usamos ruta relativa
    const url = new URL('../data/relojes.json', window.location.href).toString();
    console.log('[GAL] Pidiendo:', url);

    const res = await fetch(url, { cache: 'no-store' });
    console.log('[GAL] Status:', res.status, res.statusText);

    const text = await res.text();
    console.log('[GAL] JSON (texto):', text);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    let items = JSON.parse(text);
    console.log('[GAL] Items:', items.length);

    if (!Array.isArray(items) || items.length === 0) {
      cont.innerHTML = '<p>Sin productos.</p>';
      return;
    }

    cont.innerHTML = items.map(r => `
      <article class="card">
        <div class="media">
          <img src="${r.img}" alt="${r.titulo}" width="600" height="600" loading="lazy">
        </div>
        <div class="content">
          <h3>${r.titulo}</h3>
          <p class="price">${Number(r.precio).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        </div>
      </article>
    `).join('');
  } catch (e) {
    console.error('[GAL] ERROR:', e);
    cont.innerHTML = '<p>Error cargando la galería.</p>';
  }
});
