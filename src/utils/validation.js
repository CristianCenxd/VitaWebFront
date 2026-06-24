export const validators = {
  soloLetras: (value) => {
    if (!value || !value.trim()) return 'Este campo es obligatorio';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras (sin números, símbolos ni acentos)';
    return null;
  },

  email: (value) => {
    if (!value || !value.trim()) return 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo electrónico válido';
    return null;
  },

  telefono: (value) => {
    if (!value || !value.trim()) return 'El teléfono es obligatorio';
    if (!/^\d{10}$/.test(value)) return 'El teléfono debe tener exactamente 10 dígitos';
    return null;
  },

  cedula: (value) => {
    if (!value || !value.trim()) return 'La cédula es obligatoria';
    if (!/^\d{7,8}$/.test(value)) return 'La cédula debe tener 7 u 8 dígitos';
    return null;
  },

  contrasena: (value) => {
    if (!value || !value.trim()) return 'La contraseña es obligatoria';
    if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  },

  numeroPositivo: (fieldName) => (value) => {
    if (!value || value === '') return `${fieldName} es obligatorio`;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return `${fieldName} debe ser un número positivo`;
    return null;
  },

  requerido: (fieldName) => (value) => {
    if (!value || !value.toString().trim()) return `${fieldName} es obligatorio`;
    return null;
  },

  minimo: (fieldName, min) => (value) => {
    if (value && value.length < min) return `${fieldName} debe tener al menos ${min} caracteres`;
    return null;
  },

  maximo: (fieldName, max) => (value) => {
    if (value && value.length > max) return `${fieldName} debe tener máximo ${max} caracteres`;
    return null;
  }
};

export function validarFormulario(validaciones) {
  const errores = [];
  for (const { campo, nombre, valor, validacion } of validaciones) {
    const error = validacion(valor);
    if (error) {
      mostrarErrorEnCampo(campo, error);
      errores.push({ campo, error });
    } else {
      limpiarErrorEnCampo(campo);
    }
  }
  return errores.length === 0;
}

export function mostrarErrorEnCampo(idCampo, mensaje) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;

  const grupo = campo.closest('.form-group') || campo.parentElement;
  let errorEl = grupo.querySelector('.campo-error');

  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.className = 'campo-error text-red-500 text-xs mt-1 font-medium';
    campo.insertAdjacentElement('afterend', errorEl);
  }

  errorEl.textContent = mensaje;
  campo.classList.add('border-red-400', 'focus:border-red-500', 'focus:ring-red-200');
  campo.classList.remove('border-green-400');
}

export function limpiarErrorEnCampo(idCampo) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;

  const grupo = campo.closest('.form-group') || campo.parentElement;
  const errorEl = grupo.querySelector('.campo-error');

  if (errorEl) errorEl.remove();
  campo.classList.remove('border-red-400', 'focus:border-red-500', 'focus:ring-red-200');
  campo.classList.add('border-green-400');
}

export function limpiarValidaciones() {
  document.querySelectorAll('.campo-error').forEach(el => el.remove());
  document.querySelectorAll('.input-field, .textarea-field, select.input-field').forEach(el => {
    el.classList.remove('border-red-400', 'focus:border-red-500', 'focus:ring-red-200', 'border-green-400');
  });
}

export function limpiarValidacionEnCampo(idCampo) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;
  const grupo = campo.closest('.form-group') || campo.parentElement;
  const errorEl = grupo.querySelector('.campo-error');
  if (errorEl) errorEl.remove();
  campo.classList.remove('border-red-400', 'focus:border-red-500', 'focus:ring-red-200', 'border-green-400');
}
