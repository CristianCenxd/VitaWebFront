import { solicitarRecuperacion, restablecerContrasena } from '../utils/api.js';
import { validators, validarFormulario, limpiarValidaciones } from '../utils/validation.js';
import { router } from '../utils/router.js';

let paso = 1;
let emailRecuperacion = '';

export const ForgotPasswordPage = async () => {
  paso = 1;
  emailRecuperacion = '';

  const html = `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md animate-scale-in">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-2xl shadow-blue-500/20 ring-2 ring-white/10">V</div>
          <h1 class="text-3xl font-bold text-white tracking-tight">VitaNutrición</h1>
          <p class="text-blue-200/70 mt-2 font-medium">Recuperación de Contraseña</p>
        </div>

        <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <!-- Steps indicator -->
          <div class="flex items-center gap-2 mb-6">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold" id="step1Circle">1</div>
              <span class="text-xs font-medium text-slate-600" id="step1Label">Correo</span>
            </div>
            <div class="flex-1 h-px bg-slate-200" id="line1"></div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold" id="step2Circle">2</div>
              <span class="text-xs font-medium text-slate-400" id="step2Label">Código</span>
            </div>
            <div class="flex-1 h-px bg-slate-200" id="line2"></div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold" id="step3Circle">3</div>
              <span class="text-xs font-medium text-slate-400" id="step3Label">Contraseña</span>
            </div>
          </div>

          <!-- Error Alert -->
          <div id="errorAlert" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span id="errorMessage">Error</span>
          </div>

          <!-- Success Alert -->
          <div id="successAlert" class="hidden mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span id="successMessage">Éxito</span>
          </div>

          <!-- Step 1: Email -->
          <div id="step1" class="space-y-4">
            <div class="text-center mb-4">
              <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h2 class="text-lg font-bold text-slate-900">¿Olvidaste tu contraseña?</h2>
              <p class="text-sm text-slate-500 mt-1">Ingresa tu correo y te enviaremos un código de verificación</p>
            </div>
            <form id="formEmail" class="space-y-4">
              <div class="form-group">
                <label class="form-label" for="emailRecuperacion">Correo Electrónico</label>
                <input type="email" id="emailRecuperacion" required placeholder="tu@email.com" class="input-field" autocomplete="email" />
              </div>
              <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Enviar Código
              </button>
            </form>
          </div>

          <!-- Step 2: Code -->
          <div id="step2" class="hidden space-y-4">
            <div class="text-center mb-4">
              <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h2 class="text-lg font-bold text-slate-900">Código de verificación</h2>
              <p class="text-sm text-slate-500 mt-1">Ingresa el código de 6 dígitos que enviamos a <strong id="emailMostrado" class="text-blue-600"></strong></p>
            </div>
            <form id="formCodigo" class="space-y-4">
              <div class="form-group">
                <label class="form-label" for="codigoVerificacion">Código de verificación</label>
                <input type="text" id="codigoVerificacion" required maxlength="6" minlength="4" pattern="[0-9]{4,6}" inputmode="numeric" placeholder="Ingresa tu código" class="input-field text-center text-2xl tracking-widest" autocomplete="one-time-code" />
              </div>
              <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Verificar Código
              </button>
            </form>
          </div>

          <!-- Step 3: New Password -->
          <div id="step3" class="hidden space-y-4">
            <div class="text-center mb-4">
              <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h2 class="text-lg font-bold text-slate-900">Nueva contraseña</h2>
              <p class="text-sm text-slate-500 mt-1">Ingresa tu nueva contraseña</p>
            </div>
            <form id="formPassword" class="space-y-4">
              <div class="form-group">
                <label class="form-label" for="nuevaContrasena">Nueva contraseña</label>
                <input type="password" id="nuevaContrasena" required minlength="6" placeholder="Mínimo 6 caracteres" class="input-field" autocomplete="new-password" />
              </div>
              <div class="form-group">
                <label class="form-label" for="confirmarContrasena">Confirmar nueva contraseña</label>
                <input type="password" id="confirmarContrasena" required minlength="6" placeholder="Repite la contraseña" class="input-field" autocomplete="new-password" />
              </div>
              <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Restablecer Contraseña
              </button>
            </form>
          </div>

          <!-- Back to login -->
          <div class="mt-6 text-center">
            <a href="#/login" class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const successAlert = document.getElementById('successAlert');
    const successMessage = document.getElementById('successMessage');

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    const step1Circle = document.getElementById('step1Circle');
    const step2Circle = document.getElementById('step2Circle');
    const step3Circle = document.getElementById('step3Circle');
    const step1Label = document.getElementById('step1Label');
    const step2Label = document.getElementById('step2Label');
    const step3Label = document.getElementById('step3Label');
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');

    const emailMostrado = document.getElementById('emailMostrado');

    function showError(msg) {
      errorMessage.textContent = msg;
      errorAlert.classList.remove('hidden');
      successAlert.classList.add('hidden');
    }

    function showSuccess(msg) {
      successMessage.textContent = msg;
      successAlert.classList.remove('hidden');
      errorAlert.classList.add('hidden');
    }

    function hideAlerts() {
      errorAlert.classList.add('hidden');
      successAlert.classList.add('hidden');
    }

    function irAPaso(nuevoPaso) {
      paso = nuevoPaso;
      hideAlerts();
      limpiarValidaciones();
      step1.classList.toggle('hidden', paso !== 1);
      step2.classList.toggle('hidden', paso !== 2);
      step3.classList.toggle('hidden', paso !== 3);

      const activeColor = 'bg-blue-600 text-white';
      const inactiveColor = 'bg-slate-200 text-slate-500';
      const activeLabel = 'text-slate-900 font-semibold';
      const inactiveLabel = 'text-slate-400';
      const lineActive = 'bg-blue-400';

      step1Circle.className = `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso >= 1 ? activeColor : inactiveColor}`;
      step2Circle.className = `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso >= 2 ? activeColor : inactiveColor}`;
      step3Circle.className = `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso >= 3 ? activeColor : inactiveColor}`;

      step1Label.className = `text-xs font-medium ${paso >= 1 ? activeLabel : inactiveLabel}`;
      step2Label.className = `text-xs font-medium ${paso >= 2 ? activeLabel : inactiveLabel}`;
      step3Label.className = `text-xs font-medium ${paso >= 3 ? activeLabel : inactiveLabel}`;

      line1.className = `flex-1 h-px ${paso >= 2 ? lineActive : 'bg-slate-200'}`;
      line2.className = `flex-1 h-px ${paso >= 3 ? lineActive : 'bg-slate-200'}`;
    }

    // Step 1: Email form
    document.getElementById('formEmail').onsubmit = async (e) => {
      e.preventDefault();
      hideAlerts();
      const email = document.getElementById('emailRecuperacion').value.trim();

      const valido = validarFormulario([
        { campo: 'emailRecuperacion', nombre: 'Correo', valor: email, validacion: validators.email }
      ]);

      if (!valido) return;

      try {
        await solicitarRecuperacion(email);
        emailRecuperacion = email;
        emailMostrado.textContent = email;
        irAPaso(2);
        showSuccess('Código enviado a tu correo. Revisa tu bandeja de entrada.');
      } catch (err) {
        showError(err.message || 'Error al enviar el código. Verifica el correo ingresado.');
      }
    };

    // Step 2: Code form
    document.getElementById('formCodigo').onsubmit = async (e) => {
      e.preventDefault();
      hideAlerts();
      const codigo = document.getElementById('codigoVerificacion').value.trim();

      const valido = validarFormulario([
        { campo: 'codigoVerificacion', nombre: 'Código', valor: codigo, validacion: (v) => {
          if (!v) return 'El código es obligatorio';
          if (!/^\d{4,6}$/.test(v)) return 'El código debe tener entre 4 y 6 dígitos';
          return null;
        }}
      ]);

      if (!valido) return;

      irAPaso(3);
      showSuccess('Código verificado. Ahora puedes crear tu nueva contraseña.');
    };

    // Step 3: New password form
    document.getElementById('formPassword').onsubmit = async (e) => {
      e.preventDefault();
      hideAlerts();

      const nuevaPass = document.getElementById('nuevaContrasena').value;
      const confirmPass = document.getElementById('confirmarContrasena').value;

      const valido = validarFormulario([
        { campo: 'nuevaContrasena', nombre: 'Contraseña', valor: nuevaPass, validacion: validators.contrasena },
        { campo: 'confirmarContrasena', nombre: 'Confirmar contraseña', valor: confirmPass, validacion: (v) => {
          if (!v) return 'Confirma tu contraseña';
          if (v !== document.getElementById('nuevaContrasena').value) return 'Las contraseñas no coinciden';
          return null;
        }}
      ]);

      if (!valido) return;

      try {
        const codigo = document.getElementById('codigoVerificacion').value.trim();
        await restablecerContrasena(codigo, nuevaPass);
        showSuccess('Contraseña restablecida exitosamente. Redirigiendo al login...');
        setTimeout(() => {
          router.navigate('/login');
        }, 2000);
      } catch (err) {
        showError(err.message || 'Error al restablecer la contraseña. El código pudo haber expirado.');
      }
    };

    // Filter code input
    const codigoInput = document.getElementById('codigoVerificacion');
    if (codigoInput) {
      codigoInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      });
    }
  }, 0);

  return html;
};
