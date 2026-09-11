import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DentistCreateDto, DentistOutDto, DentistUpdateDto } from '../../../core/api/api.types';
import { SimpleCrudController } from '../../../shared/controllers/simple-crud.controller';
import { DentistApiService } from '../services/dentist-api.service';
import { Dentist, DentistFormData } from '../models/dentist.model';

@Injectable({ providedIn: 'root' })
export class DentistController extends SimpleCrudController<
  Dentist,
  DentistOutDto,
  DentistFormData,
  DentistCreateDto,
  DentistUpdateDto
> {
  protected readonly loadErrorMessage = 'No se pudieron cargar los odontologos del backend.';

  constructor(private readonly dentistApiService: DentistApiService) {
    super();
  }

  protected apiList(q?: string): Observable<DentistOutDto[]> {
    return this.dentistApiService.list(q);
  }

  protected apiCreate(data: DentistCreateDto): Observable<DentistOutDto> {
    return this.dentistApiService.create(data);
  }

  protected apiUpdate(id: string, data: DentistUpdateDto): Observable<DentistOutDto> {
    return this.dentistApiService.update(id, data);
  }

  protected apiRemove(id: string): Observable<void> {
    return this.dentistApiService.remove(id);
  }

  protected getId(model: Dentist): string {
    return model.id;
  }

  protected toModel(dentist: DentistOutDto): Dentist {
    return {
      id: dentist.id,
      fullName: dentist.full_name,
      licenseNumber: dentist.license_number ?? '',
      specialties: dentist.specialties ?? [],
      colorHex: dentist.color_hex ?? '#006c9a',
      bio: dentist.bio ?? '',
      workSchedule: (dentist.work_schedule ?? []).map((slot) => ({
        weekday: slot.weekday,
        startTime: slot.start_time,
        endTime: slot.end_time
      })),
      isActive: dentist.is_active,
      createdAt: dentist.created_at
    };
  }

  protected toCreateDto(data: DentistFormData): DentistCreateDto {
    return {
      full_name: data.fullName,
      license_number: data.licenseNumber || null,
      specialties: this.parseSpecialties(data.specialtiesText),
      color_hex: data.colorHex || null,
      bio: data.bio || null,
      work_schedule: data.workSchedule
        .filter((slot) => slot.startTime && slot.endTime)
        .map((slot) => ({
          weekday: slot.weekday,
          start_time: slot.startTime,
          end_time: slot.endTime
        }))
    };
  }

  protected toUpdateDto(data: DentistFormData): DentistUpdateDto {
    return {
      ...this.toCreateDto(data),
      is_active: data.isActive
    };
  }

  private parseSpecialties(specialtiesText: string): string[] {
    return specialtiesText
      .split(',')
      .map((specialty) => specialty.trim())
      .filter((specialty) => specialty.length > 0);
  }
}
