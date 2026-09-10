import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_BASE_URL } from '../../../core/api/api.config';
import {
  TreatmentPlanCreateDto,
  TreatmentPlanOutDto,
  TreatmentPlanUpdateDto
} from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class TreatmentPlanApiService {
  constructor(private readonly http: HttpClient) {}

  list(patientId?: string | null, dentistId?: string | null, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (patientId) {
      params = params.set('patient_id', patientId);
    }

    if (dentistId) {
      params = params.set('dentist_id', dentistId);
    }

    return this.http.get<TreatmentPlanOutDto[]>(`${API_BASE_URL}/treatment-plans`, { params });
  }

  get(treatmentPlanId: string) {
    return this.http.get<TreatmentPlanOutDto>(`${API_BASE_URL}/treatment-plans/${treatmentPlanId}`);
  }

  create(data: TreatmentPlanCreateDto) {
    return this.http.post<TreatmentPlanOutDto>(`${API_BASE_URL}/treatment-plans`, data);
  }

  update(treatmentPlanId: string, data: TreatmentPlanUpdateDto) {
    return this.http.put<TreatmentPlanOutDto>(`${API_BASE_URL}/treatment-plans/${treatmentPlanId}`, data);
  }

  remove(treatmentPlanId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/treatment-plans/${treatmentPlanId}`);
  }
}
