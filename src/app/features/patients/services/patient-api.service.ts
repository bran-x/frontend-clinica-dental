import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_BASE_URL } from '../../../core/api/api.config';
import { PatientCreateDto, PatientOutDto, PatientUpdateDto } from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class PatientApiService {
  constructor(private readonly http: HttpClient) {}

  list(q?: string, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (q?.trim()) {
      params = params.set('q', q.trim());
    }

    return this.http.get<PatientOutDto[]>(`${API_BASE_URL}/patients`, { params });
  }

  get(patientId: string) {
    return this.http.get<PatientOutDto>(`${API_BASE_URL}/patients/${patientId}`);
  }

  create(data: PatientCreateDto) {
    return this.http.post<PatientOutDto>(`${API_BASE_URL}/patients`, data);
  }

  update(patientId: string, data: PatientUpdateDto) {
    return this.http.put<PatientOutDto>(`${API_BASE_URL}/patients/${patientId}`, data);
  }

  remove(patientId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/patients/${patientId}`);
  }
}
