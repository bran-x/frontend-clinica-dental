export interface Treatment {
  id: string;
  category: string;
  code: string;
  name: string;
  description: string;
  defaultPrice: number;
  defaultDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
}

export type TreatmentFormData = Omit<Treatment, 'id' | 'createdAt'>;
