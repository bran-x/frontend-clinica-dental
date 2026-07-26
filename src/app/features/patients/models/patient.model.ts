export interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  phone: string;
  email: string;
  observations: string;
  registeredAt: string;
}

export type PatientFormData = Omit<Patient, 'id' | 'registeredAt'>;
