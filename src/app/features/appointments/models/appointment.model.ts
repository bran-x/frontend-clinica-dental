export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
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
  dentist_name: string;
  starts_at: string;
  duration_minutes: number;
  reason: string;
}

export interface AppointmentPatientOption {
  id: string;
  name: string;
}
