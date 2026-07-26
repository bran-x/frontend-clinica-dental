export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreateDto {
  username: string;
  password: string;
  full_name?: string | null;
  role?: 'admin' | 'dentist' | 'staff';
}

export interface UserOutDto {
  id: string;
  username: string;
  full_name?: string | null;
  role: 'admin' | 'dentist' | 'staff';
  created_at?: string;
}

export interface PatientCreateDto {
  first_name: string;
  last_name: string;
  document_id: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  notes?: string | null;
}

export type PatientUpdateDto = Partial<PatientCreateDto>;

export interface PatientOutDto extends PatientCreateDto {
  id: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatusDto = 'scheduled' | 'completed' | 'cancelled';

export interface AppointmentCreateDto {
  patient_id: string;
  dentist_name: string;
  starts_at: string;
  duration_minutes?: number;
  reason: string;
}

export interface AppointmentUpdateDto {
  dentist_name?: string | null;
  starts_at?: string | null;
  duration_minutes?: number | null;
  reason?: string | null;
  status?: AppointmentStatusDto | null;
}

export interface AppointmentOutDto {
  id: string;
  patient_id: string;
  dentist_name: string;
  starts_at: string;
  duration_minutes: number;
  reason: string;
  status: AppointmentStatusDto;
  created_at: string;
  updated_at: string;
}

export interface AppointmentStatusUpdateDto {
  status: AppointmentStatusDto;
}
