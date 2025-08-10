document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formPresupuesto');
  const out  = document.getElementById('resultado');

  const validators = {
    nombre: (el) => {
      if (!el.value.trim()) return 'El nombre es obligatorio.';
      if (!el.checkValidity()) return 'Usa solo letras y espacios (mín. 2).';
      return '';
    },
    email: (el) => {
      if (!el.value.trim()) return 'El email es obligatorio.';
      if (!el.checkValidity()) return 'Introduce un email válido.';
      return '';
    },
    telefono: (el) => {
      if (!el.value.trim()) return 'El teléfono es obligatorio.';
      if (!el.checkValidity()) return 'Formato de teléfono español (admite +34).';
      return '';
    },
    modelo: (el) => el.value ? '' : 'Selecciona un modelo.',
    importe: (el) => {
      if (!el.value) return 'Indica un importe.';
      const val = Number(el.value);
      if (val < 500 || val > 200000) return 'El importe debe estar entre 500 y 200.000.';
      return '';
    },
    acepto: (el) => el.checked ? '' : 'Debes aceptar la política de privacidad.',
  };

  // Asignar eventos de validación en blur/input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    const errorEl = el.closest('.field')?.querySelector('.error');
    if (!errorEl) return;
    const run = () => {
      const fn = validators[el.name];
      const msg = fn ? fn(el) : '';
      errorEl.textContent = msg;
    };
    el.addEventListener('blur', run);
    el.addEventListener('input', run);
    el.addEventListener('change', run);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validar todos
    let ok = true;
    Object.entries(validators).forEach(([name, fn]) => {
      const el = form.elements[name];
      const errorEl = el.closest('.field')?.querySelector('.error');
      const msg = fn(el);
      if (errorEl) errorEl.textContent = msg;
      if (msg) ok = false;
    });

    if (!ok) {
      out.hidden = false;
      out.innerHTML = '<p>Revisa los campos marcados en rojo.</p>';
      return;
    }

    // “Enviar” (simulado): mostrar resumen
    const data = Object.fromEntries(new FormData(form).entries());
    // servicios puede tener múltiples valores
    data.servicios = Array.from(form.querySelectorAll('input[name="servicios"]:checked')).map(x => x.value);

    out.hidden = false;
    out.innerHTML = `
      <h3>Solicitud enviada</h3>
      <p>Gracias, <b>${data.nombre}</b>. Te contactaremos en <b>${data.email}</b> / ${data.telefono}.</p>
      <ul>
        <li>Modelo: <b>${data.modelo}</b></li>
        <li>Presupuesto: <b>${Number(data.importe).toLocaleString('es-ES', {style:'currency', currency:'EUR'})}</b></li>
        <li>Fecha deseada: ${data.fecha || '—'}</li>
        <li>Servicios: ${data.servicios.length ? data.servicios.join(', ') : '—'}</li>
        <li>Info adicional: ${data.info?.trim() || '—'}</li>
      </ul>
    `;
    form.reset();
  });
});
