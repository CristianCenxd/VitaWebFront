import { createLayout } from '../components/layout.js';
import { getGoogleAuthUrl, getGoogleStatus } from '../utils/api.js';

export const ConfiguracionPage = async () => {
  const isDark = localStorage.getItem('theme') === 'dark';
  let googleStatus = null;
  try {
    googleStatus = await getGoogleStatus();
  } catch (e) {
    googleStatus = { conectado: false };
  }

  const conectado = googleStatus?.conectado === true;

  const html = `
    <div class="space-y-8 animate-slide-in">
      <!-- Page Header -->
      <div class="page-header">
        <h1>Configuración</h1>
        <p>Ajusta las preferencias de la aplicación</p>
      </div>

      <div class="max-w-2xl space-y-6">
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
                <p class="text-xs text-slate-500 dark:text-slate-400">Cambia la interfaz a una paleta de colores oscuros para descansar la vista</p>
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
                  <p class="font-semibold text-slate-900 dark:text-white text-sm">Sincronización con Google Calendar</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">${conectado ? 'Tu calendario está conectado. Las citas se sincronizarán automáticamente.' : 'Conecta tu Google Calendar para sincronizar las citas automáticamente y enviar invitaciones por correo a tus pacientes.'}</p>
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
      </div>
    </div>
  `;

  setTimeout(() => {
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
  }, 0);

  return createLayout(html, '/configuracion');
};
