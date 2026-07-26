import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { PatientCreateDto, PatientOutDto, PatientUpdateDto } from '../../../core/api/api.types';
import { PatientApiService } from '../services/patient-api.service';
import { Patient, PatientFormData } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientController {
  private readonly patients = signal<Patient[]>([]);

  readonly list = this.patients.asReadonly();
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly patientApiService: PatientApiService) {}

  load(q?: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.patientApiService.list(q).subscribe({
      next: (patients) => {
        this.patients.set(patients.map((patient) => this.toPatient(patient)));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los pacientes del backend.');
        this.isLoading.set(false);
      }
    });
  }

  create(data: PatientFormData): Observable<PatientOutDto> {
    return this.patientApiService.create(this.toCreateDto(data)).pipe(
      tap((createdPatient) =>
        this.patients.update((patients) => [this.toPatient(createdPatient), ...patients])
      )
    );
  }

  update(patientId: string, data: PatientFormData): Observable<PatientOutDto> {
    return this.patientApiService.update(patientId, this.toUpdateDto(data)).pipe(
      tap((updatedPatient) =>
        this.patients.update((patients) =>
          patients.map((patient) =>
            patient.id === patientId ? this.toPatient(updatedPatient) : patient
          )
        )
      )
    );
  }

  remove(patientId: string): Observable<void> {
    return this.patientApiService.remove(patientId).pipe(
      tap(() => this.patients.update((patients) => patients.filter((patient) => patient.id !== patientId)))
    );
  }

  private toPatient(patient: PatientOutDto): Patient {
    return {
      id: patient.id,
      dni: patient.document_id,
      firstName: patient.first_name,
      lastName: patient.last_name,
      birthDate: patient.birth_date ?? null,
      phone: patient.phone ?? '',
      email: patient.email ?? '',
      observations: patient.notes ?? '',
      registeredAt: patient.created_at
    };
  }

  private toCreateDto(data: PatientFormData): PatientCreateDto {
    return {
      first_name: data.firstName,
      last_name: data.lastName,
      document_id: data.dni,
      email: data.email || null,
      phone: data.phone || null,
      birth_date: data.birthDate || null,
      notes: data.observations || null
    };
  }

  private toUpdateDto(data: PatientFormData): PatientUpdateDto {
    return this.toCreateDto(data);
  }
}
