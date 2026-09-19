import { axiosClient } from './axiosClient';
import type { User, UserRole } from '../types';

export const MOCK_USUARIOS: User[] = [
  { id: 'usr-1', nombre: 'Diego Ovalle', email: 'diego.ovalle@finca.gt', rol: 'CLIENTE', empresa: 'Finca Los Pinos', fechaRegistro: '2026-08-01', estado: 'ACTIVO' },
  { id: 'usr-2', nombre: 'Luis Ixquiac', email: 'luis.ixquiac@coop.gt', rol: 'CLIENTE', empresa: 'Cooperativa Occidente', fechaRegistro: '2026-08-05', estado: 'ACTIVO' },
  { id: 'usr-3', nombre: 'Javier Ramírez', email: 'javier.ramirez@agro.gt', rol: 'SOPORTE', empresa: 'AgroCloud Support', fechaRegistro: '2026-07-15', estado: 'ACTIVO' },
  { id: 'usr-4', nombre: 'Diego Afre (Admin)', email: 'admin@agrocloud.gt', rol: 'ADMIN', empresa: 'AgroCloud Platform', fechaRegistro: '2026-07-01', estado: 'ACTIVO' },
  { id: 'usr-5', nombre: 'Hacienda Santa Cruz', email: 'contacto@santacruz.gt', rol: 'CLIENTE', empresa: 'Hacienda Santa Cruz', fechaRegistro: '2026-08-20', estado: 'ACTIVO' },
];

export const getUsuarios = async (): Promise<User[]> => {
  try {
    const res = await axiosClient.get('/usuarios');
    return res.data?.data || res.data;
  } catch {
    console.warn('API /usuarios no disponible. Retornando usuarios Mock.');
    return MOCK_USUARIOS;
  }
};

export const crearUsuario = async (data: { nombre: string; email: string; rol: UserRole; empresa?: string }): Promise<User> => {
  try {
    const res = await axiosClient.post('/usuarios', data);
    return res.data?.data || res.data;
  } catch {
    console.warn('API /usuarios no disponible. Registrando usuario en estado Mock.');
    const nuevo: User = {
      id: 'usr-' + Date.now(),
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      empresa: data.empresa || 'Empresa Agrícola',
      fechaRegistro: new Date().toISOString().split('T')[0],
      estado: 'ACTIVO',
    };
    return nuevo;
  }
};
