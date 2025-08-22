// Presupuesto en vivo: producto + extras ± descuento por plazo
document.addEventListener('DOMContentLoaded', () => {
  const form    = document.getElementById('formPresu');
  const totalEl = document.getElementById('total');
  if (!form || !totalEl) { console.warn('[budget] Falta formPresu o total'); return; }

  const num = v => Number(String(v || '').replace(/[.\s€]/g, '').replace(',', '.')) || 0;

  function precioProducto() {
    const opt = form.producto?.selectedOptions?.[0];
    if (!opt) return 0;
    if (opt.dataset?.precio) return num(opt.dataset.precio);
    const m = (opt.textContent || '').match(/[\d.,]+/g);
    return num(m ? m.pop() : 0);
  }

  function sumaExtras() {
    let s = 0;
    form.querySelectorAll('input[name="extra"]:checked')
        .forEach(ch => s += num(ch.dataset?.precio));
    return s;
  }

  function descuento(meses) {
    if (meses >= 12) return 0.10;
    if (meses >= 6)  return 0.05;
    return 0;
  }

  function calcular() {
    const base   = precioProducto();
    const plazo  = num(form.plazo?.value);
    const extras = sumaExtras();
    const d      = descuento(plazo);
    const total  = (base + extras) * (1 - d);
    totalEl.textContent = total.toFixed(2) + ' €';
  }

  form.addEventListener('input',  calcular);
  form.addEventListener('change', calcular);
  calcular();
});
// Validación personalizada que muestra error bajo CADA campo
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formPresu');
  if (!form) return;

  // helper: span .error dentro del contenedor .field
  const errorBox = (el) => el.closest('.field')?.querySelector('.error');

  // Mensajes personalizados por campo
  function validarCampo(el) {
    const eb = errorBox(el);
    if (!eb) return true;

    let msg = '';

    if (!el.checkValidity()) {
      // Reglas por nombre del campo (según tus IDs/names)
      switch (el.name) {
        case 'nombre':
          msg = el.validity.valueMissing
              ? 'El nombre es obligatorio.'
              : 'Usa solo letras y espacios.';
          break;

        case 'email':
          msg = el.validity.valueMissing
              ? 'El email es obligatorio.'
              : 'Introduce un email válido.';
          break;

        case 'telefono':
          msg = el.validity.valueMissing
              ? 'El teléfono es obligatorio.'
              : 'Introduce un teléfono español válido.';
          break;

        case 'modelo':
          msg = 'Selecciona un modelo de interés.';
          break;

        case 'producto':
          msg = 'Selecciona un producto.';
          break;

        case 'plazo':
          msg = el.validity.rangeUnderflow || el.validity.rangeOverflow
              ? 'El plazo debe estar entre 1 y 36 meses.'
              : 'Indica un plazo.';
          break;

        case 'acepto':
          msg = 'Debes aceptar la política de privacidad.';
          break;

        default:
          msg = 'Revisa este campo.';
      }
    }

    eb.textContent = msg;
    return !msg; // true si está OK
  }

  // Validación en vivo
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input',  () => validarCampo(el));
    el.addEventListener('change', () => validarCampo(el));
    el.addEventListener('blur',   () => validarCampo(el));
  });

  // Enviar: validamos TODOS y mostramos todos los errores a la vez
  form.addEventListener('submit', (e) => {
    let ok = true;
    // limpia mensajes previos
    form.querySelectorAll('.error').forEach(s => s.textContent = '');

    // Lista de campos a validar (ajusta si quieres)
    const campos = ['nombre','email','telefono','modelo','producto','plazo','acepto'];
    campos.forEach(name => {
      const el = form.elements[name];
      if (el) ok = validarCampo(el) && ok;
    });

    if (!ok) {
      e.preventDefault();
      // Enfoca el primero con error
      const firstBad = campos.map(n => form.elements[n]).find(el => el && !el.checkValidity());
      if (firstBad) firstBad.focus();
    }
  });
});