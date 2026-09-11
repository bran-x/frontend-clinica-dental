import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CrudApiBaseService } from '../../../core/api/crud-api-base.service';
import {
  TreatmentPlanCreateDto,
  TreatmentPlanOutDto,
  TreatmentPlanUpdateDto
} from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class TreatmentPlanApiService extends CrudApiBaseService<
  TreatmentPlanOutDto,
  TreatmentPlanCreateDto,
  TreatmentPlanUpdateDto
> {
  constructor(http: HttpClient) {
    super(http, 'treatment-plans');
  }

  list(patientId?: string | null, dentistId?: string | null, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (patientId) {
      params = params.set('patient_id', patientId);
    }

    if (dentistId) {
      params = params.set('dentist_id', dentistId);
    }

    return this.http.get<TreatmentPlanOutDto[]>(this.resourceUrl, { params });
  }
}
