import { getPacientes, getCitas } from '../utils/api.js';
import { router } from '../utils/router.js';
import { formatDate, formatDateTime, getEstadoStyle, getEstadoLabel } from '../utils/formatters.js';
import { createLayout } from '../components/layout.js';

let activeTab = 'citas-totales'; // 'pacientes', 'citas-totales', 'citas-pendientes', 'citas-completadas'
let cachedPacientes = null;
let cachedCitas = null;

export const DashboardPage = async () => {
  // Reiniciamos caché al entrar para obtener datos frescos
  cachedPacientes = null;
  cachedCitas = null;

  const html = `
    <div id="contenidoDashboard" class="space-y-8 animate-slide-in">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Bienvenido a tu panel de control de nutrición</p>
      </div>
      <div class="text-center py-16">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 font-medium">Cargando dashboard...</p>
      </div>
    </div>
  `;

  setTimeout(async () => {
    await renderizarDashboard();
  }, 0);

  return html;
};

async function renderizarDashboard() {
  const contenedor = document.getElementById('contenidoDashboard');
  if (!contenedor) return;

  if (!cachedPacientes || !cachedCitas) {
    const [pacientes, citas] = await Promise.all([
      getPacientes().catch(e => { console.error(e); return []; }),
      getCitas().catch(e => { console.error(e); return []; })
    ]);
    cachedPacientes = pacientes || [];
    cachedCitas = citas || [];
  }

  const listaPacientes = cachedPacientes;
  const listaCitas = cachedCitas;

  const citasPendientes = listaCitas.filter(c => c.estado?.toLowerCase() === 'pendiente').length;
  const pacientesActivos = listaPacientes.filter(p => p.estado?.toLowerCase() === 'activo').length;
  const citasCompletadas = listaCitas.filter(c => c.estado?.toLowerCase() === 'completada').length;

  // Clases activas según la pestaña seleccionada
  const activeBlue = activeTab === 'pacientes' ? 'ring-4 ring-offset-2 ring-blue-500 scale-[1.02] shadow-lg' : '';
  const activeGreen = activeTab === 'citas-totales' ? 'ring-4 ring-offset-2 ring-emerald-500 scale-[1.02] shadow-lg' : '';
  const activeYellow = activeTab === 'citas-pendientes' ? 'ring-4 ring-offset-2 ring-amber-500 scale-[1.02] shadow-lg' : '';
  const activePurple = activeTab === 'citas-completadas' ? 'ring-4 ring-offset-2 ring-violet-500 scale-[1.02] shadow-lg' : '';

  let detalleTitulo = '';
  let verTodoLink = '';
  let detalleHtml = '';

  if (activeTab === 'pacientes') {
    detalleTitulo = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
      </svg>
      Pacientes Registrados
    `;
    verTodoLink = '#/pacientes';

    detalleHtml = `
      <div class="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
        <table class="table-modern w-full min-w-[600px]">
          <thead>
            <tr>
              <th class="whitespace-nowrap">Paciente</th>
              <th class="whitespace-nowrap">Email</th>
              <th class="whitespace-nowrap">Teléfono</th>
              <th class="whitespace-nowrap">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${listaPacientes.length === 0 ? `
              <tr>
                <td colspan="4" class="text-center py-8 text-slate-500 text-sm">Sin pacientes registrados</td>
              </tr>
            ` : [...listaPacientes].slice(-10).reverse().map(paciente => {
              const nombre = paciente.nombreCompleto || paciente.nombre || 'Sin nombre';
              const inicial = nombre.charAt(0).toUpperCase();
              const email = paciente.email || 'Sin correo registrado';
              const tel = paciente.telefono || 'Sin teléfono';
              const esActivo = (paciente.estado?.toLowerCase() === 'activo') || paciente.activo === true;

              return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td class="whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        ${inicial}
                      </div>
                      <span class="font-semibold text-slate-900 dark:text-white">${nombre}</span>
                    </div>
                  </td>
                  <td class="text-slate-600 dark:text-slate-300 whitespace-nowrap">${email}</td>
                  <td class="text-slate-600 dark:text-slate-300 whitespace-nowrap">${tel}</td>
                  <td class="whitespace-nowrap">
                    <span class="badge-status ${esActivo ? 'badge-active' : 'badge-inactive'} text-xs">
                      ${getEstadoLabel(paciente.estado ?? (paciente.activo ? 'activo' : 'inactivo'))}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    let filteredCitas = [];
    if (activeTab === 'citas-totales') {
      detalleTitulo = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Historial Completo de Citas
      `;
      filteredCitas = listaCitas;
    } else if (activeTab === 'citas-pendientes') {
      detalleTitulo = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Citas Pendientes (Por atender)
      `;
      filteredCitas = listaCitas.filter(c => c.estado?.toLowerCase() === 'pendiente');
    } else if (activeTab === 'citas-completadas') {
      detalleTitulo = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Historial de Citas Completadas
      `;
      filteredCitas = listaCitas.filter(c => c.estado?.toLowerCase() === 'completada');
    }
    verTodoLink = '#/citas';

    detalleHtml = `
      <div class="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
        <table class="table-modern w-full min-w-[600px]">
          <thead>
            <tr>
              <th class="whitespace-nowrap">Paciente</th>
              <th class="whitespace-nowrap">Fecha y Hora</th>
              <th class="whitespace-nowrap">Motivo</th>
              <th class="whitespace-nowrap">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCitas.length === 0 ? `
              <tr>
                <td colspan="4" class="text-center py-8 text-slate-500 text-sm">Sin citas registradas</td>
              </tr>
            ` : filteredCitas.slice(0, 10).map(cita => {
              const paciente = listaPacientes.find(p => 
                (p.id_paciente && String(p.id_paciente) === String(cita.id_paciente)) || 
                (p.id && String(p.id) === String(cita.id_paciente))
              );
              const nombre = paciente?.nombreCompleto || paciente?.nombre || 'Desconocido';
              const inicial = nombre.charAt(0).toUpperCase();
              const estadoNorm = (cita.estado || 'pendiente').toLowerCase();

              return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <td class="whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        ${inicial}
                      </div>
                      <span class="font-semibold text-slate-900 dark:text-white">${nombre}</span>
                    </div>
                  </td>
                  <td class="text-slate-600 dark:text-slate-300 whitespace-nowrap">${formatDateTime(cita.fecha_hora)}</td>
                  <td class="text-slate-600 dark:text-slate-300 whitespace-nowrap">${cita.motivo || '-'}</td>
                  <td class="whitespace-nowrap">
                    <span class="badge-status ${getEstadoStyle(estadoNorm)} text-xs">${getEstadoLabel(estadoNorm)}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  contenedor.innerHTML = `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Bienvenido a tu panel de control de nutrición</p>
    </div>

    <!-- Tarjetas Estadísticas Interactivas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Card Pacientes -->
      <div id="tabPacientes" class="stat-card blue cursor-pointer select-none transition-all duration-300 ${activeBlue}">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <p class="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Pacientes</p>
        <p class="text-3xl font-bold tracking-tight">${listaPacientes.length}</p>
        <div class="flex items-center gap-1 mt-2 text-white/60 text-xs font-medium">
          <span>Listar pacientes</span>
        </div>
      </div>

      <!-- Card Total Citas -->
      <div id="tabTotalCitas" class="stat-card green cursor-pointer select-none transition-all duration-300 ${activeGreen}">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <p class="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Total Citas</p>
        <p class="text-3xl font-bold tracking-tight">${listaCitas.length}</p>
        <div class="flex items-center gap-1 mt-2 text-white/60 text-xs font-medium">
          <span>Historial completo</span>
        </div>
      </div>

      <!-- Card Citas Pendientes -->
      <div id="tabCitasPendientes" class="stat-card yellow cursor-pointer select-none transition-all duration-300 ${activeYellow}">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p class="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Citas Pendientes</p>
        <p class="text-3xl font-bold tracking-tight">${citasPendientes}</p>
        <div class="flex items-center gap-1 mt-2 text-white/60 text-xs font-medium">
          <span>Por atender</span>
        </div>
      </div>

      <!-- Card Citas Completadas -->
      <div id="tabCitasCompletadas" class="stat-card purple cursor-pointer select-none transition-all duration-300 ${activePurple}">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <p class="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Completadas</p>
        <p class="text-3xl font-bold tracking-tight">${citasCompletadas}</p>
        <div class="flex items-center gap-1 mt-2 text-white/60 text-xs font-medium">
          <span>Finalizadas</span>
        </div>
      </div>
    </div>

    <!-- Sección de Detalle Dinámica -->
    <div class="dashboard-card animate-fade-in overflow-hidden mt-8">
      <div class="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ${detalleTitulo}
        </h2>
        <a href="${verTodoLink}" class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
          Ver todos
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>
      
      ${detalleHtml}
    </div>
  `;

  // Asignar eventos de clic
  document.getElementById('tabPacientes').addEventListener('click', () => {
    activeTab = 'pacientes';
    renderizarDashboard();
  });

  document.getElementById('tabTotalCitas').addEventListener('click', () => {
    activeTab = 'citas-totales';
    renderizarDashboard();
  });

  document.getElementById('tabCitasPendientes').addEventListener('click', () => {
    activeTab = 'citas-pendientes';
    renderizarDashboard();
  });

  document.getElementById('tabCitasCompletadas').addEventListener('click', () => {
    activeTab = 'citas-completadas';
    renderizarDashboard();
  });
}