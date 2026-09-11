import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CrudApiBaseService } from '../../../core/api/crud-api-base.service';
import {
  AppointmentCreateDto,
  AppointmentOutDto,
  AppointmentStatusDto,
  AppointmentStatusUpdateDto,
  AppointmentUpdateDto
} from '../../../core/api/api.types';

export interface AppointmentListFilters {
  patient_id?: string | null;
  dentist_id?: string | null;
  status?: AppointmentStatusDto | null;
  date_from?: string | null;
  date_to?: string | null;
  skip?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AppointmentApiService extends CrudApiBaseService<
  AppointmentOutDto,
  AppointmentCreateDto,
  AppointmentUpdateDto
> {
  constructor(http: HttpClient) {
    super(http, 'appointments');
  }

  list(filters: AppointmentListFilters = {}) {
    let params = new HttpParams()
      .set('skip', filters.skip ?? 0)
      .set('limit', filters.limit ?? 50);

    for (const key of ['patient_id', 'dentist_id', 'status', 'date_from', 'date_to'] as const) {
      const value = filters[key];

      if (value) {
        params = params.set(key, value);
      }
    }

    return this.http.get<AppointmentOutDto[]>(this.resourceUrl, { params });
  }

  updateStatus(appointmentId: string, data: AppointmentStatusUpdateDto) {
    return this.http.patch<AppointmentOutDto>(`${this.resourceUrl}/${appointmentId}/status`, data);
  }
}
