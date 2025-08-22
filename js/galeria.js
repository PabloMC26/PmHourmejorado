document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  const toEUR = n => Number(n).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

  
  const urls = [
    "../data/galeria.json",
    "../data/relojes.json",
    "/data/galeria.json",
    "/data/relojes.json"
  ].map(u => u + "?v=" + Date.now());

  const fallback = [
    { marca:"Rolex", modelo:"Submariner Date de 40mm", precio:25719, imagen:"../assets/img/Rolex1.jpg", width:1000, height:1000 },
    { marca:"Hublot", modelo:"Spring of Big Bang 42 mm 2017", precio:17500, imagen:"../assets/img/Hublot1.jpg", width:1000, height:1000 },
    { marca:"Rolex", modelo:"Sky-Dweller 42mm 2025", precio:47551, imagen:"../assets/img/Rolex2.jpg", width:1000, height:1000 },
    { marca:"Patek Philippe", modelo:"Celestial 44mm 2024", precio:565762, imagen:"../assets/img/Patek1.jpg", width:1000, height:1000 }
  ];

  // 3) Carga con fallback de rutas
  let items = null, lastErr = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`[${res.status}] ${res.statusText}`);
      items = await res.json();
      console.log("[GAL] OK:", url, "items:", Array.isArray(items)? items.length : 0);
      break;
    } catch (e) {
      console.warn("[GAL] Falló", url, e);
      lastErr = e;
    }
  }
  if (!Array.isArray(items) || !items.length) {
    console.warn("[GAL] Usando fallback embebido por fallo de JSON.", lastErr||"");
    items = fallback;
  }

  // 4) Render tarjetas
  const tpl = (it) => {
    const marca   = it.marca  || it.brand  || "Marca";
    const modelo  = it.modelo || it.titulo || it.model || "";
    const precioV = it.precio ?? it.price;
    const precio  = (precioV != null) ? toEUR(precioV) : "—";
    const img     = it.imagen || it.img || "../assets/img/placeholder.jpg";
    const w       = it.width  || null;   
    const h       = it.height || null;
    const alt     = `${marca} ${modelo}`.trim();

    const imgTag = (w && h)
      ? `<img src="${img}" alt="${alt}" width="${w}" height="${h}" loading="lazy">`
      : `<img src="${img}" alt="${alt}" loading="lazy">`;

    return `
      <article class="card">
        <div class="media">${imgTag}</div>
        <div class="p">
          <h3>${marca}</h3>
          <p class="lead">${modelo}</p>
          <p><strong>${precio}</strong></p>
        </div>
      </article>
    `;
  };

  grid.innerHTML = items.map(tpl).join("");
});