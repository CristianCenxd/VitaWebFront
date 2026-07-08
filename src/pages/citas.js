import { 
  getPacientes, 
  getCitas,
  crearCita as agregarCita,
  actualizarCita,
  cancelarCita,
  completarCita,
  eliminarCita,
  agregarProgreso,
  actualizarPaciente,
  getGoogleStatus,
  getProgresoPaciente
} from '../utils/api.js';
import { router } from '../utils/router.js';
import { formatDate, formatDateTime, getEstadoStyle, getEstadoLabel } from '../utils/formatters.js';
import { createLayout } from '../components/layout.js';
import { validators, validarFormulario } from '../utils/validation.js';

let modo = 'lista';
let citaEnEdicion = null;

export const CitasPage = async () => {
  const content = `
    <div id="contenidoCitas" class="animate-slide-in space-y-6">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1>Citas</h1>
          <p>Administra las consultas y seguimientos de tus pacientes</p>
        </div>
      </div>
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="skeleton h-8 w-32 rounded-lg mb-2"></div>
            <div class="skeleton h-5 w-56 rounded-lg"></div>
          </div>
          <div class="skeleton h-10 w-32 rounded-lg"></div>
        </div>
        <div class="flex gap-2 mb-6">
          <div class="skeleton h-9 w-24 rounded-lg"></div>
          <div class="skeleton h-9 w-24 rounded-lg"></div>
          <div class="skeleton h-9 w-24 rounded-lg"></div>
        </div>
        <div class="skeleton h-64 rounded-xl"></div>
      </div>
    </div>
  `;

  setTimeout(async () => {
    await renderizarVista();
  }, 0);

  return content;
};

let googleConectado = false;
getGoogleStatus()
  .then(res => { googleConectado = res?.conectado === true; })
  .catch(() => { googleConectado = false; });

