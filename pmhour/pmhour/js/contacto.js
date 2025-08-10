document.addEventListener('DOMContentLoaded', () => {

  const coords = [37.0194, -4.5612];


  const map = L.map('map').setView(coords, 15);


  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

 
  L.marker(coords)
    .addTo(map)
    .bindPopup('<b>PmHour</b><br>Calle de Ejemplo 123<br>Antequera, España')
    .on('click', () => {
      const url = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
      window.open(url, '_blank');
    })
    .openPopup();
});

