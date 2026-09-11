import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/api/api.config';
import { PatientOutDto } from '../../../core/api/api.types';
import { PatientApiService } from './patient-api.service';

const PATIENT: PatientOutDto = {
  id: 'p1',
  first_name: 'Ana',
  last_name: 'Gomez',
  document_id: '123',
  email: 'ana@example.com',
  phone: '555',
  birth_date: '1990-01-01',
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('PatientApiService', () => {
  let service: PatientApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(PatientApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists patients with default paging params', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === `${API_BASE_URL}/patients` && request.method === 'GET'
    );
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    expect(req.request.params.has('q')).toBeFalse();
    req.flush([PATIENT]);
  });

  it('lists patients with a trimmed q filter', () => {
    service.list('  ana  ').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/patients?skip=0&limit=50&q=ana`);
    expect(req.request.method).toBe('GET');
    req.flush([PATIENT]);
  });

  it('gets a single patient by id', () => {
    service.get('p1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/patients/p1`);
    expect(req.request.method).toBe('GET');
    req.flush(PATIENT);
  });

  it('creates a patient', () => {
    const body = { first_name: 'Ana', last_name: 'Gomez', document_id: '123' };
    service.create(body).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/patients`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(PATIENT);
  });

  it('updates a patient', () => {
    service.update('p1', { phone: '999' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/patients/p1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ phone: '999' });
    req.flush(PATIENT);
  });

  it('removes a patient', () => {
    service.remove('p1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/patients/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
