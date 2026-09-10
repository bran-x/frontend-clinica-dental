export interface TreatmentPlanItem {
  treatmentId: string;
  treatmentName: string;
  toothFdi: string;
  quantity: number;
  unitPrice: number;
  status: 'pending' | 'done' | 'skipped';
}

export type TreatmentPlanStatus = 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface TreatmentPlan {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  title: string;
  items: TreatmentPlanItem[];
  status: TreatmentPlanStatus;
  totalEstimated: number;
  createdAt: string;
}

export interface TreatmentPlanFormItem {
  treatment_id: string;
  tooth_fdi: string;
  quantity: number;
  unit_price: number;
  status: 'pending' | 'done' | 'skipped';
}

export interface TreatmentPlanFormData {
  patient_id: string;
  dentist_id: string;
  title: string;
  status: TreatmentPlanStatus;
  items: TreatmentPlanFormItem[];
}

export interface TreatmentPlanPatientOption {
  id: string;
  name: string;
}

export interface TreatmentPlanDentistOption {
  id: string;
  name: string;
}

export interface TreatmentPlanTreatmentOption {
  id: string;
  name: string;
  defaultPrice: number;
}
