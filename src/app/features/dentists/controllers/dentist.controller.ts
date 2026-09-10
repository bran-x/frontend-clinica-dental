import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { DentistCreateDto, DentistOutDto, DentistUpdateDto } from '../../../core/api/api.types';
import { DentistApiService } from '../services/dentist-api.service';
import { Dentist, DentistFormData } from '../models/dentist.model';

@Injectable({ providedIn: 'root' })
export class DentistController {
  private readonly dentists = signal<Dentist[]>([]);

  readonly list = this.dentists.asReadonly();
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly dentistApiService: DentistApiService) {}

  load(q?: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.dentistApiService.list(q).subscribe({
      next: (dentists) => {
        this.dentists.set(dentists.map((dentist) => this.toDentist(dentist)));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los odontologos del backend.');
        this.isLoading.set(false);
      }
    });
  }

  create(data: DentistFormData): Observable<DentistOutDto> {
    return this.dentistApiService.create(this.toCreateDto(data)).pipe(
      tap((createdDentist) =>
        this.dentists.update((dentists) => [this.toDentist(createdDentist), ...dentists])
      )
    );
  }

  update(dentistId: string, data: DentistFormData): Observable<DentistOutDto> {
    return this.dentistApiService.update(dentistId, this.toUpdateDto(data)).pipe(
      tap((updatedDentist) =>
        this.dentists.update((dentists) =>
          dentists.map((dentist) =>
            dentist.id === dentistId ? this.toDentist(updatedDentist) : dentist
          )
        )
      )
    );
  }

  remove(dentistId: string): Observable<void> {
    return this.dentistApiService.remove(dentistId).pipe(
      tap(() => this.dentists.update((dentists) => dentists.filter((dentist) => dentist.id !== dentistId)))
    );
  }

  private toDentist(dentist: DentistOutDto): Dentist {
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

  private toCreateDto(data: DentistFormData): DentistCreateDto {
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

  private toUpdateDto(data: DentistFormData): DentistUpdateDto {
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
