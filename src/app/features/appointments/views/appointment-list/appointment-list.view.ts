import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppointmentController } from '../../controllers/appointment.controller';
import { Appointment, AppointmentFormData } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-list-view',
  imports: [FormsModule],
  templateUrl: './appointment-list.view.html',
  styleUrl: './appointment-list.view.scss'
})
export class AppointmentListView implements OnInit {
  private readonly appointmentController = inject(AppointmentController);

  readonly appointments = this.appointmentController.list;
  readonly patientOptions = this.appointmentController.patientOptions;
  readonly isLoading = this.appointmentController.isLoading;
  readonly errorMessage = this.appointmentController.errorMessage;
  readonly query = signal('');
  readonly statusFilter = signal<'Todos' | Appointment['status']>('Todos');
  readonly dentistFilter = signal('Todos los odontologos');
  readonly modalMode = signal<'create' | 'edit' | 'detail' | 'reschedule' | 'cancel' | 'delete' | null>(
    null
  );
  readonly selectedAppointment = signal<Appointment | null>(null);

  readonly dentistOptions = [
    'Dr. Pérez',
    'Dra. Maria Salinas',
    'Dr. Luis Torres',
    'Dr. Carlos Mendoza',
    'Dra. Ana Quispe'
  ];
  formData: AppointmentFormData = this.createEmptyForm();
  rescheduleData = {
    starts_at: '',
    duration_minutes: 30
  };

  readonly dentists = computed(() => [
    'Todos los odontologos',
    ...new Set(this.appointments().map((appointment) => appointment.dentistName))
  ]);

  readonly filteredAppointments = computed(() => {
    const normalizedQuery = this.query().trim().toLowerCase();
    const status = this.statusFilter();
    const dentist = this.dentistFilter();

    return this.appointments().filter((appointment) => {
      const matchesQuery =
        !normalizedQuery ||
        appointment.patientName.toLowerCase().includes(normalizedQuery) ||
        appointment.dentistName.toLowerCase().includes(normalizedQuery) ||
        appointment.reason.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === 'Todos' || appointment.status === status;
      const matchesDentist = dentist === 'Todos los odontologos' || appointment.dentistName === dentist;

      return matchesQuery && matchesStatus && matchesDentist;
    });
  });

  ngOnInit(): void {
    this.appointmentController.load();
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  formatShortId(id: string): string {
    return id.slice(-4).toUpperCase();
  }

  openCreate(): void {
    this.formData = this.createEmptyForm();
    this.formData.patient_id = this.patientOptions()[0]?.id ?? '';
    this.selectedAppointment.set(null);
    this.modalMode.set('create');
  }

  openDetail(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.modalMode.set('detail');
  }

  openEdit(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.formData = this.toFormData(appointment);
    this.modalMode.set('edit');
  }

  openReschedule(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.rescheduleData = {
      starts_at: `${appointment.date}T${appointment.time}`,
      duration_minutes: appointment.durationMinutes
    };
    this.modalMode.set('reschedule');
  }

  openCancel(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.modalMode.set('cancel');
  }

  openDelete(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.modalMode.set('delete');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedAppointment.set(null);
  }

  saveAppointment(): void {
    const selectedAppointment = this.selectedAppointment();

    if (this.modalMode() === 'edit' && selectedAppointment) {
      this.appointmentController
        .update(selectedAppointment.id, this.formData)
        .subscribe(() => this.closeModal());
      return;
    }

    this.appointmentController.create(this.formData).subscribe(() => this.closeModal());
  }

  saveReschedule(): void {
    const selectedAppointment = this.selectedAppointment();

    if (!selectedAppointment) {
      return;
    }

    this.appointmentController
      .reschedule(
        selectedAppointment.id,
        this.rescheduleData.starts_at,
        this.rescheduleData.duration_minutes
      )
      .subscribe(() => this.closeModal());
  }

  cancelAppointment(): void {
    const selectedAppointment = this.selectedAppointment();

    if (!selectedAppointment) {
      return;
    }

    this.appointmentController
      .updateStatus(selectedAppointment.id, 'cancelled')
      .subscribe(() => this.closeModal());
  }

  deleteAppointment(): void {
    const selectedAppointment = this.selectedAppointment();

    if (!selectedAppointment) {
      return;
    }

    this.appointmentController.remove(selectedAppointment.id).subscribe(() => this.closeModal());
  }

  getStatusLabel(status: Appointment['status']): string {
    const labels: Record<Appointment['status'], string> = {
      scheduled: 'Programada',
      completed: 'Atendida',
      cancelled: 'Cancelada'
    };

    return labels[status];
  }

  private createEmptyForm(): AppointmentFormData {
    return {
      patient_id: '',
      dentist_name: this.dentistOptions[0],
      starts_at: '',
      duration_minutes: 30,
      reason: ''
    };
  }

  private toFormData(appointment: Appointment): AppointmentFormData {
    return {
      patient_id: appointment.patientId,
      dentist_name: appointment.dentistName,
      starts_at: `${appointment.date}T${appointment.time}`,
      duration_minutes: appointment.durationMinutes,
      reason: appointment.reason
    };
  }
}
