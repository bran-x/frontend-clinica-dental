import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PatientCreateDto, PatientOutDto, PatientUpdateDto } from '../../../core/api/api.types';
import { SimpleCrudController } from '../../../shared/controllers/simple-crud.controller';
import { PatientApiService } from '../services/patient-api.service';
import { Patient, PatientFormData } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientController extends SimpleCrudController<
  Patient,
  PatientOutDto,
  PatientFormData,
  PatientCreateDto,
  PatientUpdateDto
> {
  private readonly patientApiService = inject(PatientApiService);

  protected readonly loadErrorMessage = 'No se pudieron cargar los pacientes del backend.';

  protected apiList(q?: string): Observable<PatientOutDto[]> {
    return this.patientApiService.list(q);
  }

  protected apiCreate(data: PatientCreateDto): Observable<PatientOutDto> {
    return this.patientApiService.create(data);
  }

  protected apiUpdate(id: string, data: PatientUpdateDto): Observable<PatientOutDto> {
    return this.patientApiService.update(id, data);
  }

  protected apiRemove(id: string): Observable<void> {
    return this.patientApiService.remove(id);
  }

  protected getId(model: Patient): string {
    return model.id;
  }

  protected toModel(patient: PatientOutDto): Patient {
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

  protected toCreateDto(data: PatientFormData): PatientCreateDto {
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

  protected toUpdateDto(data: PatientFormData): PatientUpdateDto {
    return this.toCreateDto(data);
  }
}
