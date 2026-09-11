import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { CrudApiBaseService } from '../../../core/api/crud-api-base.service';
import { TreatmentCreateDto, TreatmentOutDto, TreatmentUpdateDto } from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class TreatmentApiService extends CrudApiBaseService<
  TreatmentOutDto,
  TreatmentCreateDto,
  TreatmentUpdateDto
> {
  constructor() {
    const http = inject(HttpClient);

    super(http, 'treatments');
  }

  list(q?: string, category?: string, isActive?: boolean, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (q?.trim()) {
      params = params.set('q', q.trim());
    }

    if (category?.trim()) {
      params = params.set('category', category.trim());
    }

    if (isActive !== undefined) {
      params = params.set('is_active', isActive);
    }

    return this.http.get<TreatmentOutDto[]>(this.resourceUrl, { params });
  }
}
