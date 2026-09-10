export interface DentistScheduleSlot {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface Dentist {
  id: string;
  fullName: string;
  licenseNumber: string;
  specialties: string[];
  colorHex: string;
  bio: string;
  workSchedule: DentistScheduleSlot[];
  isActive: boolean;
  createdAt: string;
}

export interface DentistFormData {
  fullName: string;
  licenseNumber: string;
  specialtiesText: string;
  colorHex: string;
  bio: string;
  workSchedule: DentistScheduleSlot[];
  isActive: boolean;
}

export const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miercoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sabado'
};

export const WORK_WEEK_DAYS = [1, 2, 3, 4, 5];
