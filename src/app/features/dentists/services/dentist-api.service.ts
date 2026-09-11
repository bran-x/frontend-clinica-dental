import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CrudApiBaseService } from '../../../core/api/crud-api-base.service';
import { DentistCreateDto, DentistOutDto, DentistUpdateDto } from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class DentistApiService extends CrudApiBaseService<DentistOutDto, DentistCreateDto, DentistUpdateDto> {
  constructor(http: HttpClient) {
    super(http, 'dentists');
  }

  list(q?: string, isActive?: boolean, skip = 0, limit = 50) {
    let params = new HttpParams().set('skip', skip).set('limit', limit);

    if (q?.trim()) {
      params = params.set('q', q.trim());
    }

    if (isActive !== undefined) {
      params = params.set('is_active', isActive);
    }

    return this.http.get<DentistOutDto[]>(this.resourceUrl, { params });
  }
}
