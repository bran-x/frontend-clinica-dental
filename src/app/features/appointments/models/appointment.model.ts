export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  reason: string;
  startsAt: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AppointmentFormData {
  patient_id: string;
  dentist_id: string;
  starts_at: string;
  duration_minutes: number;
  reason: string;
}

export interface AppointmentPatientOption {
  id: string;
  name: string;
}

export interface AppointmentDentistOption {
  id: string;
  name: string;
}
