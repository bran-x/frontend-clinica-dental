import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { CrudApiBaseService } from '../../../core/api/crud-api-base.service';
import {
  ClinicalRecordCreateDto,
  ClinicalRecordOutDto,
  ClinicalRecordUpdateDto
} from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class ClinicalRecordApiService extends CrudApiBaseService<
  ClinicalRecordOutDto,
  ClinicalRecordCreateDto,
  ClinicalRecordUpdateDto
> {
  constructor() {
    const http = inject(HttpClient);

    super(http, 'clinical-records');
  }

  list(patientId?: string | null, dentistId?: string | null, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (patientId) {
      params = params.set('patient_id', patientId);
    }

    if (dentistId) {
      params = params.set('dentist_id', dentistId);
    }

    return this.http.get<ClinicalRecordOutDto[]>(this.resourceUrl, { params });
  }
}
