import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import {
  ClinicalRecordCreateDto,
  ClinicalRecordOutDto,
  ClinicalRecordUpdateDto,
  DentistOutDto,
  PatientOutDto
} from '../../../core/api/api.types';
import { toNameMap } from '../../../shared/utils/name-map.util';
import { PatientApiService } from '../../patients/services/patient-api.service';
import { ClinicalRecordApiService } from '../services/clinical-record-api.service';
import {
  ClinicalRecord,
  ClinicalRecordDentistOption,
  ClinicalRecordFormData,
  ClinicalRecordPatientOption
} from '../models/clinical-record.model';

@Injectable({ providedIn: 'root' })
export class ClinicalRecordController {
  private readonly clinicalRecordApiService = inject(ClinicalRecordApiService);
  private readonly patientApiService = inject(PatientApiService);

  private readonly http = inject(HttpClient);

  private readonly clinicalRecords = signal<ClinicalRecord[]>([]);
  private readonly patients = signal<ClinicalRecordPatientOption[]>([]);
  private readonly dentists = signal<ClinicalRecordDentistOption[]>([]);

  readonly list = this.clinicalRecords.asReadonly();
  readonly patientOptions = this.patients.asReadonly();
  readonly dentistOptions = this.dentists.asReadonly();
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      patients: this.patientApiService.list(undefined, 0, 200),
      dentists: this.http.get<DentistOutDto[]>(`${API_BASE_URL}/dentists`, { params: { limit: 200 } }),
      clinicalRecords: this.clinicalRecordApiService.list()
    }).subscribe({
      next: ({ patients, dentists, clinicalRecords }) => {
        const patientNames = this.createPatientNameMap(patients);
        const dentistNames = this.createDentistNameMap(dentists);

        this.patients.set(
          patients.map((patient) => ({
            id: patient.id,
            name: `${patient.first_name} ${patient.last_name}`
          }))
        );
        this.dentists.set(dentists.map((dentist) => ({ id: dentist.id, name: dentist.full_name })));
        this.clinicalRecords.set(
          clinicalRecords.map((clinicalRecord) =>
            this.toClinicalRecord(clinicalRecord, patientNames, dentistNames)
          )
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las historias clinicas del backend.');
        this.isLoading.set(false);
      }
    });
  }

  create(data: ClinicalRecordFormData): Observable<ClinicalRecordOutDto> {
    return this.clinicalRecordApiService.create(this.toCreateDto(data)).pipe(
      tap((created) =>
        this.clinicalRecords.update((records) => [
          this.toClinicalRecord(created, this.currentPatientNames(), this.currentDentistNames()),
          ...records
        ])
      )
    );
  }

  update(clinicalRecordId: string, data: ClinicalRecordFormData): Observable<ClinicalRecordOutDto> {
    return this.clinicalRecordApiService.update(clinicalRecordId, this.toUpdateDto(data)).pipe(
      tap((updated) =>
        this.clinicalRecords.update((records) =>
          records.map((record) =>
            record.id === clinicalRecordId
              ? this.toClinicalRecord(updated, this.currentPatientNames(), this.currentDentistNames())
              : record
          )
        )
      )
    );
  }

  remove(clinicalRecordId: string): Observable<void> {
    return this.clinicalRecordApiService.remove(clinicalRecordId).pipe(
      tap(() =>
        this.clinicalRecords.update((records) =>
          records.filter((record) => record.id !== clinicalRecordId)
        )
      )
    );
  }

  private toClinicalRecord(
    clinicalRecord: ClinicalRecordOutDto,
    patientNames: Map<string, string>,
    dentistNames: Map<string, string>
  ): ClinicalRecord {
    return {
      id: clinicalRecord.id,
      patientId: clinicalRecord.patient_id,
      patientName: patientNames.get(clinicalRecord.patient_id) ?? clinicalRecord.patient_id,
      dentistId: clinicalRecord.dentist_id,
      dentistName: dentistNames.get(clinicalRecord.dentist_id) ?? clinicalRecord.dentist_id,
      appointmentId: clinicalRecord.appointment_id ?? null,
      chiefComplaint: clinicalRecord.chief_complaint ?? '',
      diagnosis: clinicalRecord.diagnosis ?? '',
      notes: clinicalRecord.notes ?? '',
      odontogramEntries: (clinicalRecord.odontogram_entries ?? []).map((entry) => ({
        toothFdi: entry.tooth_fdi,
        surface: entry.surface ?? '',
        condition: entry.condition,
        notes: entry.notes ?? ''
      })),
      createdAt: clinicalRecord.created_at
    };
  }

  private toCreateDto(data: ClinicalRecordFormData): ClinicalRecordCreateDto {
    return {
      patient_id: data.patient_id,
      dentist_id: data.dentist_id,
      appointment_id: data.appointment_id || null,
      chief_complaint: data.chief_complaint || null,
      diagnosis: data.diagnosis || null,
      notes: data.notes || null,
      odontogram_entries: data.odontogram_entries.map((entry) => ({
        tooth_fdi: entry.toothFdi,
        surface: entry.surface || null,
        condition: entry.condition,
        notes: entry.notes || null
      }))
    };
  }

  private toUpdateDto(data: ClinicalRecordFormData): ClinicalRecordUpdateDto {
    return {
      chief_complaint: data.chief_complaint || null,
      diagnosis: data.diagnosis || null,
      notes: data.notes || null,
      odontogram_entries: data.odontogram_entries.map((entry) => ({
        tooth_fdi: entry.toothFdi,
        surface: entry.surface || null,
        condition: entry.condition,
        notes: entry.notes || null
      }))
    };
  }

  private createPatientNameMap(patients: PatientOutDto[]): Map<string, string> {
    return toNameMap(
      patients,
      (patient) => patient.id,
      (patient) => `${patient.first_name} ${patient.last_name}`
    );
  }

  private createDentistNameMap(dentists: DentistOutDto[]): Map<string, string> {
    return toNameMap(
      dentists,
      (dentist) => dentist.id,
      (dentist) => dentist.full_name
    );
  }

  private currentPatientNames(): Map<string, string> {
    return toNameMap(
      this.patients(),
      (patient) => patient.id,
      (patient) => patient.name
    );
  }

  private currentDentistNames(): Map<string, string> {
    return toNameMap(
      this.dentists(),
      (dentist) => dentist.id,
      (dentist) => dentist.name
    );
  }
}
