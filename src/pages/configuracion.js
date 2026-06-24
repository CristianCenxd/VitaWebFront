import { createLayout } from '../components/layout.js';
import { getGoogleAuthUrl, getGoogleStatus, actualizarNutriologo, verificarToken, restablecerContrasena, getPerfilNutriologo } from '../utils/api.js';
import { validators, validarFormulario } from '../utils/validation.js';
import { router } from '../utils/router.js';

export const ConfiguracionPage = async () => {
  const content = `
    <div id="contenidoConfiguracion" class="space-y-8 animate-slide-in">
      <div class="page-header">
        <h1>Configuración</h1>
        <p>Ajusta las preferencias de la aplicación</p>
      </div>
      <div class="text-center py-16">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 font-medium">Cargando configuración...</p>
      </div>
    </div>
  `;

  setTimeout(async () => {
    await renderizarConfiguracion();
  }, 0);

  return content;
};

async function renderizarConfiguracion() {
  const contenedor = document.getElementById('contenidoConfiguracion');
  if (!contenedor) return;

  const isDark = localStorage.getItem('theme') === 'dark';
  let googleStatus = null;
  let nutriologo = JSON.parse(localStorage.getItem('nutriologo_actual')) || {};

  // Intentamos obtener el perfil actualizado del servidor
  try {
    const resPerfil = await getPerfilNutriologo();
    if (resPerfil) {
      const dataPerfil = resPerfil.data || resPerfil;
      nutriologo = {
        ...nutriologo,
        ...dataPerfil
      };
      localStorage.setItem('nutriologo_actual', JSON.stringify(nutriologo));
    }
  } catch (e) {
    console.warn('No se pudo obtener el perfil del servidor:', e);
  }

  // Fallback si no vienen en el objeto principal (los recuperamos de la info extra guardada localmente)
  if (nutriologo.email) {
    const emailKey = nutriologo.email.trim().toLowerCase();
    const savedInfo = localStorage.getItem(`nutriologo_info_${emailKey}`);
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      nutriologo.telefono = nutriologo.telefono || parsed.telefono || '';
      nutriologo.cedula = nutriologo.cedula || parsed.cedula || '';
      localStorage.setItem('nutriologo_actual', JSON.stringify(nutriologo));
    }
  }

  try {
    googleStatus = await getGoogleStatus();
  } catch (e) {
    googleStatus = { conectado: false };
  }

  const conectado = googleStatus?.conectado === true;
  const n = nutriologo;

  contenedor.innerHTML = `
    <div class="page-header">
      <h1>Configuración</h1>
      <p>Ajusta las preferencias de la aplicación</p>
    </div>

    <div class="max-w-2xl space-y-6">
      <!-- Datos del Nutriólogo -->
      <div class="detail-section" id="seccionPerfil">
        <div class="detail-section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Datos del Nutriólogo
          </h2>
          <button id="editarPerfilBtn" class="btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar
          </button>
        </div>
        <div class="detail-section-body" id="cuerpoPerfil">
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre Completo</label>
              <p>${n.nombreCompleto || n.nombre || '—'}</p>
            </div>
            <div class="info-item">
              <label>Correo Electrónico</label>
              <p>${n.email || '—'}</p>
            </div>
            <div class="info-item">
              <label>Teléfono</label>
              <p>${n.telefono || '—'}</p>
            </div>
            <div class="info-item">
              <label>Cédula Profesional</label>
              <p>${n.cedula || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Preferencias Visuales -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Preferencias Visuales
          </h2>
        </div>
        <div class="detail-section-body space-y-6">
          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <p class="font-semibold text-slate-900 dark:text-white text-sm">Modo Oscuro</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Cambia la interfaz a una paleta de colores oscuros</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="darkModeToggle" class="sr-only peer" ${isDark ? 'checked' : ''}>
              <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Google Calendar -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34a853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="12" y1="14" x2="12" y2="18"></line>
              <line x1="10" y1="16" x2="14" y2="16"></line>
            </svg>
            Google Calendar
          </h2>
        </div>
        <div class="detail-section-body space-y-4">
          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white text-sm">Sincronización con Google Calendar</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">${conectado ? 'Tu calendario está conectado.' : 'Conecta tu Google Calendar para sincronizar las citas.'}</p>
                </div>
              </div>
              <div id="googleCalendarStatus" class="flex-shrink-0">
                ${conectado ? `
                  <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/40">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Conectado
                  </span>
                ` : `
                  <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                    Desconectado
                  </span>
                `}
              </div>
            </div>
            <button id="googleCalendarBtn" class="btn-primary w-full justify-center">
              ${conectado ? 'Desconectar Google Calendar' : 'Conectar Google Calendar'}
            </button>
          </div>
        </div>

        <!-- Cerrar Sesión -->
        <div class="detail-section border-red-200 dark:border-red-900/40">
          <div class="detail-section-header">
            <h2 class="text-red-600 dark:text-red-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Cerrar Sesión
            </h2>
          </div>
          <div class="detail-section-body">
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Cierra tu sesión actual. Serás redirigido a la pantalla de inicio de sesión.</p>
            <button id="cerrarSesionBtn" class="btn-danger w-full justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Editar perfil
  const editarBtn = document.getElementById('editarPerfilBtn');
  if (editarBtn) {
    editarBtn.addEventListener('click', () => {
      const cuerpo = document.getElementById('cuerpoPerfil');
      const n = nutriologo;
      cuerpo.innerHTML = `
        <form id="formPerfil" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="form-group">
              <label class="form-label" for="editNombre">Nombre Completo</label>
              <input type="text" id="editNombre" value="${n.nombreCompleto || n.nombre || ''}" class="input-field" placeholder="Tu nombre completo" />
            </div>
            <div class="form-group">
              <label class="form-label" for="editEmail">Correo Electrónico</label>
              <input type="email" id="editEmail" value="${n.email || ''}" class="input-field" placeholder="tu@email.com" />
            </div>
            <div class="form-group">
              <label class="form-label" for="editTelefono">Teléfono</label>
              <input type="tel" id="editTelefono" value="${n.telefono || ''}" maxlength="10" class="input-field" placeholder="10 dígitos" />
            </div>
            <div class="form-group">
              <label class="form-label" for="editCedula">Cédula Profesional</label>
              <input type="text" id="editCedula" value="${n.cedula || ''}" maxlength="8" class="input-field" placeholder="7 u 8 dígitos" />
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Guardar Cambios
            </button>
            <button type="button" id="cancelarEditarPerfil" class="btn-secondary">Cancelar</button>
          </div>
        </form>
      `;

      const telInput = document.getElementById('editTelefono');
      if (telInput) {
        telInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '');
        });
      }

      const cedulaInput = document.getElementById('editCedula');
      if (cedulaInput) {
        cedulaInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '');
        });
      }

      document.getElementById('formPerfil').onsubmit = async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('editNombre').value;
        const email = document.getElementById('editEmail').value;
        const telefono = document.getElementById('editTelefono').value;
        const cedula = document.getElementById('editCedula').value;

        const valido = validarFormulario([
          { campo: 'editNombre', nombre: 'Nombre', valor: nombre, validacion: validators.soloLetras },
          { campo: 'editEmail', nombre: 'Correo', valor: email, validacion: validators.email },
          { campo: 'editTelefono', nombre: 'Teléfono', valor: telefono, validacion: validators.telefono },
          { campo: 'editCedula', nombre: 'Cédula', valor: cedula, validacion: validators.cedula }
        ]);
        if (!valido) return;

        const datosActualizados = {
          ...nutriologo,
          nombreCompleto: nombre,
          email,
          telefono,
          cedula
        };

        localStorage.setItem('nutriologo_actual', JSON.stringify(datosActualizados));
        localStorage.setItem(`nutriologo_info_${email.trim().toLowerCase()}`, JSON.stringify({
          telefono,
          cedula
        }));

        try {
          await actualizarNutriologo(datosActualizados);
        } catch (err) {
          console.warn('No se pudo actualizar en el servidor:', err.message);
        }

        cuerpo.innerHTML = `
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre Completo</label>
              <p>${nombre}</p>
            </div>
            <div class="info-item">
              <label>Correo Electrónico</label>
              <p>${email}</p>
            </div>
            <div class="info-item">
              <label>Teléfono</label>
              <p>${telefono}</p>
            </div>
            <div class="info-item">
              <label>Cédula Profesional</label>
              <p>${cedula}</p>
            </div>
          </div>
        `;
        editarBtn.classList.remove('hidden');
      };

      document.getElementById('cancelarEditarPerfil').onclick = () => {
        const n = JSON.parse(localStorage.getItem('nutriologo_actual')) || {};
        cuerpo.innerHTML = `
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre Completo</label>
              <p>${n.nombreCompleto || n.nombre || '—'}</p>
            </div>
            <div class="info-item">
              <label>Correo Electrónico</label>
              <p>${n.email || '—'}</p>
            </div>
            <div class="info-item">
              <label>Teléfono</label>
              <p>${n.telefono || '—'}</p>
            </div>
            <div class="info-item">
              <label>Cédula Profesional</label>
              <p>${n.cedula || '—'}</p>
            </div>
          </div>
        `;
      };
    });
  }

  // Dark mode toggle
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Google Calendar
  const googleBtn = document.getElementById('googleCalendarBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      if (conectado) return;
      try {
        const res = await getGoogleAuthUrl();
        if (res?.url) {
          window.location.href = res.url;
        } else if (res?.authUrl) {
          window.location.href = res.authUrl;
        } else {
          alert('Error al obtener la URL de autenticación de Google');
        }
      } catch (err) {
        alert('Error al conectar con Google Calendar: ' + err.message);
      }
    });
  }

  // Cerrar sesión
  const cerrarBtn = document.getElementById('cerrarSesionBtn');
  if (cerrarBtn) {
    cerrarBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('nutriologo_actual');
        document.documentElement.classList.remove('dark');
        router.navigate('/login');
      }
    });
  }
}
