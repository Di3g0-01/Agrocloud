import axios from 'axios';

// Configuración del cliente HTTP para conectar con Spring Boot (/api/v1)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de Solicitud: Adjunta el JWT token desde localStorage en cada request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrocloud_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Manejo centralizado de errores (401, 403, 500)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Sesión expirada o token no válido (401). Redirigiendo a login...');
        // Opcional: localStorage.removeItem('agrocloud_token');
      } else if (error.response.status === 403) {
        console.error('Acceso denegado (403): No posee permisos para esta acción.');
      }
    }
    return Promise.reject(error);
  }
);
