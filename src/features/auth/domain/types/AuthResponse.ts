import type { Usuario } from './Usuario';

export interface AuthResponse {
  success: true;
  msg: string;
  data: {
    user: Usuario;
    accessToken: string;
  };
}
