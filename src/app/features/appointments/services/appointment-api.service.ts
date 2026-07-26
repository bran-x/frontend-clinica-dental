import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_BASE_URL } from '../../../core/api/api.config';
import {
  AppointmentCreateDto,
  AppointmentOutDto,
  AppointmentStatusDto,
  AppointmentStatusUpdateDto,
  AppointmentUpdateDto
} from '../../../core/api/api.types';

export interface AppointmentListFilters {
  patient_id?: string | null;
  dentist_name?: string | null;
  status?: AppointmentStatusDto | null;
  date_from?: string | null;
  date_to?: string | null;
  skip?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  constructor(private readonly http: HttpClient) {}

  list(filters: AppointmentListFilters = {}) {
    let params = new HttpParams()
      .set('skip', filters.skip ?? 0)
      .set('limit', filters.limit ?? 50);

    for (const key of ['patient_id', 'dentist_name', 'status', 'date_from', 'date_to'] as const) {
      const value = filters[key];

      if (value) {
        params = params.set(key, value);
      }
    }

    return this.http.get<AppointmentOutDto[]>(`${API_BASE_URL}/appointments`, { params });
  }

  get(appointmentId: string) {
    return this.http.get<AppointmentOutDto>(`${API_BASE_URL}/appointments/${appointmentId}`);
  }

  create(data: AppointmentCreateDto) {
    return this.http.post<AppointmentOutDto>(`${API_BASE_URL}/appointments`, data);
  }

  update(appointmentId: string, data: AppointmentUpdateDto) {
    return this.http.put<AppointmentOutDto>(`${API_BASE_URL}/appointments/${appointmentId}`, data);
  }

  updateStatus(appointmentId: string, data: AppointmentStatusUpdateDto) {
    return this.http.patch<AppointmentOutDto>(`${API_BASE_URL}/appointments/${appointmentId}/status`, data);
  }

  remove(appointmentId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/appointments/${appointmentId}`);
  }
}
