import { 
  getPacientes, 
  crearPaciente as agregarPaciente, 
  actualizarPaciente, 
  eliminarPaciente,
  getCitas,
  getProgresoPaciente,
  getCorreosPaciente,
  enviarCorreo as agregarCorreo
} from '../utils/api.js';
import { router } from '../utils/router.js';
import { formatDate, formatDateTime, getEstadoStyle, getEstadoLabel } from '../utils/formatters.js';
import { createLayout } from '../components/layout.js';

let modo = 'lista';
let pacienteEnEdicion = null;

export const PacientesPage = async () => {
  const content = `<div id="contenidoPacientes"></div>`;

  setTimeout(() => {
    renderizarVista();
  }, 0);

  return createLayout(content, '/pacientes');
};

async function renderizarVista() {
  const contenedor = document.getElementById('contenidoPacientes');
  if (!contenedor) return;
  if (modo === 'lista') await renderizarLista(contenedor);
  else if (modo === 'crear' || modo === 'editar') renderizarFormulario(contenedor);
  else if (modo === 'detalle') await renderizarDetalle(contenedor);
  else if (modo === 'enviar-correo') renderizarEnviarCorreo(contenedor);
}

async function renderizarLista(contenedor) {
  contenedor.innerHTML = '<div class="text-center py-16"><p class="text-slate-500 font-medium">Cargando pacientes...</p></div>';
  const pacientes = await getPacientes().catch(e => { console.error(e); return []; });
  contenedor.innerHTML = `
    <div class="animate-slide-in space-y-6">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1>Pacientes</h1>
          <p>Gestión de pacientes registrados en tu consulta</p>
        </div>
        <button id="crearPacienteBtn" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nuevo Paciente
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${pacientes.length === 0 ? `
          <div class="col-span-full text-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <p class="text-slate-500 font-medium">No hay pacientes registrados</p>
            <p class="text-slate-400 text-sm mt-1">Crea tu primer paciente para comenzar</p>
          </div>
        ` : pacientes.map(p => `
          <div class="patient-card">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                ${p.nombreCompleto.charAt(0).toUpperCase()}
              </div>
              <span class="badge-status ${getEstadoStyle(p.estado)} text-xs">${getEstadoLabel(p.estado)}</span>
            </div>
            <h3>${p.nombreCompleto}</h3>
            <div class="space-y-1.5 text-sm text-slate-500 mb-4">
              <div class="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>${p.email}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>${p.telefono}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${formatDate(p.fecha_nacimiento)}</span>
              </div>
            </div>
            <div class="flex gap-2 pt-3 border-t border-slate-100">
              <button class="action-btn action-btn-view flex-1 justify-center btn-ver" data-id="${p.id_paciente}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Ver
              </button>
              <button class="action-btn action-btn-edit btn-editar" data-id="${p.id_paciente}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn action-btn-delete btn-eliminar" data-id="${p.id_paciente}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('crearPacienteBtn').onclick = () => { modo = 'crear'; pacienteEnEdicion = null; renderizarVista(); };
  document.querySelectorAll('.btn-ver').forEach(b => b.onclick = async (e) => { 
    const id = parseInt(e.currentTarget.dataset.id);
    const pacientes = await getPacientes().catch(() => []);
    pacienteEnEdicion = pacientes.find(p => p.id_paciente === id); 
    modo = 'detalle'; 
    await renderizarVista(); 
  });
  document.querySelectorAll('.btn-editar').forEach(b => b.onclick = async (e) => { 
    const id = parseInt(e.currentTarget.dataset.id);
    const pacientes = await getPacientes().catch(() => []);
    pacienteEnEdicion = pacientes.find(p => p.id_paciente === id); 
    modo = 'editar'; 
    await renderizarVista(); 
  });
  document.querySelectorAll('.btn-eliminar').forEach(b => b.onclick = async (e) => { 
    const id = parseInt(e.currentTarget.dataset.id); 
    if (confirm('¿Eliminar este paciente?')) { 
      await eliminarPaciente(id); 
      await renderizarVista(); 
    } 
  });
}