async function renderizarLista(contenedor) {
  const [citas, pacientes] = await Promise.all([
    getCitas().catch(e => { console.error(e); return []; }),
    getPacientes().catch(e => { console.error(e); return []; })
  ]);

  contenedor.innerHTML = `
      <div class="page-header flex items-center justify-between">
        <div>
          <h1>Citas</h1>
          <p>Administra las consultas y seguimientos de tus pacientes</p>
        </div>
        <div class="flex items-center gap-3">
          
          <button id="crearCitaBtn" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Cita
          </button>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="flex gap-2 flex-wrap">
        <button class="filter-btn active" data-estado="">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
          Todas
        </button>
        <button class="filter-btn" data-estado="pendiente">
          <span class="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
          Próximas
        </button>
        <button class="filter-btn" data-estado="completada">
          <span class="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
          Terminadas
        </button>
        <button class="filter-btn" data-estado="cancelada">
          <span class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
          Canceladas
        </button>
      </div>

      <!-- Table -->
      <div class="detail-section !p-0">
        <div class="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
          <table class="table-modern w-full min-w-[700px]">
            <thead>
              <tr>
                <th class="whitespace-nowrap">Paciente</th>
                <th class="whitespace-nowrap">Fecha y Hora</th>
                <th class="whitespace-nowrap">Motivo</th>
                <th class="whitespace-nowrap">Estado</th>
                <th class="whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody id="tablaCitas">
              ${citas.length === 0 ? `
                <tr>
                  <td colspan="5" class="text-center py-12">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p class="text-slate-500 font-medium">No hay citas registradas</p>
                    <p class="text-slate-400 text-sm mt-1">Programa tu primera cita</p>
                  </td>
                </tr>
              ` : renderizarFilas(citas, pacientes)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.getElementById('crearCitaBtn').addEventListener('click', () => {
    modo = 'crear';
    citaEnEdicion = null;
    renderizarVista();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const estado = e.currentTarget.dataset.estado;
      filtrarCitas(estado, citas, pacientes);
    });
  });

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      const list = await getCitas().catch(() => []);
      citaEnEdicion = list.find(c => c.id_cita === id);
      modo = 'editar';
      await renderizarVista();
    });
  });

  document.querySelectorAll('.btn-seguimiento').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      const list = await getCitas().catch(() => []);
      citaEnEdicion = list.find(c => c.id_cita === id);
      modo = 'seguimiento';
      await renderizarVista();
    });
  });

  document.querySelectorAll('.btn-completar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      await completarCita(id).catch(e => alert(e.message));
      await renderizarVista();
    });
  });

  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(btn.dataset.id);
      if (confirm('¿Cancelar esta cita?')) {
        await cancelarCita(id).catch(e => alert(e.message));
        await renderizarVista();
      }
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(btn.dataset.id);
      if (confirm('¿Eliminar esta cita definitivamente?')) {
        await eliminarCita(id).catch(e => alert(e.message));
        await renderizarVista();
      }
    });
  });

  const googleBadge = document.getElementById('googleSyncBadge');
  if (googleBadge && googleConectado) googleBadge.classList.remove('hidden');
}

function renderizarFilas(citas, pacientes) {
  return citas.map(cita => {
    const paciente = pacientes.find(p => 
      (p.id_paciente && String(p.id_paciente) === String(cita.id_paciente)) || 
      (p.id && String(p.id) === String(cita.id_paciente))
    );
    const estadoNorm = (cita.estado || 'pendiente').toLowerCase();
    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
        <td class="whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              ${(paciente?.nombreCompleto || paciente?.nombre || '?').charAt(0).toUpperCase()}
            </div>
            <span class="font-semibold text-slate-900 dark:text-white">${paciente?.nombreCompleto || paciente?.nombre || 'Desconocido'}</span>
          </div>
        </td>
        <td class="text-slate-600 dark:text-slate-300 whitespace-nowrap">${formatDateTime(cita.fecha_hora)}</td>
        <td class="text-slate-600 dark:text-slate-300 whitespace-nowrap">${cita.motivo || '-'}</td>
        <td class="whitespace-nowrap">
          <span class="badge-status ${getEstadoStyle(estadoNorm)} text-xs">${getEstadoLabel(estadoNorm)}</span>
        </td>
        <td class="whitespace-nowrap">
          <div class="flex items-center gap-2">
            ${estadoNorm === 'pendiente' ? `
              <button class="action-btn action-btn-complete btn-completar" data-id="${cita.id_cita}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Completar
              </button>
              <button class="action-btn action-btn-cancel btn-cancelar" data-id="${cita.id_cita}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancelar
              </button>
            ` : `
              <button class="action-btn action-btn-delete btn-eliminar" data-id="${cita.id_cita}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Eliminar
              </button>
            `}
            <button class="action-btn action-btn-view btn-seguimiento" data-id="${cita.id_cita}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Seguimiento
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filtrarCitas(estado, citas, pacientes) {
  const tablaCitas = document.getElementById('tablaCitas');
  const citasFiltradas = estado ? citas.filter(c => (c.estado || 'pendiente').toLowerCase() === estado.toLowerCase()) : citas;
  tablaCitas.innerHTML = renderizarFilas(citasFiltradas, pacientes);

  document.querySelectorAll('.btn-completar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      await completarCita(id).catch(e => alert(e.message));
      await renderizarVista();
    });
  });

  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      if (confirm('¿Cancelar esta cita?')) {
        await cancelarCita(id).catch(e => alert(e.message));
        await renderizarVista();
      }
    });
  });

  document.querySelectorAll('.btn-seguimiento').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      const list = await getCitas().catch(() => []);
      citaEnEdicion = list.find(c => c.id_cita === id);
      modo = 'seguimiento';
      await renderizarVista();
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(btn.dataset.id);
      if (confirm('¿Eliminar esta cita definitivamente?')) {
        await eliminarCita(id).catch(e => alert(e.message));
        await renderizarVista();
      }
    });
  });
}

async function renderizarFormulario(contenedor) {
  const pacientes = await getPacientes().catch(() => []);
  const titulo = modo === 'crear' ? 'Nueva Cita' : 'Editar Cita';
  const datosIniciales = citaEnEdicion || {};

  contenedor.innerHTML = `
    <div class="animate-slide-in max-w-2xl">
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="12" y1="14" x2="12" y2="18"></line>
              <line x1="10" y1="16" x2="14" y2="16"></line>
            </svg>
            ${titulo}
          </h2>
        </div>
        <div class="detail-section-body">
          <form id="formCita" class="space-y-5">
            <div class="form-group">
              <label class="form-label" for="idPaciente">Paciente *</label>
              <select id="idPaciente" required class="input-field">
                <option value="">Seleccionar paciente...</option>
                ${pacientes.map(p => {
                  const esActivo = (p.estado?.toLowerCase() === 'activo') || p.activo === true;
                  if (!esActivo && String(datosIniciales.id_paciente) !== String(p.id_paciente || p.id)) {
                    return '';
                  }
                  return `
                    <option value="${p.id_paciente || p.id}" ${String(datosIniciales.id_paciente) === String(p.id_paciente || p.id) ? 'selected' : ''}>${p.nombreCompleto} ${!esActivo ? ' (Inactivo)' : ''}</option>
                  `;
                }).join('')}
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="form-group">
                <label class="form-label" for="fechaHora">Fecha y Hora *</label>
                <input type="datetime-local" id="fechaHora" value="${datosIniciales.fecha_hora ? (() => {
                  const date = new Date(datosIniciales.fecha_hora);
                  const tzOffset = date.getTimezoneOffset() * 60000;
                  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
                })() : ''}" min="${modo === 'crear' ? (() => {
                  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
                  return (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
                })() : ''}" required class="input-field" />
              </div>
              <div class="form-group">
                <label class="form-label" for="estado">Estado</label>
                <select id="estado" class="input-field">
                  <option value="Pendiente" ${datosIniciales.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="Confirmada" ${datosIniciales.estado === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
                  <option value="Completada" ${datosIniciales.estado === 'Completada' ? 'selected' : ''}>Completada</option>
                  <option value="Cancelada" ${datosIniciales.estado === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="motivo">Motivo de la Cita *</label>
              <input type="text" id="motivo" value="${datosIniciales.motivo || ''}" required placeholder="Ej: Control nutricional, seguimiento de dieta..." class="input-field" />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                ${modo === 'crear' ? 'Crear Cita' : 'Guardar Cambios'}
              </button>
              <button type="button" id="cancelarBtn" class="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('formCita').addEventListener('submit', async (e) => {
    e.preventDefault();
    const idPaciente = document.getElementById('idPaciente').value;
    const fechaHora = document.getElementById('fechaHora').value;
    const motivo = document.getElementById('motivo').value;

    const valido = validarFormulario([
      { campo: 'idPaciente', nombre: 'Paciente', valor: idPaciente, validacion: (v) => !v ? 'Selecciona un paciente' : null },
      { campo: 'fechaHora', nombre: 'Fecha y hora', valor: fechaHora, validacion: (v) => {
        if (!v) return 'La fecha y hora son obligatorias';
        const fechaOriginal = datosIniciales.fecha_hora ? new Date(datosIniciales.fecha_hora).getTime() : null;
        const fechaSeleccionada = new Date(v).getTime();
        if (modo === 'crear' || (fechaOriginal && fechaSeleccionada !== fechaOriginal)) {
          const ahora = new Date().getTime();
          if (fechaSeleccionada <= ahora) {
            return 'La fecha y hora de la cita deben ser en el futuro (posteriores al momento actual)';
          }
        }
        return null;
      }},
      { campo: 'motivo', nombre: 'Motivo', valor: motivo, validacion: (v) => !v?.trim() ? 'El motivo es obligatorio' : null }
    ]);
    if (!valido) return;

    const selectedPaciente = pacientes.find(p => 
      (p.id_paciente && String(p.id_paciente) === String(idPaciente)) || 
      (p.id && String(p.id) === String(idPaciente))
    );

    const esActivo = (selectedPaciente?.estado?.toLowerCase() === 'activo') || selectedPaciente?.activo === true;
    if (document.getElementById('estado').value?.toLowerCase() === 'pendiente' && !esActivo) {
      alert('No puedes programar o guardar una cita pendiente para un paciente inactivo.');
      return;
    }

    const datos = {
      id_paciente: parseInt(idPaciente),
      fecha_hora: new Date(fechaHora).toISOString(),
      motivo,
      estado: document.getElementById('estado').value,
      email_paciente: selectedPaciente?.email || ''
    };
    try {
      if (modo === 'crear') await agregarCita(datos);
      else await actualizarCita(citaEnEdicion.id_cita, datos);
      modo = 'lista';
      await renderizarVista();
    } catch (err) {
      alert('Error al guardar cita: ' + err.message);
    }
  });

  document.getElementById('cancelarBtn').addEventListener('click', async () => {
    modo = 'lista';
    await renderizarVista();
  });
}

async function renderizarSeguimiento(contenedor) {
  const [pacientes, progresoList] = await Promise.all([
    getPacientes().catch(() => []),
    getProgresoPaciente(citaEnEdicion.id_paciente).catch(() => [])
  ]);
  const paciente = pacientes.find(p => 
    (p.id_paciente && String(p.id_paciente) === String(citaEnEdicion.id_paciente)) || 
    (p.id && String(p.id) === String(citaEnEdicion.id_paciente))
  );
  const estaturaPaciente = paciente?.estatura_cm || paciente?.estatura || paciente?.height;
  const ultimoProgreso = progresoList.length > 0 
    ? [...progresoList].sort((a, b) => new Date(b.fecha_revision) - new Date(a.fecha_revision))[0] 
    : null;

  contenedor.innerHTML = `
    <div class="animate-slide-in max-w-2xl">
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            Seguimiento Médico
          </h2>
        </div>
        <div class="detail-section-body">
          <div class="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-800/30 mb-6">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
              ${(paciente?.nombreCompleto || paciente?.nombre || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-semibold text-slate-900 dark:text-white text-sm">${paciente?.nombreCompleto || paciente?.nombre}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Registrar seguimiento de la cita</p>
            </div>
          </div>
          
          ${(!estaturaPaciente || estaturaPaciente <= 0) ? `
            <div class="p-3 mb-4 text-sm text-yellow-800 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>El paciente no tiene registrada su estatura en el perfil. Edítalo para ingresar su estatura y poder calcular el IMC de forma automática.</span>
            </div>
          ` : ''}

          <form id="formSeguimiento" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-5">
              <div class="form-group">
                <label class="form-label" for="estatura">Estatura (cm) *</label>
                <input type="number" id="estatura" value="${estaturaPaciente || ''}" required placeholder="Ej: 170" class="input-field" />
              </div>
              <div class="form-group">
                <label class="form-label" for="peso">Peso (kg) *</label>
                <input type="number" id="peso" step="0.1" value="${ultimoProgreso?.peso_kg || ultimoProgreso?.peso || ''}" required placeholder="75.5" class="input-field" />
              </div>
              <div class="form-group">
                <label class="form-label" for="porcentajeGrasa">Grasa Corporal (%)</label>
                <input type="number" id="porcentajeGrasa" step="0.1" value="${ultimoProgreso?.porcentaje_grasa || ultimoProgreso?.grasa || ''}" placeholder="25.5" class="input-field" />
              </div>
              <div class="form-group">
                <label class="form-label" for="imc">IMC (Autocalculado)</label>
                <input type="number" id="imc" step="0.1" value="${ultimoProgreso?.imc || ''}" placeholder="Autocalculado" readonly class="input-field bg-slate-100 dark:bg-slate-800 cursor-not-allowed" />
              </div>
              <div class="form-group">
                <label class="form-label" for="masaMuscular">Masa Muscular (kg) (Autocalculada)</label>
                <input type="number" id="masaMuscular" step="0.1" value="${ultimoProgreso?.masa_muscular || ''}" placeholder="Autocalculado" readonly class="input-field bg-slate-100 dark:bg-slate-800 cursor-not-allowed" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="notas">Notas y Observaciones</label>
              <textarea id="notas" rows="4" placeholder="Evolución del paciente, observaciones, recomendaciones..." class="textarea-field"></textarea>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Guardar Seguimiento
              </button>
              <button type="button" id="cancelarBtn" class="btn-secondary">Volver</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const pesoInput = document.getElementById('peso');
    const estaturaInput = document.getElementById('estatura');
    const grasaInput = document.getElementById('porcentajeGrasa');
    const imcInput = document.getElementById('imc');
    const masaMuscularInput = document.getElementById('masaMuscular');
    
    if (pesoInput && estaturaInput && imcInput) {
      const calculateIMC = () => {
        const peso = parseFloat(pesoInput.value);
        const estatura = parseFloat(estaturaInput.value);
        
        if (peso > 0 && estatura > 0) {
          const estaturaM = estatura > 3 ? estatura / 100 : estatura;
          const imcVal = (peso / (estaturaM * estaturaM)).toFixed(1);
          imcInput.value = imcVal;
        } else {
          imcInput.value = '';
        }
      };
      const calculateMasaMuscular = () => {
        const peso = parseFloat(pesoInput.value);
        const grasa = parseFloat(grasaInput?.value);
        if (peso > 0 && grasa >= 0) {
          masaMuscularInput.value = (peso * (1 - (grasa / 100))).toFixed(1);
        } else {
          masaMuscularInput.value = '';
        }
      };
      
      pesoInput.addEventListener('input', () => { calculateIMC(); calculateMasaMuscular(); });
      pesoInput.addEventListener('change', () => { calculateIMC(); calculateMasaMuscular(); });
      estaturaInput.addEventListener('input', calculateIMC);
      estaturaInput.addEventListener('change', calculateIMC);
      if (grasaInput) {
        grasaInput.addEventListener('input', calculateMasaMuscular);
        grasaInput.addEventListener('change', calculateMasaMuscular);
      }
      
      // Calcular de inmediato si ya hay valores
      calculateIMC();
      calculateMasaMuscular();
    }
  }, 0);

  document.getElementById('formSeguimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const pesoVal = document.getElementById('peso').value;
    const estaturaVal = document.getElementById('estatura').value;

    const valido = validarFormulario([
      { campo: 'estatura', nombre: 'Estatura', valor: estaturaVal, validacion: (v) => {
        if (!v) return 'La estatura es obligatoria';
        const num = parseFloat(v);
        if (isNaN(num) || num <= 0) return 'La estatura debe ser un número positivo';
        return null;
      }},
      { campo: 'peso', nombre: 'Peso', valor: pesoVal, validacion: (v) => {
        if (!v) return 'El peso es obligatorio';
        const num = parseFloat(v);
        if (isNaN(num) || num <= 0) return 'El peso debe ser un número positivo';
        return null;
      }}
    ]);
    if (!valido) return;

    const peso = parseFloat(pesoVal);
    const estatura = parseFloat(estaturaVal);
    let imcCalculated = parseFloat(document.getElementById('imc').value) || null;
    
    if (!imcCalculated && peso > 0 && estatura > 0) {
      const estaturaM = estatura > 3 ? estatura / 100 : estatura;
      imcCalculated = parseFloat((peso / (estaturaM * estaturaM)).toFixed(1));
    }

    const estaturaOriginal = paciente?.estatura_cm || paciente?.estatura || paciente?.height;
    if (estatura > 0 && estatura !== estaturaOriginal) {
      const datosActualizados = {
        nombreCompleto: paciente.nombreCompleto || paciente.nombre || 'Paciente',
        email: paciente.email,
        telefono: paciente.telefono,
        fecha_nacimiento: paciente.fecha_nacimiento,
        antecedentes: paciente.antecedentes,
        estado: paciente.estado,
        sexo: paciente.sexo,
        estatura_cm: estatura
      };
      actualizarPaciente(paciente.id_paciente, datosActualizados).catch(e => console.error("Error al guardar estatura del paciente:", e));
    }

    const progreso = {
      id_paciente: citaEnEdicion.id_paciente,
      id_cita: citaEnEdicion.id_cita,
      peso_kg: peso,
      porcentaje_grasa: parseFloat(document.getElementById('porcentajeGrasa').value) || null,
      masa_muscular: parseFloat(document.getElementById('masaMuscular').value) || null,
      imc: imcCalculated,
      observaciones: document.getElementById('notas').value
    };
    try {
      await agregarProgreso(progreso);
      await completarCita(citaEnEdicion.id_cita);
      modo = 'lista';
      await renderizarVista();
    } catch (err) {
      alert('Error al guardar seguimiento: ' + err.message);
    }
  });

  document.getElementById('cancelarBtn').addEventListener('click', async () => {
    modo = 'lista';
    await renderizarVista();
  });
}

async function renderizarVista() {
  const contenedor = document.getElementById('contenidoCitas');
  if (!contenedor) return;

  if (modo === 'lista') await renderizarLista(contenedor);
  else if (modo === 'crear' || modo === 'editar') await renderizarFormulario(contenedor);
  else if (modo === 'seguimiento') await renderizarSeguimiento(contenedor);
}
