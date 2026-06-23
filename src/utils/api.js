// Variable para alternar entre Localhost y el Host de Producción de la API
const USAR_LOCALHOST = true;

const URL_LOCALHOST = 'http://192.168.1.245:3000';
const URL_PRODUCCION = 'http://10.3.0.142:3000'; // Reemplazar con el host de producción real de la API

export const API_BASE_URL = USAR_LOCALHOST ? URL_LOCALHOST : URL_PRODUCCION;

// Helper para obtener las cabeceras con el Token si existe
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper genérico para peticiones HTTP
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
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
      estado: 'completada'
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
      estado: 'cancelada'
    })
  });
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
