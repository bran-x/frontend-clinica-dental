import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_BASE_URL } from '../../../core/api/api.config';
import {
  ClinicalRecordCreateDto,
  ClinicalRecordOutDto,
  ClinicalRecordUpdateDto
} from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class ClinicalRecordApiService {
  constructor(private readonly http: HttpClient) {}

  list(patientId?: string | null, dentistId?: string | null, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (patientId) {
      params = params.set('patient_id', patientId);
    }

    if (dentistId) {
      params = params.set('dentist_id', dentistId);
    }

    return this.http.get<ClinicalRecordOutDto[]>(`${API_BASE_URL}/clinical-records`, { params });
  }

  get(clinicalRecordId: string) {
    return this.http.get<ClinicalRecordOutDto>(`${API_BASE_URL}/clinical-records/${clinicalRecordId}`);
  }

  create(data: ClinicalRecordCreateDto) {
    return this.http.post<ClinicalRecordOutDto>(`${API_BASE_URL}/clinical-records`, data);
  }

  update(clinicalRecordId: string, data: ClinicalRecordUpdateDto) {
    return this.http.put<ClinicalRecordOutDto>(`${API_BASE_URL}/clinical-records/${clinicalRecordId}`, data);
  }

  remove(clinicalRecordId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/clinical-records/${clinicalRecordId}`);
  }
}
