import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/api/api.config';
import { ClinicalRecordOutDto } from '../../../core/api/api.types';
import { ClinicalRecordApiService } from './clinical-record-api.service';

const RECORD: ClinicalRecordOutDto = {
  id: 'cr1',
  patient_id: 'p1',
  dentist_id: 'd1',
  appointment_id: null,
  chief_complaint: null,
  diagnosis: null,
  notes: null,
  odontogram_entries: [],
  created_at: '2024-01-01T00:00:00Z'
};

describe('ClinicalRecordApiService', () => {
  let service: ClinicalRecordApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ClinicalRecordApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists clinical records with default paging params', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === `${API_BASE_URL}/clinical-records` && request.method === 'GET'
    );
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush([RECORD]);
  });

  it('lists clinical records filtered by patient and dentist', () => {
    service.list('p1', 'd1').subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/clinical-records?skip=0&limit=50&patient_id=p1&dentist_id=d1`
    );
    expect(req.request.method).toBe('GET');
    req.flush([RECORD]);
  });

  it('gets a single clinical record by id', () => {
    service.get('cr1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/clinical-records/cr1`);
    expect(req.request.method).toBe('GET');
    req.flush(RECORD);
  });

  it('creates a clinical record', () => {
    const body = { patient_id: 'p1', dentist_id: 'd1' };
    service.create(body).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/clinical-records`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(RECORD);
  });

  it('updates a clinical record', () => {
    service.update('cr1', { diagnosis: 'caries' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/clinical-records/cr1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ diagnosis: 'caries' });
    req.flush(RECORD);
  });

  it('removes a clinical record', () => {
    service.remove('cr1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/clinical-records/cr1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
