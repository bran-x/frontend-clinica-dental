import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { TreatmentCreateDto, TreatmentOutDto, TreatmentUpdateDto } from '../../../core/api/api.types';
import { TreatmentApiService } from '../services/treatment-api.service';
import { Treatment, TreatmentFormData } from '../models/treatment.model';

@Injectable({ providedIn: 'root' })
export class TreatmentController {
  private readonly treatments = signal<Treatment[]>([]);

  readonly list = this.treatments.asReadonly();
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly treatmentApiService: TreatmentApiService) {}

  load(q?: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.treatmentApiService.list(q).subscribe({
      next: (treatments) => {
        this.treatments.set(treatments.map((treatment) => this.toTreatment(treatment)));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los tratamientos del backend.');
        this.isLoading.set(false);
      }
    });
  }

  create(data: TreatmentFormData): Observable<TreatmentOutDto> {
    return this.treatmentApiService.create(this.toCreateDto(data)).pipe(
      tap((createdTreatment) =>
        this.treatments.update((treatments) => [this.toTreatment(createdTreatment), ...treatments])
      )
    );
  }

  update(treatmentId: string, data: TreatmentFormData): Observable<TreatmentOutDto> {
    return this.treatmentApiService.update(treatmentId, this.toUpdateDto(data)).pipe(
      tap((updatedTreatment) =>
        this.treatments.update((treatments) =>
          treatments.map((treatment) =>
            treatment.id === treatmentId ? this.toTreatment(updatedTreatment) : treatment
          )
        )
      )
    );
  }

  remove(treatmentId: string): Observable<void> {
    return this.treatmentApiService.remove(treatmentId).pipe(
      tap(() =>
        this.treatments.update((treatments) => treatments.filter((treatment) => treatment.id !== treatmentId))
      )
    );
  }

  private toTreatment(treatment: TreatmentOutDto): Treatment {
    return {
      id: treatment.id,
      category: treatment.category,
      code: treatment.code ?? '',
      name: treatment.name,
      description: treatment.description ?? '',
      defaultPrice: treatment.default_price,
      defaultDurationMinutes: treatment.default_duration_minutes,
      isActive: treatment.is_active,
      createdAt: treatment.created_at
    };
  }

  private toCreateDto(data: TreatmentFormData): TreatmentCreateDto {
    return {
      category: data.category,
      code: data.code || null,
      name: data.name,
      description: data.description || null,
      default_price: data.defaultPrice,
      default_duration_minutes: data.defaultDurationMinutes
    };
  }

  private toUpdateDto(data: TreatmentFormData): TreatmentUpdateDto {
    return {
      ...this.toCreateDto(data),
      is_active: data.isActive
    };
  }
}
