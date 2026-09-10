export interface OdontogramEntry {
  toothFdi: string;
  surface: string;
  condition: string;
  notes: string;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  appointmentId: string | null;
  chiefComplaint: string;
  diagnosis: string;
  notes: string;
  odontogramEntries: OdontogramEntry[];
  createdAt: string;
}

export interface ClinicalRecordFormData {
  patient_id: string;
  dentist_id: string;
  appointment_id: string;
  chief_complaint: string;
  diagnosis: string;
  notes: string;
  odontogram_entries: OdontogramEntry[];
}

export interface ClinicalRecordPatientOption {
  id: string;
  name: string;
}

export interface ClinicalRecordDentistOption {
  id: string;
  name: string;
}
