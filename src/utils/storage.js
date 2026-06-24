// Gestión de almacenamiento local con localStorage

const KEYS = {
  NUTRIOLOGO: 'nutriologo_actual',
  PACIENTES: 'pacientes_lista',
  CITAS: 'citas_lista',
  PROGRESO: 'progreso_medico',
  CORREOS: 'historial_correos'
};

// Nutriólogo actual
export const getNutriologo = () => {
  return JSON.parse(localStorage.getItem(KEYS.NUTRIOLOGO)) || null;
};

export const setNutriologo = (nutriologo) => {
  localStorage.setItem(KEYS.NUTRIOLOGO, JSON.stringify(nutriologo));
};

export const logout = () => {
  localStorage.removeItem(KEYS.NUTRIOLOGO);
};

// Pacientes
export const getPacientes = () => {
  return JSON.parse(localStorage.getItem(KEYS.PACIENTES)) || [];
};

export const agregarPaciente = (paciente) => {
  const pacientes = getPacientes();
  const nuevoPaciente = {
    id_paciente: Date.now(),
    ...paciente,
    fecha_registro: new Date().toISOString(),
    estado: 'activo'
  };
  pacientes.push(nuevoPaciente);
  localStorage.setItem(KEYS.PACIENTES, JSON.stringify(pacientes));
  return nuevoPaciente;
};

export const actualizarPaciente = (id, datos) => {
  let pacientes = getPacientes();
  pacientes = pacientes.map(p => p.id_paciente === id ? { ...p, ...datos } : p);
  localStorage.setItem(KEYS.PACIENTES, JSON.stringify(pacientes));
};

export const eliminarPaciente = (id) => {
  let pacientes = getPacientes();
  pacientes = pacientes.filter(p => p.id_paciente !== id);
  localStorage.setItem(KEYS.PACIENTES, JSON.stringify(pacientes));
};

export const getPaciente = (id) => {
  return getPacientes().find(p => p.id_paciente === id);
};

// Citas
export const getCitas = () => {
  return JSON.parse(localStorage.getItem(KEYS.CITAS)) || [];
};

export const agregarCita = (cita) => {
  const citas = getCitas();
  const nuevaCita = {
    id_cita: Date.now(),
    ...cita,
    estado: 'pendiente',
    fecha_creacion: new Date().toISOString()
  };
  citas.push(nuevaCita);
  localStorage.setItem(KEYS.CITAS, JSON.stringify(citas));
  return nuevaCita;
};

export const actualizarCita = (id, datos) => {
  let citas = getCitas();
  citas = citas.map(c => c.id_cita === id ? { ...c, ...datos } : c);
  localStorage.setItem(KEYS.CITAS, JSON.stringify(citas));
};

export const cancelarCita = (id) => {
  actualizarCita(id, { estado: 'cancelada' });
};

export const completarCita = (id) => {
  actualizarCita(id, { estado: 'completada' });
};

export const getCita = (id) => {
  return getCitas().find(c => c.id_cita === id);
};

export const getCitasPaciente = (idPaciente) => {
  return getCitas().filter(c => c.id_paciente === idPaciente);
};

// Progreso Médico
export const getProgreso = () => {
  return JSON.parse(localStorage.getItem(KEYS.PROGRESO)) || [];
};

export const agregarProgreso = (progreso) => {
  const progresos = getProgreso();
  const nuevoProgreso = {
    id_progreso: Date.now(),
    ...progreso,
    fecha_revision: new Date().toISOString()
  };
  progresos.push(nuevoProgreso);
  localStorage.setItem(KEYS.PROGRESO, JSON.stringify(progresos));
  return nuevoProgreso;
};

export const getProgresoPaciente = (idPaciente) => {
  return getProgreso().filter(p => p.id_paciente === idPaciente);
};

// Historial de Correos
export const getCorreos = () => {
  return JSON.parse(localStorage.getItem(KEYS.CORREOS)) || [];
};

export const agregarCorreo = (correo) => {
  const correos = getCorreos();
  const nuevoCorreo = {
    id_correo: Date.now(),
    ...correo,
    fecha_envio: new Date().toISOString()
  };
  correos.push(nuevoCorreo);
  localStorage.setItem(KEYS.CORREOS, JSON.stringify(correos));
  return nuevoCorreo;
};

export const getCorreosPaciente = (idPaciente) => {
  return getCorreos().filter(c => c.id_paciente === idPaciente);
};
