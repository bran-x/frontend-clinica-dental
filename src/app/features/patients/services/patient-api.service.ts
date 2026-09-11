import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CrudApiBaseService } from '../../../core/api/crud-api-base.service';
import { PatientCreateDto, PatientOutDto, PatientUpdateDto } from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class PatientApiService extends CrudApiBaseService<PatientOutDto, PatientCreateDto, PatientUpdateDto> {
  constructor(http: HttpClient) {
    super(http, 'patients');
  }

  list(q?: string, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (q?.trim()) {
      params = params.set('q', q.trim());
    }

    return this.http.get<PatientOutDto[]>(this.resourceUrl, { params });
  }
}
