import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_BASE_URL } from '../../../core/api/api.config';
import { DentistCreateDto, DentistOutDto, DentistUpdateDto } from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class DentistApiService {
  constructor(private readonly http: HttpClient) {}

  list(q?: string, isActive?: boolean, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (q?.trim()) {
      params = params.set('q', q.trim());
    }

    if (isActive !== undefined) {
      params = params.set('is_active', isActive);
    }

    return this.http.get<DentistOutDto[]>(`${API_BASE_URL}/dentists`, { params });
  }

  get(dentistId: string) {
    return this.http.get<DentistOutDto>(`${API_BASE_URL}/dentists/${dentistId}`);
  }

  create(data: DentistCreateDto) {
    return this.http.post<DentistOutDto>(`${API_BASE_URL}/dentists`, data);
  }

  update(dentistId: string, data: DentistUpdateDto) {
    return this.http.put<DentistOutDto>(`${API_BASE_URL}/dentists/${dentistId}`, data);
  }

  remove(dentistId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/dentists/${dentistId}`);
  }
}
