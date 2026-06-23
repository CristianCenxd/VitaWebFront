// Utilidades de formato

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

export const getEstadoStyle = (estado) => {
  const estilos = {
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'completada': 'bg-green-100 text-green-800',
    'cancelada': 'bg-red-100 text-red-800',
    'activo': 'bg-blue-100 text-blue-800',
    'inactivo': 'bg-gray-100 text-gray-800'
  };
  return estilos[estado] || 'bg-gray-100 text-gray-800';
};

export const getEstadoLabel = (estado) => {
  const labels = {
    'pendiente': 'Pendiente',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
    'activo': 'Activo',
    'inactivo': 'Inactivo'
  };
  return labels[estado] || estado;
};
