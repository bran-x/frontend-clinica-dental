import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/api/api.config';
import { TreatmentPlanOutDto } from '../../../core/api/api.types';
import { TreatmentPlanApiService } from './treatment-plan-api.service';

const PLAN: TreatmentPlanOutDto = {
  id: 'tp1',
  patient_id: 'p1',
  dentist_id: 'd1',
  title: 'Plan',
  items: [],
  status: 'proposed',
  total_estimated: 0,
  created_at: '2024-01-01T00:00:00Z'
};

describe('TreatmentPlanApiService', () => {
  let service: TreatmentPlanApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(TreatmentPlanApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists treatment plans with default paging params', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === `${API_BASE_URL}/treatment-plans` && request.method === 'GET'
    );
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush([PLAN]);
  });

  it('lists treatment plans filtered by patient and dentist', () => {
    service.list('p1', 'd1').subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/treatment-plans?skip=0&limit=50&patient_id=p1&dentist_id=d1`
    );
    expect(req.request.method).toBe('GET');
    req.flush([PLAN]);
  });

  it('gets a single treatment plan by id', () => {
    service.get('tp1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/treatment-plans/tp1`);
    expect(req.request.method).toBe('GET');
    req.flush(PLAN);
  });

  it('creates a treatment plan', () => {
    const body = { patient_id: 'p1', dentist_id: 'd1', title: 'Plan' };
    service.create(body).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/treatment-plans`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(PLAN);
  });

  it('updates a treatment plan', () => {
    service.update('tp1', { status: 'accepted' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/treatment-plans/tp1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'accepted' });
    req.flush(PLAN);
  });

  it('removes a treatment plan', () => {
    service.remove('tp1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/treatment-plans/tp1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
