import { createLayout } from '../components/layout.js';

export const ConfiguracionPage = async () => {
  const isDark = localStorage.getItem('theme') === 'dark';

  const html = `
    <div class="space-y-8 animate-slide-in">
      <!-- Page Header -->
      <div class="page-header">
        <h1>Configuración</h1>
        <p>Ajusta las preferencias de la aplicación</p>
      </div>

      <!-- Config Card -->
      <div class="max-w-2xl">
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
  }, 0);

  return createLayout(html, '/configuracion');
};
