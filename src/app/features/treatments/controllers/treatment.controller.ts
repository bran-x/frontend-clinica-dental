import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TreatmentCreateDto, TreatmentOutDto, TreatmentUpdateDto } from '../../../core/api/api.types';
import { SimpleCrudController } from '../../../shared/controllers/simple-crud.controller';
import { TreatmentApiService } from '../services/treatment-api.service';
import { Treatment, TreatmentFormData } from '../models/treatment.model';

@Injectable({ providedIn: 'root' })
export class TreatmentController extends SimpleCrudController<
  Treatment,
  TreatmentOutDto,
  TreatmentFormData,
  TreatmentCreateDto,
  TreatmentUpdateDto
> {
  private readonly treatmentApiService = inject(TreatmentApiService);

  protected readonly loadErrorMessage = 'No se pudieron cargar los tratamientos del backend.';

  protected apiList(q?: string): Observable<TreatmentOutDto[]> {
    return this.treatmentApiService.list(q);
  }

  protected apiCreate(data: TreatmentCreateDto): Observable<TreatmentOutDto> {
    return this.treatmentApiService.create(data);
  }

  protected apiUpdate(id: string, data: TreatmentUpdateDto): Observable<TreatmentOutDto> {
    return this.treatmentApiService.update(id, data);
  }

  protected apiRemove(id: string): Observable<void> {
    return this.treatmentApiService.remove(id);
  }

  protected getId(model: Treatment): string {
    return model.id;
  }

  protected toModel(treatment: TreatmentOutDto): Treatment {
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

  protected toCreateDto(data: TreatmentFormData): TreatmentCreateDto {
    return {
      category: data.category,
      code: data.code || null,
      name: data.name,
      description: data.description || null,
      default_price: data.defaultPrice,
      default_duration_minutes: data.defaultDurationMinutes
    };
  }

  protected toUpdateDto(data: TreatmentFormData): TreatmentUpdateDto {
    return {
      ...this.toCreateDto(data),
      is_active: data.isActive
    };
  }
}
