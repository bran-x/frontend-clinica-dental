import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_BASE_URL } from '../../../core/api/api.config';
import { TreatmentCreateDto, TreatmentOutDto, TreatmentUpdateDto } from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class TreatmentApiService {
  constructor(private readonly http: HttpClient) {}

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

    return this.http.get<TreatmentOutDto[]>(`${API_BASE_URL}/treatments`, { params });
  }

  get(treatmentId: string) {
    return this.http.get<TreatmentOutDto>(`${API_BASE_URL}/treatments/${treatmentId}`);
  }

  create(data: TreatmentCreateDto) {
    return this.http.post<TreatmentOutDto>(`${API_BASE_URL}/treatments`, data);
  }

  update(treatmentId: string, data: TreatmentUpdateDto) {
    return this.http.put<TreatmentOutDto>(`${API_BASE_URL}/treatments/${treatmentId}`, data);
  }

  remove(treatmentId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/treatments/${treatmentId}`);
  }
}
