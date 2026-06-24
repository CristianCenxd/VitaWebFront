// Variable para alternar entre Localhost y el Host de Producción de la API
const USAR_LOCALHOST = false;

const URL_LOCALHOST = 'http://192.168.1.245:3000';
const URL_PRODUCCION = 'https://vitaweb.onrender.com'; // Reemplazar con el host de producción real de la API

export const API_BASE_URL = USAR_LOCALHOST ? URL_LOCALHOST : URL_PRODUCCION;

// Helper para obtener las cabeceras con el Token si existe
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper genérico para peticiones HTTP
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getHeaders(),
    ...options.headers
  };
  // Only set Content-Type for requests that have a body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error en la petición: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// === API ENDPOINTS ===

// --- Autenticación ---
export const loginNutriologo = async (email, contrasena) => {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, contrasena })
  });

  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.nutriologo) {
    localStorage.setItem('nutriologo_actual', JSON.stringify(data.nutriologo));
  }
  return data;
};

export const registrarNutriologo = async (datos) => {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
};

export const solicitarRecuperacion = async (email) => {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const restablecerContrasena = async (token, nuevaContrasena) => {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, nuevaContrasena })
  });
};

// --- Pacientes ---
export const getPacientes = async () => {
  const res = await apiFetch('/api/pacientes');
  return res && res.data ? res.data : (Array.isArray(res) ? res : []);
};

export const getPaciente = async (id) => {
  return apiFetch(`/api/pacientes/${id}`);
};

export const crearPaciente = async (datos) => {
  return apiFetch('/api/pacientes', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
};

export const actualizarPaciente = async (id, datos) => {
  return apiFetch(`/api/pacientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
};

export const eliminarPaciente = async (id) => {
  return apiFetch(`/api/pacientes/${id}`, {
    method: 'DELETE'
  });
};

// --- Citas ---
export const getCitas = async () => {
  const res = await apiFetch('/api/citas/agenda');
  return res && res.data ? res.data : (Array.isArray(res) ? res : []);
};

export const getCita = async (id) => {
  return apiFetch(`/api/citas/${id}`);
};

export const crearCita = async (datos) => {
  return apiFetch('/api/citas', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
};

export const actualizarCita = async (id, datos) => {
  return apiFetch(`/api/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
};

export const completarCita = async (id) => {
  const cita = await getCita(id);
  const data = cita && cita.data ? cita.data : cita;
  return apiFetch(`/api/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      id_paciente: data.id_paciente,
      fecha_hora: data.fecha_hora,
      motivo: data.motivo,
      estado: 'Completada'
    })
  });
};

export const cancelarCita = async (id) => {
  const cita = await getCita(id);
  const data = cita && cita.data ? cita.data : cita;
  return apiFetch(`/api/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      id_paciente: data.id_paciente,
      fecha_hora: data.fecha_hora,
      motivo: data.motivo,
      estado: 'Cancelada'
    })
  });
};

export const eliminarCita = async (id) => {
  return apiFetch(`/api/citas/${id}`, {
    method: 'DELETE'
  });
};

// --- Google Calendar ---
export const getGoogleAuthUrl = async () => {
  return apiFetch('/api/google/auth');
};

export const getGoogleStatus = async () => {
  return apiFetch('/api/google/status');
};

// --- Correos ---
export const getCorreosPaciente = async (idPaciente) => {
  return apiFetch(`/api/correos/${idPaciente}`);
};

export const enviarCorreo = async (datos) => {
  return apiFetch('/api/correos/enviar', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
};

export const actualizarCorreo = async (id, datos) => {
  return apiFetch(`/api/correos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
};

// --- Registro / Progreso Médico ---
export const getProgresoPaciente = async (idPaciente) => {
  return apiFetch(`/api/registros/${idPaciente}`);
};

export const agregarProgreso = async (datos) => {
  return apiFetch('/api/registros', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
};

export const getRegistro = async (id) => {
  return apiFetch(`/api/registros/registro/${id}`);
};

export const actualizarRegistro = async (id, datos) => {
  return apiFetch(`/api/registros/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
};
