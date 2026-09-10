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
  dentist_id: string;
  starts_at: string;
  duration_minutes?: number;
  reason: string;
}

export interface AppointmentUpdateDto {
  dentist_id?: string | null;
  starts_at?: string | null;
  duration_minutes?: number | null;
  reason?: string | null;
  status?: AppointmentStatusDto | null;
}

export interface AppointmentOutDto {
  id: string;
  patient_id: string;
  dentist_id: string;
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

// ---------- Odontologos ----------

export interface DentistScheduleSlotDto {
  weekday: number; // 0=domingo .. 6=sabado
  start_time: string;
  end_time: string;
}

export interface DentistScheduleExceptionDto {
  date: string;
  is_available?: boolean;
  reason?: string | null;
}

export interface DentistCreateDto {
  full_name: string;
  license_number?: string | null;
  specialties?: string[];
  color_hex?: string | null;
  bio?: string | null;
  work_schedule?: DentistScheduleSlotDto[];
}

export interface DentistUpdateDto {
  full_name?: string;
  license_number?: string | null;
  specialties?: string[];
  color_hex?: string | null;
  bio?: string | null;
  work_schedule?: DentistScheduleSlotDto[];
  schedule_exceptions?: DentistScheduleExceptionDto[];
  is_active?: boolean;
}

export interface DentistOutDto {
  id: string;
  full_name: string;
  license_number?: string | null;
  specialties: string[];
  color_hex?: string | null;
  bio?: string | null;
  work_schedule: DentistScheduleSlotDto[];
  schedule_exceptions: DentistScheduleExceptionDto[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- Historia clinica / odontograma ----------

export interface OdontogramEntryDto {
  tooth_fdi: string;
  surface?: string | null;
  condition: string;
  notes?: string | null;
}

export interface ClinicalRecordCreateDto {
  patient_id: string;
  dentist_id: string;
  appointment_id?: string | null;
  chief_complaint?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  odontogram_entries?: OdontogramEntryDto[];
}

export interface ClinicalRecordUpdateDto {
  chief_complaint?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  odontogram_entries?: OdontogramEntryDto[];
}

export interface ClinicalRecordOutDto {
  id: string;
  patient_id: string;
  dentist_id: string;
  appointment_id?: string | null;
  chief_complaint?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  odontogram_entries: OdontogramEntryDto[];
  created_at: string;
}

// ---------- Catalogo de tratamientos ----------

export interface TreatmentCreateDto {
  category: string;
  code?: string | null;
  name: string;
  description?: string | null;
  default_price: number;
  default_duration_minutes?: number;
}

export interface TreatmentUpdateDto {
  category?: string;
  code?: string | null;
  name?: string;
  description?: string | null;
  default_price?: number;
  default_duration_minutes?: number;
  is_active?: boolean;
}

export interface TreatmentOutDto {
  id: string;
  category: string;
  code?: string | null;
  name: string;
  description?: string | null;
  default_price: number;
  default_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

// ---------- Planes de tratamiento ----------

export type TreatmentPlanStatusDto = 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type TreatmentPlanItemStatusDto = 'pending' | 'done' | 'skipped';

export interface TreatmentPlanItemDto {
  treatment_id: string;
  tooth_fdi?: string | null;
  quantity?: number;
  unit_price: number;
  status?: TreatmentPlanItemStatusDto;
}

export interface TreatmentPlanCreateDto {
  patient_id: string;
  dentist_id: string;
  title: string;
  items?: TreatmentPlanItemDto[];
}

export interface TreatmentPlanUpdateDto {
  title?: string;
  status?: TreatmentPlanStatusDto;
  items?: TreatmentPlanItemDto[];
}

export interface TreatmentPlanOutDto {
  id: string;
  patient_id: string;
  dentist_id: string;
  title: string;
  items: TreatmentPlanItemDto[];
  status: TreatmentPlanStatusDto;
  total_estimated: number;
  created_at: string;
}
