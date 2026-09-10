import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DentistController } from '../../controllers/dentist.controller';
import {
  Dentist,
  DentistFormData,
  DentistScheduleSlot,
  WEEKDAY_LABELS,
  WORK_WEEK_DAYS
} from '../../models/dentist.model';

@Component({
  selector: 'app-dentist-list-view',
  imports: [FormsModule],
  templateUrl: './dentist-list.view.html',
  styleUrl: './dentist-list.view.scss'
})
export class DentistListView implements OnInit {
  private readonly dentistController = inject(DentistController);

  readonly dentists = this.dentistController.list;
  readonly isLoading = this.dentistController.isLoading;
  readonly errorMessage = this.dentistController.errorMessage;
  readonly query = signal('');
  readonly modalMode = signal<'create' | 'edit' | 'delete' | null>(null);
  readonly selectedDentist = signal<Dentist | null>(null);
  readonly weekdayLabels = WEEKDAY_LABELS;

  formData: DentistFormData = this.createEmptyForm();

  readonly filteredDentists = computed(() => {
    const normalizedQuery = this.query().trim().toLowerCase();

    return this.dentists().filter((dentist) => {
      const matchesQuery =
        !normalizedQuery ||
        dentist.fullName.toLowerCase().includes(normalizedQuery) ||
        dentist.licenseNumber.toLowerCase().includes(normalizedQuery) ||
        dentist.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedQuery));

      return matchesQuery;
    });
  });

  ngOnInit(): void {
    this.dentistController.load();
  }

  openCreate(): void {
    this.formData = this.createEmptyForm();
    this.selectedDentist.set(null);
    this.modalMode.set('create');
  }

  openEdit(dentist: Dentist): void {
    this.selectedDentist.set(dentist);
    this.formData = this.toFormData(dentist);
    this.modalMode.set('edit');
  }

  openDelete(dentist: Dentist): void {
    this.selectedDentist.set(dentist);
    this.modalMode.set('delete');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedDentist.set(null);
  }

  saveDentist(): void {
    const selectedDentist = this.selectedDentist();

    if (this.modalMode() === 'edit' && selectedDentist) {
      this.dentistController.update(selectedDentist.id, this.formData).subscribe(() => this.closeModal());
      return;
    }

    this.dentistController.create(this.formData).subscribe(() => this.closeModal());
  }

  deleteDentist(): void {
    const dentist = this.selectedDentist();

    if (!dentist) {
      return;
    }

    this.dentistController.remove(dentist.id).subscribe({
      next: () => this.closeModal(),
      error: (error) => {
        this.errorMessage.set(
          error?.status === 409
            ? 'No se puede eliminar: el odontologo tiene citas activas.'
            : 'No se pudo eliminar el odontologo.'
        );
      }
    });
  }

  formatShortId(id: string): string {
    return id.slice(-4).toUpperCase();
  }

  getInitials(dentist: Dentist): string {
    const parts = dentist.fullName.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  private scheduleFor(weekday: number, schedule: DentistScheduleSlot[]): DentistScheduleSlot {
    return (
      schedule.find((slot) => slot.weekday === weekday) ?? {
        weekday,
        startTime: '',
        endTime: ''
      }
    );
  }

  private createEmptyForm(): DentistFormData {
    return {
      fullName: '',
      licenseNumber: '',
      specialtiesText: '',
      colorHex: '#006c9a',
      bio: '',
      workSchedule: WORK_WEEK_DAYS.map((weekday) => ({ weekday, startTime: '', endTime: '' })),
      isActive: true
    };
  }

  private toFormData(dentist: Dentist): DentistFormData {
    return {
      fullName: dentist.fullName,
      licenseNumber: dentist.licenseNumber,
      specialtiesText: dentist.specialties.join(', '),
      colorHex: dentist.colorHex || '#006c9a',
      bio: dentist.bio,
      workSchedule: WORK_WEEK_DAYS.map((weekday) => this.scheduleFor(weekday, dentist.workSchedule)),
      isActive: dentist.isActive
    };
  }
}
