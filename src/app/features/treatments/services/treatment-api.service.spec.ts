import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/api/api.config';
import { TreatmentOutDto } from '../../../core/api/api.types';
import { TreatmentApiService } from './treatment-api.service';

const TREATMENT: TreatmentOutDto = {
  id: 't1',
  category: 'general',
  code: 'G-1',
  name: 'Limpieza',
  description: null,
  default_price: 100,
  default_duration_minutes: 30,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z'
};

describe('TreatmentApiService', () => {
  let service: TreatmentApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(TreatmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists treatments with default paging params', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === `${API_BASE_URL}/treatments` && request.method === 'GET'
    );
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush([TREATMENT]);
  });

  it('lists treatments filtered by q, category and is_active', () => {
    service.list('limpieza', 'general', true).subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/treatments?skip=0&limit=50&q=limpieza&category=general&is_active=true`
    );
    expect(req.request.method).toBe('GET');
    req.flush([TREATMENT]);
  });

  it('gets a single treatment by id', () => {
    service.get('t1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/treatments/t1`);
    expect(req.request.method).toBe('GET');
    req.flush(TREATMENT);
  });

  it('creates a treatment', () => {
    const body = { category: 'general', name: 'Limpieza', default_price: 100 };
    service.create(body).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/treatments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(TREATMENT);
  });

  it('updates a treatment', () => {
    service.update('t1', { default_price: 150 }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/treatments/t1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ default_price: 150 });
    req.flush(TREATMENT);
  });

  it('removes a treatment', () => {
    service.remove('t1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/treatments/t1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
