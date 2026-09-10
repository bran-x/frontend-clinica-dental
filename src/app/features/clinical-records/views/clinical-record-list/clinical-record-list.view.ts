import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ClinicalRecordController } from '../../controllers/clinical-record.controller';
import { ClinicalRecord, ClinicalRecordFormData } from '../../models/clinical-record.model';

const SURFACE_OPTIONS = ['mesial', 'distal', 'oclusal', 'vestibular', 'lingual'];

@Component({
  selector: 'app-clinical-record-list-view',
  imports: [FormsModule],
  templateUrl: './clinical-record-list.view.html',
  styleUrl: './clinical-record-list.view.scss'
})
export class ClinicalRecordListView implements OnInit {
  private readonly clinicalRecordController = inject(ClinicalRecordController);

  readonly clinicalRecords = this.clinicalRecordController.list;
  readonly patientOptions = this.clinicalRecordController.patientOptions;
  readonly dentistOptions = this.clinicalRecordController.dentistOptions;
  readonly isLoading = this.clinicalRecordController.isLoading;
  readonly errorMessage = this.clinicalRecordController.errorMessage;
  readonly surfaceOptions = SURFACE_OPTIONS;
  readonly query = signal('');
  readonly modalMode = signal<'create' | 'edit' | 'detail' | 'delete' | null>(null);
  readonly selectedClinicalRecord = signal<ClinicalRecord | null>(null);

  formData: ClinicalRecordFormData = this.createEmptyForm();

  readonly filteredClinicalRecords = computed(() => {
    const normalizedQuery = this.query().trim().toLowerCase();

    return this.clinicalRecords().filter((clinicalRecord) => {
      const matchesQuery =
        !normalizedQuery ||
        clinicalRecord.patientName.toLowerCase().includes(normalizedQuery) ||
        clinicalRecord.dentistName.toLowerCase().includes(normalizedQuery) ||
        clinicalRecord.diagnosis.toLowerCase().includes(normalizedQuery);

      return matchesQuery;
    });
  });

  ngOnInit(): void {
    this.clinicalRecordController.load();
  }

  formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const [date] = value.split('T');
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  formatShortId(id: string): string {
    return id.slice(-4).toUpperCase();
  }

  openCreate(): void {
    this.formData = this.createEmptyForm();
    this.formData.patient_id = this.patientOptions()[0]?.id ?? '';
    this.formData.dentist_id = this.dentistOptions()[0]?.id ?? '';
    this.selectedClinicalRecord.set(null);
    this.modalMode.set('create');
  }

  openDetail(clinicalRecord: ClinicalRecord): void {
    this.selectedClinicalRecord.set(clinicalRecord);
    this.modalMode.set('detail');
  }

  openEdit(clinicalRecord: ClinicalRecord): void {
    this.selectedClinicalRecord.set(clinicalRecord);
    this.formData = this.toFormData(clinicalRecord);
    this.modalMode.set('edit');
  }

  openDelete(clinicalRecord: ClinicalRecord): void {
    this.selectedClinicalRecord.set(clinicalRecord);
    this.modalMode.set('delete');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedClinicalRecord.set(null);
  }

  addOdontogramRow(): void {
    this.formData.odontogram_entries.push({
      toothFdi: '',
      surface: '',
      condition: '',
      notes: ''
    });
  }

  removeOdontogramRow(index: number): void {
    this.formData.odontogram_entries.splice(index, 1);
  }

  saveClinicalRecord(): void {
    const selectedClinicalRecord = this.selectedClinicalRecord();

    if (this.modalMode() === 'edit' && selectedClinicalRecord) {
      this.clinicalRecordController
        .update(selectedClinicalRecord.id, this.formData)
        .subscribe(() => this.closeModal());
      return;
    }

    this.clinicalRecordController.create(this.formData).subscribe(() => this.closeModal());
  }

  deleteClinicalRecord(): void {
    const clinicalRecord = this.selectedClinicalRecord();

    if (!clinicalRecord) {
      return;
    }

    this.clinicalRecordController.remove(clinicalRecord.id).subscribe(() => this.closeModal());
  }

  private createEmptyForm(): ClinicalRecordFormData {
    return {
      patient_id: '',
      dentist_id: '',
      appointment_id: '',
      chief_complaint: '',
      diagnosis: '',
      notes: '',
      odontogram_entries: []
    };
  }

  private toFormData(clinicalRecord: ClinicalRecord): ClinicalRecordFormData {
    return {
      patient_id: clinicalRecord.patientId,
      dentist_id: clinicalRecord.dentistId,
      appointment_id: clinicalRecord.appointmentId ?? '',
      chief_complaint: clinicalRecord.chiefComplaint,
      diagnosis: clinicalRecord.diagnosis,
      notes: clinicalRecord.notes,
      odontogram_entries: clinicalRecord.odontogramEntries.map((entry) => ({ ...entry }))
    };
  }
}
