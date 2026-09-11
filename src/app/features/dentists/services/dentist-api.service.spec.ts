import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/api/api.config';
import { DentistOutDto } from '../../../core/api/api.types';
import { DentistApiService } from './dentist-api.service';

const DENTIST: DentistOutDto = {
  id: 'd1',
  full_name: 'Dr. Perez',
  license_number: '123',
  specialties: ['ortodoncia'],
  color_hex: '#000000',
  bio: null,
  work_schedule: [],
  schedule_exceptions: [],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('DentistApiService', () => {
  let service: DentistApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(DentistApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists dentists with default paging params', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === `${API_BASE_URL}/dentists` && request.method === 'GET'
    );
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush([DENTIST]);
  });

  it('lists dentists filtered by q and is_active', () => {
    service.list('perez', true).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/dentists?skip=0&limit=50&q=perez&is_active=true`);
    expect(req.request.method).toBe('GET');
    req.flush([DENTIST]);
  });

  it('gets a single dentist by id', () => {
    service.get('d1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/dentists/d1`);
    expect(req.request.method).toBe('GET');
    req.flush(DENTIST);
  });

  it('creates a dentist', () => {
    const body = { full_name: 'Dr. Perez' };
    service.create(body).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/dentists`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(DENTIST);
  });

  it('updates a dentist', () => {
    service.update('d1', { is_active: false }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/dentists/d1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ is_active: false });
    req.flush(DENTIST);
  });

  it('removes a dentist', () => {
    service.remove('d1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/dentists/d1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
