export interface LoginCredentials {
  username: string;
  password: string;
  remember: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'dentist' | 'staff';
}
