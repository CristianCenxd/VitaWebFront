import { loginNutriologo, registrarNutriologo } from '../utils/api.js';
import { router } from '../utils/router.js';
import { validators, validarFormulario, limpiarValidaciones, limpiarValidacionEnCampo } from '../utils/validation.js';

export const LoginPage = async () => {
  const html = `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md animate-scale-in">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-2xl shadow-blue-500/20 ring-2 ring-white/10">
            V
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">VitaNutrición</h1>
          <p class="text-blue-200/70 mt-2 font-medium">Dashboard del Nutriólogo</p>
        </div>

        <!-- Card Container -->
        <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
          
          <!-- Auth Toggle Tabs -->
          <div class="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button id="tabLogin" class="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-white text-slate-800 shadow-sm transition-all">
              Ingresar
            </button>
            <button id="tabRegister" class="flex-1 text-center py-2 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-800 transition-all">
              Registrarse
            </button>
          </div>

          <!-- Error Alert (Hidden by default) -->
          <div id="errorAlert" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span id="errorMessage">Error</span>
          </div>

          <!-- Success Alert (Hidden by default) -->
          <div id="successAlert" class="hidden mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span id="successMessage">Registro exitoso</span>
          </div>

          <!-- Form -->
          <form id="authForm" class="space-y-4">
            <!-- Register Specific Fields -->
            <div id="registerFields" class="hidden space-y-4">
              <div class="form-group">
                <label class="form-label flex items-center gap-2" for="nombreCompleto">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Nombre Completo
                </label>
                <input type="text" id="nombreCompleto" placeholder="Tu nombre completo" class="input-field" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label flex items-center gap-2" for="telefono">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Teléfono
                  </label>
                  <input type="tel" id="telefono" placeholder="10 dígitos" maxlength="10" minlength="10" pattern="[0-9]{10}" class="input-field" title="El teléfono debe tener exactamente 10 dígitos" />
                </div>
                <div class="form-group">
                  <label class="form-label flex items-center gap-2" for="cedula">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Cédula
                  </label>
                  <input type="text" id="cedula" placeholder="7 u 8 dígitos" maxlength="8" minlength="7" pattern="[0-9]{7,8}" class="input-field" title="La cédula profesional debe tener 7 u 8 dígitos" />
                </div>
              </div>
            </div>

            <!-- Common Fields -->
            <div class="form-group">
              <label class="form-label flex items-center gap-2" for="email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Correo Electrónico
              </label>
              <input type="email" id="email" required placeholder="tu@email.com" class="input-field" />
            </div>

            <div class="form-group">
              <label class="form-label flex items-center gap-2" for="password">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Contraseña
              </label>
              <input type="password" id="password" required placeholder="••••••••" class="input-field" />
            </div>

            <!-- Forgot Password Link -->
            <div id="forgotLink" class="text-right -mt-2">
              <a href="#/forgot-password" class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                ¿Olvidó su contraseña?
              </a>
            </div>

            <!-- Submit Button -->
            <button type="submit" id="submitBtn" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <span id="submitText">Iniciar Sesión</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    let mode = 'login';
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const registerFields = document.getElementById('registerFields');
    const submitText = document.getElementById('submitText');
    const forgotLink = document.getElementById('forgotLink');
    const authForm = document.getElementById('authForm');
    
    const nombreInput = document.getElementById('nombreCompleto');
    const telefonoInput = document.getElementById('telefono');
    const cedulaInput = document.getElementById('cedula');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const successAlert = document.getElementById('successAlert');
    const successMessage = document.getElementById('successMessage');

    const toggleMode = (newMode) => {
      mode = newMode;
      errorAlert.classList.add('hidden');
      successAlert.classList.add('hidden');
      limpiarValidaciones();

      if (mode === 'login') {
        tabLogin.className = "flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-white text-slate-800 shadow-sm transition-all";
        tabRegister.className = "flex-1 text-center py-2 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-800 transition-all";
        registerFields.classList.add('hidden');
        forgotLink.classList.remove('hidden');
        
        nombreInput.removeAttribute('required');
        telefonoInput.removeAttribute('required');
        cedulaInput.removeAttribute('required');
        
        submitText.textContent = "Iniciar Sesión";
      } else {
        tabRegister.className = "flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-white text-slate-800 shadow-sm transition-all";
        tabLogin.className = "flex-1 text-center py-2 text-sm font-semibold rounded-lg text-slate-500 hover:text-slate-800 transition-all";
        registerFields.classList.remove('hidden');
        forgotLink.classList.add('hidden');
        
        nombreInput.setAttribute('required', 'true');
        telefonoInput.setAttribute('required', 'true');
        cedulaInput.setAttribute('required', 'true');
        
        submitText.textContent = "Crear Cuenta";
      }
    };

    tabLogin.onclick = () => toggleMode('login');
    tabRegister.onclick = () => toggleMode('register');

    telefonoInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });

    cedulaInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });

    authForm.onsubmit = async (e) => {
      e.preventDefault();
      errorAlert.classList.add('hidden');
      successAlert.classList.add('hidden');

      try {
        if (mode === 'login') {
          const valido = validarFormulario([
            { campo: 'email', nombre: 'Correo', valor: emailInput.value, validacion: validators.email },
            { campo: 'password', nombre: 'Contraseña', valor: passwordInput.value, validacion: validators.contrasena }
          ]);
          if (!valido) return;

          const emailKey = emailInput.value.trim().toLowerCase();
          await loginNutriologo(emailInput.value, passwordInput.value);

          // Si el servidor no devolvió teléfono y cédula, recuperarlos de localStorage
          const savedInfo = localStorage.getItem(`nutriologo_info_${emailKey}`);
          if (savedInfo) {
            const parsed = JSON.parse(savedInfo);
            const nutriologoActual = JSON.parse(localStorage.getItem('nutriologo_actual')) || {};
            const merged = {
              telefono: nutriologoActual.telefono || parsed.telefono || '',
              cedula: nutriologoActual.cedula || parsed.cedula || '',
              ...nutriologoActual
            };
            localStorage.setItem('nutriologo_actual', JSON.stringify(merged));
          }

          router.navigate('/dashboard');
        } else {
          const phone = telefonoInput.value.trim();
          const cedulaVal = cedulaInput.value.trim();

          const valido = validarFormulario([
            { campo: 'nombreCompleto', nombre: 'Nombre', valor: nombreInput.value, validacion: validators.soloLetras },
            { campo: 'email', nombre: 'Correo', valor: emailInput.value, validacion: validators.email },
            { campo: 'telefono', nombre: 'Teléfono', valor: phone, validacion: validators.telefono },
            { campo: 'cedula', nombre: 'Cédula', valor: cedulaVal, validacion: validators.cedula },
            { campo: 'password', nombre: 'Contraseña', valor: passwordInput.value, validacion: validators.contrasena }
          ]);
          if (!valido) return;

          const emailKey = emailInput.value.trim().toLowerCase();
          await registrarNutriologo({
            nombreCompleto: nombreInput.value,
            email: emailInput.value,
            contrasena: passwordInput.value,
            telefono: phone,
            cedula: cedulaVal
          });

          // Guardar teléfono y cédula localmente asociados al correo
          localStorage.setItem(`nutriologo_info_${emailKey}`, JSON.stringify({
            telefono: phone,
            cedula: cedulaVal
          }));
          
          successMessage.textContent = "Cuenta registrada exitosamente. ¡Ya puedes iniciar sesión!";
          successAlert.classList.remove('hidden');
          toggleMode('login');
        }
      } catch (err) {
        errorMessage.textContent = err.message;
        errorAlert.classList.remove('hidden');
      }
    };
  }, 0);

  return html;
};