function renderizarFormulario(contenedor) {
  const titulo = modo === 'crear' ? 'Nuevo Paciente' : 'Editar Paciente';
  const datosIniciales = pacienteEnEdicion || {};

  contenedor.innerHTML = `
    <div class="animate-slide-in max-w-2xl">
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${modo === 'crear' ? '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line><line x1="20" y1="8" x2="20" y2="14"></line>' : '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'}
            </svg>
            ${titulo}
          </h2>
        </div>
        <div class="detail-section-body">
          <form id="formPaciente" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="form-group">
                <label class="form-label" for="nombreCompleto">Nombre Completo *</label>
                <input type="text" id="nombreCompleto" value="${datosIniciales.nombreCompleto || ''}" required class="input-field" placeholder="Nombre del paciente" />
              </div>
              <div class="form-group">
                <label class="form-label" for="email">Correo Electrónico *</label>
                <input type="email" id="email" value="${datosIniciales.email || ''}" required class="input-field" placeholder="paciente@email.com" />
              </div>
              <div class="form-group">
                <label class="form-label" for="telefono">Teléfono *</label>
                <input type="tel" id="telefono" value="${datosIniciales.telefono || ''}" required class="input-field" placeholder="Ej: 5512345678" maxlength="10" minlength="10" pattern="[0-9]{10}" title="El teléfono debe tener exactamente 10 dígitos" />
              </div>
              <div class="form-group">
                <label class="form-label" for="fechaNacimiento">Fecha de Nacimiento *</label>
                <input type="date" id="fechaNacimiento" value="${datosIniciales.fecha_nacimiento ? datosIniciales.fecha_nacimiento.split('T')[0] : ''}" required class="input-field" />
              </div>
              <div class="form-group">
                <label class="form-label" for="estaturaCm">Estatura (cm) *</label>
                <input type="number" id="estaturaCm" value="${datosIniciales.estatura_cm || ''}" required class="input-field" placeholder="Ej: 175" min="30" max="300" />
              </div>
              <div class="form-group">
                <label class="form-label" for="sexo">Sexo *</label>
                <select id="sexo" required class="input-field">
                  <option value="">Seleccionar...</option>
                  <option value="M" ${datosIniciales.sexo === 'M' ? 'selected' : ''}>Hombre</option>
                  <option value="F" ${datosIniciales.sexo === 'F' ? 'selected' : ''}>Mujer</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="antecedentes">Antecedentes Médicos *</label>
              <textarea id="antecedentes" rows="4" required class="textarea-field" placeholder="Antecedentes relevantes del paciente...">${datosIniciales.antecedentes || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="estado">Estado</label>
              <select id="estado" class="input-field">
                <option value="activo" ${datosIniciales.estado === 'activo' ? 'selected' : ''}>Activo</option>
                <option value="inactivo" ${datosIniciales.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                ${modo === 'crear' ? 'Crear Paciente' : 'Guardar Cambios'}
              </button>
              <button type="button" id="cancelarBtn" class="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const telInput = document.getElementById('telefono');
  if (telInput) {
    telInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }

  document.getElementById('formPaciente').onsubmit = async (e) => {
    e.preventDefault();
    const phone = document.getElementById('telefono').value.trim();
    if (phone.length !== 10) {
      alert('El teléfono debe tener exactamente 10 dígitos.');
      return;
    }
    const datos = {
      nombreCompleto: document.getElementById('nombreCompleto').value,
      email: document.getElementById('email').value,
      telefono: phone,
      fecha_nacimiento: document.getElementById('fechaNacimiento').value,
      antecedentes: document.getElementById('antecedentes').value,
      estado: document.getElementById('estado').value,
      estatura_cm: parseFloat(document.getElementById('estaturaCm').value),
      sexo: document.getElementById('sexo').value
    };
    try {
      if (modo === 'crear') await agregarPaciente(datos);
      else await actualizarPaciente(pacienteEnEdicion.id_paciente, datos);
      modo = 'lista';
      await renderizarVista();
    } catch (err) {
      alert('Error al guardar paciente: ' + err.message);
    }
  };
  document.getElementById('cancelarBtn').onclick = () => { modo = 'lista'; renderizarVista(); };
}

async function renderizarDetalle(contenedor) {
  const paciente = pacienteEnEdicion;
  const [citas, progreso, correos] = await Promise.all([
    getCitas().then(list => list.filter(c => c.id_paciente === paciente.id_paciente)).catch(() => []),
    getProgresoPaciente(paciente.id_paciente).catch(() => []),
    getCorreosPaciente(paciente.id_paciente).catch(() => [])
  ]);

  contenedor.innerHTML = `
    <div class="animate-slide-in space-y-6">
      <!-- Back Button -->
      <button id="volverBtn" class="btn-ghost">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver a lista
      </button>

      <!-- Patient Data -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h2 class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              ${paciente.nombreCompleto.charAt(0).toUpperCase()}
            </div>
            <div>
              <span>${paciente.nombreCompleto}</span>
              <span class="block text-sm font-normal text-slate-500">Datos del paciente</span>
            </div>
          </h2>
          <button id="editarBtn" class="btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar
          </button>
        </div>
        <div class="detail-section-body">
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre Completo</label>
              <p>${paciente.nombreCompleto}</p>
            </div>
            <div class="info-item">
              <label>Correo Electrónico</label>
              <p>${paciente.email}</p>
            </div>
            <div class="info-item">
              <label>Teléfono</label>
              <p>${paciente.telefono}</p>
            </div>
            <div class="info-item">
              <label>Fecha de Nacimiento</label>
              <p>${formatDate(paciente.fecha_nacimiento)}</p>
            </div>
            <div class="info-item">
              <label>Estatura</label>
              <p>${paciente.estatura_cm ? `${paciente.estatura_cm} cm` : 'No especificada'}</p>
            </div>
            <div class="info-item">
              <label>Sexo</label>
              <p>${paciente.sexo === 'M' ? 'Hombre' : paciente.sexo === 'F' ? 'Mujer' : 'No especificado'}</p>
            </div>
            <div class="info-item">
              <label>Estado</label>
              <p><span class="badge-status ${getEstadoStyle(paciente.estado)}">${getEstadoLabel(paciente.estado)}</span></p>
            </div>
            <div class="info-item">
              <label>Fecha de Registro</label>
              <p>${formatDate(paciente.fecha_registro)}</p>
            </div>
          </div>
          ${paciente.antecedentes ? `
            <div class="mt-4 pt-4 border-t border-slate-100">
              <div class="info-item">
                <label>Antecedentes Médicos</label>
                <p class="text-sm font-normal text-slate-700 mt-1">${paciente.antecedentes}</p>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Appointments -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Citas (${citas.length})
          </h2>
        </div>
        <div class="detail-section-body space-y-6">
          ${citas.length === 0 ? '<p class="text-slate-500 text-sm py-4 text-center">Sin citas registradas</p>' : (() => {
            const proximasCitas = citas.filter(c => (c.estado || 'pendiente').toLowerCase() === 'pendiente');
            const completadasCitas = citas.filter(c => (c.estado || 'pendiente').toLowerCase() === 'completada');
            const canceladasCitas = citas.filter(c => (c.estado || 'pendiente').toLowerCase() === 'cancelada');

            const renderCitaRow = (c) => `
              <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-3">
                  <div class="w-2.5 h-2.5 rounded-full ${(c.estado || 'pendiente').toLowerCase() === 'pendiente' ? 'bg-yellow-400' : (c.estado || 'pendiente').toLowerCase() === 'completada' ? 'bg-green-400' : 'bg-red-400'}"></div>
                  <div>
                    <p class="font-semibold text-slate-900 dark:text-white text-sm">${formatDateTime(c.fecha_hora)}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${c.motivo}</p>
                  </div>
                </div>
                <span class="badge-status ${getEstadoStyle(c.estado)} text-xs">${getEstadoLabel(c.estado)}</span>
              </div>
            `;

            return `
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Próximas -->
                <div class="space-y-3">
                  <h3 class="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    Próximas (${proximasCitas.length})
                  </h3>
                  <div class="space-y-2 max-h-[300px] overflow-y-auto">
                    ${proximasCitas.length === 0 ? '<p class="text-xs text-slate-400 py-3 text-center">No hay próximas citas</p>' : proximasCitas.map(renderCitaRow).join('')}
                  </div>
                </div>

                <!-- Completadas -->
                <div class="space-y-3">
                  <h3 class="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                    Terminadas (${completadasCitas.length})
                  </h3>
                  <div class="space-y-2 max-h-[300px] overflow-y-auto">
                    ${completadasCitas.length === 0 ? '<p class="text-xs text-slate-400 py-3 text-center">No hay citas completadas</p>' : completadasCitas.map(renderCitaRow).join('')}
                  </div>
                </div>

                <!-- Canceladas -->
                <div class="space-y-3">
                  <h3 class="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    Canceladas (${canceladasCitas.length})
                  </h3>
                  <div class="space-y-2 max-h-[300px] overflow-y-auto">
                    ${canceladasCitas.length === 0 ? '<p class="text-xs text-slate-400 py-3 text-center">No hay citas canceladas</p>' : canceladasCitas.map(renderCitaRow).join('')}
                  </div>
                </div>
              </div>
            `;
          })()}
        </div>
      </div>

      <!-- Progress -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            Progreso Médico (${progreso.length})
          </h2>
        </div>
        <div class="detail-section-body">
          ${progreso.length === 0 ? '<p class="text-slate-500 text-sm py-4 text-center">Sin seguimiento registrado</p>' : `
            <div class="space-y-3">
              ${progreso.map(p => `
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="flex items-center gap-2 mb-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span class="text-sm font-semibold text-slate-700">${formatDate(p.fecha_revision)}</span>
                  </div>
                  <div class="grid grid-cols-3 gap-4">
                    <div class="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Peso</p>
                      <p class="text-lg font-bold text-slate-900 dark:text-white">${p.peso_kg || p.peso || p.weight || '—'} <span class="text-xs font-normal text-slate-500">kg</span></p>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Grasa</p>
                      <p class="text-lg font-bold text-slate-900 dark:text-white">${p.porcentaje_grasa || p.grasa || '—'} <span class="text-xs font-normal text-slate-500">%</span></p>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">IMC</p>
                      <p class="text-lg font-bold text-slate-900 dark:text-white">
                        ${(() => {
                          const rawImc = p.imc || p.bmi;
                          if (rawImc && rawImc > 0) return rawImc;
                          
                          const estatura = paciente?.estatura_cm || paciente?.estatura || paciente?.height;
                          const peso = p.peso_kg || p.peso || p.weight;
                          
                          if (peso > 0 && estatura > 0) {
                            const estaturaM = estatura > 3 ? estatura / 100 : estatura;
                            return (peso / (estaturaM * estaturaM)).toFixed(1);
                          }
                          return '—';
                        })()}
                      </p>
                    </div>
                  </div>
                  ${(p.observaciones || p.notas) ? `<p class="text-sm text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">${p.observaciones || p.notas}</p>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Emails -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Correos (${correos.length})
          </h2>
          <button id="enviarBtn" class="btn-primary !bg-gradient-to-r !from-purple-600 !to-purple-700 !shadow-purple-500/20 text-sm !py-2 !px-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Enviar
          </button>
        </div>
        <div class="detail-section-body">
          ${correos.length === 0 ? '<p class="text-slate-500 text-sm py-4 text-center">Sin correos enviados</p>' : `
            <div class="space-y-3">
              ${correos.map(c => `
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="flex items-center justify-between mb-2">
                    <p class="font-semibold text-slate-900 text-sm">${c.asunto}</p>
                    <span class="text-xs text-slate-400">${formatDateTime(c.fecha_envio)}</span>
                  </div>
                  <p class="text-sm text-slate-600">${c.contenido}</p>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  document.getElementById('volverBtn').onclick = async () => { modo = 'lista'; await renderizarVista(); };
  document.getElementById('editarBtn').onclick = async () => { modo = 'editar'; await renderizarVista(); };
  document.getElementById('enviarBtn').onclick = async () => { modo = 'enviar-correo'; await renderizarVista(); };
}

function renderizarEnviarCorreo(contenedor) {
  const paciente = pacienteEnEdicion;
  contenedor.innerHTML = `
    <div class="animate-slide-in max-w-2xl">
      <div class="detail-section">
        <div class="detail-section-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Enviar Correo
          </h2>
        </div>
        <div class="detail-section-body">
          <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 mb-6">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              ${paciente.nombreCompleto.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-semibold text-slate-900 text-sm">${paciente.nombreCompleto}</p>
              <p class="text-xs text-slate-500">${paciente.email}</p>
            </div>
          </div>
          <form id="formCorreo" class="space-y-5">
            <div class="form-group">
              <label class="form-label" for="asunto">Asunto *</label>
              <input type="text" id="asunto" required placeholder="Ej: Recordatorio de cita, seguimiento de dieta..." class="input-field" />
            </div>
            <div class="form-group">
              <label class="form-label" for="contenido">Mensaje *</label>
              <textarea id="contenido" rows="6" required placeholder="Escribe tu mensaje aquí..." class="textarea-field"></textarea>
            </div>
            <div class="flex gap-3">
              <button type="submit" class="btn-success !bg-gradient-to-r !from-purple-600 !to-purple-700 !shadow-purple-500/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Enviar Correo
              </button>
              <button type="button" id="cancelarBtn" class="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('formCorreo').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await agregarCorreo({
        id_paciente: paciente.id_paciente,
        asunto: document.getElementById('asunto').value,
        contenido: document.getElementById('contenido').value
      });
      modo = 'detalle';
      await renderizarVista();
    } catch (err) {
      alert('Error al enviar correo: ' + err.message);
    }
  };
  document.getElementById('cancelarBtn').onclick = async () => { modo = 'detalle'; await renderizarVista(); };
}
