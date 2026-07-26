import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PatientController } from '../../controllers/patient.controller';
import { Patient, PatientFormData } from '../../models/patient.model';

@Component({
  selector: 'app-patient-list-view',
  imports: [FormsModule],
  templateUrl: './patient-list.view.html',
  styleUrl: './patient-list.view.scss'
})
export class PatientListView implements OnInit {
  private readonly patientController = inject(PatientController);

  readonly patients = this.patientController.list;
  readonly isLoading = this.patientController.isLoading;
  readonly errorMessage = this.patientController.errorMessage;
  readonly query = signal('');
  readonly modalMode = signal<'create' | 'edit' | 'detail' | 'delete' | null>(null);
  readonly selectedPatient = signal<Patient | null>(null);

  formData: PatientFormData = this.createEmptyForm();

  readonly filteredPatients = computed(() => {
    const normalizedQuery = this.query().trim().toLowerCase();

    return this.patients().filter((patient) => {
      const fullName = this.getFullName(patient).toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        fullName.includes(normalizedQuery) ||
        patient.dni.includes(normalizedQuery) ||
        patient.email.toLowerCase().includes(normalizedQuery);

      return matchesQuery;
    });
  });

  ngOnInit(): void {
    this.patientController.load();
  }

  openCreate(): void {
    this.formData = this.createEmptyForm();
    this.selectedPatient.set(null);
    this.modalMode.set('create');
  }

  openDetail(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.modalMode.set('detail');
  }

  openEdit(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.formData = this.toFormData(patient);
    this.modalMode.set('edit');
  }

  openDelete(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.modalMode.set('delete');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedPatient.set(null);
  }

  savePatient(): void {
    const selectedPatient = this.selectedPatient();

    if (this.modalMode() === 'edit' && selectedPatient) {
      this.patientController.update(selectedPatient.id, this.formData).subscribe(() => this.closeModal());
      return;
    }

    this.patientController.create(this.formData).subscribe(() => this.closeModal());
  }

  deletePatient(): void {
    const patient = this.selectedPatient();

    if (!patient) {
      return;
    }

    this.patientController.remove(patient.id).subscribe(() => this.closeModal());
  }

  getFullName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  formatShortId(id: string): string {
    return id.slice(-4).toUpperCase();
  }

  getInitials(patient: Patient): string {
    return `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  getAge(value: string | null): number | null {
    if (!value) {
      return null;
    }

    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age;
  }

  private createEmptyForm(): PatientFormData {
    return {
      dni: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      phone: '',
      email: '',
      observations: ''
    };
  }

  private toFormData(patient: Patient): PatientFormData {
    return {
      dni: patient.dni,
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate,
      phone: patient.phone,
      email: patient.email,
      observations: patient.observations
    };
  }
}
