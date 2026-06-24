import { restablecerContrasena } from '../utils/api.js';
import { router } from '../utils/router.js';

function obtenerToken() {
  const params = new URLSearchParams(window.location.search);
  let token = params.get('token');
  if (!token) {
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      token = new URLSearchParams(hash.substring(qIndex)).get('token');
    }
  }
  return token;
}

export const ResetPasswordPage = async () => {
  const token = obtenerToken();

  if (!token) {
    return `<p class="text-red-500 text-center mt-10">Token inválido o faltante</p>`;
  }

  const html = `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <h2 class="text-2xl font-bold text-slate-800 text-center mb-6">Restablecer contraseña</h2>
        <div id="errorReset" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"></div>
        <div id="successReset" class="hidden mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm"></div>
        <form id="resetForm" class="space-y-4">
          <div class="form-group">
            <label class="form-label" for="nuevaContrasena">Nueva contraseña</label>
            <input type="password" id="nuevaContrasena" required placeholder="Mínimo 6 caracteres" class="input-field" minlength="6" />
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all">
            Restablecer contraseña
          </button>
        </form>
      </div>
    </div>
  `;

  setTimeout(() => {
    const form = document.getElementById('resetForm');
    const token = obtenerToken();
    const errorDiv = document.getElementById('errorReset');
    const successDiv = document.getElementById('successReset');

    if (!form || !token) return;

    form.onsubmit = async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');
      successDiv.classList.add('hidden');

      const nuevaContrasena = document.getElementById('nuevaContrasena').value;
      if (nuevaContrasena.length < 6) {
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
        errorDiv.classList.remove('hidden');
        return;
      }

      try {
        await restablecerContrasena(token, nuevaContrasena);
        successDiv.textContent = 'Contraseña restablecida. Redirigiendo al login...';
        successDiv.classList.remove('hidden');
        setTimeout(() => router.navigate('/login'), 2000);
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
      }
    };
  }, 0);

  return html;
};
