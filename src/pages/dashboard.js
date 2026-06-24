import { getPacientes, getCitas } from '../utils/api.js';
import { router } from '../utils/router.js';
import { formatDate, getEstadoStyle, getEstadoLabel } from '../utils/formatters.js';
import { createLayout } from '../components/layout.js';

export const DashboardPage = async () => {
  const [pacientes, citas] = await Promise.all([
    getPacientes().catch(e => { console.error(e); return []; }),
    getCitas().catch(e => { console.error(e); return []; })
  ]);

  // Clonamos los arreglos por seguridad y aseguramos que no sean null/undefined
  const listaPacientes = pacientes || [];
  const listaCitas = citas || [];

  // CORRECCIÓN: Agregamos ?.toLowerCase() para evitar fallos por mayúsculas o valores nulos
  const citasPendientes = listaCitas.filter(c => c.estado?.toLowerCase() === 'pendiente').length;
  const pacientesActivos = listaPacientes.filter(p => p.estado?.toLowerCase() === 'activo').length;
  const citasCompletadas = listaCitas.filter(c => c.estado?.toLowerCase() === 'completada').length;

  const html = `
    <div class="space-y-8 animate-slide-in">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Bienvenido a tu panel de control de nutrición</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="stat-card blue">
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
          <div class="flex items-center gap-1 mt-2 text-white/60 text-xs">
          </div>
        </div>
        <div class="stat-card green">
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
          <div class="flex items-center gap-1 mt-2 text-white/60 text-xs">
            <span>Historial completo</span>
          </div>
        </div>
        <div class="stat-card yellow">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p class="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Citas Pendientes</p>
          <p class="text-3xl font-bold tracking-tight">${citasPendientes}</p>
          <div class="flex items-center gap-1 mt-2 text-white/60 text-xs">
            <span>Por atender</span>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <p class="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Completadas</p>
          <p class="text-3xl font-bold tracking-tight">${citasCompletadas}</p>
          <div class="flex items-center gap-1 mt-2 text-white/60 text-xs">
            <span>Finalizadas</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="dashboard-card">
          <div class="flex justify-between items-center mb-5">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Próximas Citas
            </h2>
            <a href="#/citas" class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Ver todas</a>
          </div>
          <div class="space-y-2">
            ${listaCitas.filter(c => c.estado?.toLowerCase() === 'pendiente').slice(0, 5).map(cita => {
              // CORRECCIÓN: Buscamos al paciente intentando hacer match tanto con id_paciente como con id estándar
              const paciente = listaPacientes.find(p => 
                (p.id_paciente && p.id_paciente === cita.id_paciente) || 
                (p.id && p.id === cita.id_paciente)
              );
              
              const inicial = (paciente?.nombreCompleto || paciente?.nombre || '?').charAt(0).toUpperCase();
              const nombre = paciente?.nombreCompleto || paciente?.nombre || 'Desconocido';

              return `
                <div class="list-item">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      ${inicial}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900 text-sm">${nombre}</p>
                      <p class="text-xs text-slate-500">${formatDate(cita.fecha_hora)}</p>
                    </div>
                  </div>
                  <span class="badge-status badge-pending text-xs">${getEstadoLabel(cita.estado)}</span>
                </div>
              `;
            }).join('')}
            ${listaCitas.filter(c => c.estado?.toLowerCase() === 'pendiente').length === 0 ? '<div class="text-center py-8 text-slate-500 text-sm">Sin citas pendientes</div>' : ''}
          </div>
        </div>

        <div class="dashboard-card">
          <div class="flex justify-between items-center mb-5">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              Últimos Pacientes
            </h2>
            <a href="#/pacientes" class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Ver todos</a>
          </div>
          <div class="space-y-2">
            ${[...listaPacientes].slice(-5).reverse().map(paciente => {
              const nombre = paciente.nombreCompleto || paciente.nombre || 'Sin nombre';
              const inicial = nombre.charAt(0).toUpperCase();
              const email = paciente.email || 'Sin correo registrado';
              const esActivo = (paciente.estado?.toLowerCase() === 'activo') || paciente.activo === true;

              return `
                <div class="list-item">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      ${inicial}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900 text-sm">${nombre}</p>
                      <p class="text-xs text-slate-500">${email}</p>
                    </div>
                  </div>
                  <span class="badge-status ${esActivo ? 'badge-active' : 'badge-inactive'} text-xs">${getEstadoLabel(paciente.estado ?? (paciente.activo ? 'activo' : 'inactivo'))}</span>
                </div>
              `;
            }).join('')}
            ${listaPacientes.length === 0 ? '<div class="text-center py-8 text-slate-500 text-sm">Sin pacientes registrados</div>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  return createLayout(html, '/dashboard');
};