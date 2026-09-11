import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/api/api.config';
import { AppointmentOutDto } from '../../../core/api/api.types';
import { AppointmentApiService } from './appointment-api.service';

const APPOINTMENT: AppointmentOutDto = {
  id: 'a1',
  patient_id: 'p1',
  dentist_id: 'd1',
  dentist_name: 'Dr. Perez',
  starts_at: '2024-01-01T10:00:00',
  duration_minutes: 30,
  reason: 'Consulta',
  status: 'scheduled',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('AppointmentApiService', () => {
  let service: AppointmentApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AppointmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists appointments with default paging params', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === `${API_BASE_URL}/appointments` && request.method === 'GET'
    );
    expect(req.request.params.get('skip')).toBe('0');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush([APPOINTMENT]);
  });

  it('lists appointments filtered by patient, dentist, status and date range', () => {
    service
      .list({
        patient_id: 'p1',
        dentist_id: 'd1',
        status: 'scheduled',
        date_from: '2024-01-01',
        date_to: '2024-01-31'
      })
      .subscribe();

    const req = httpMock.expectOne(
      `${API_BASE_URL}/appointments?skip=0&limit=50&patient_id=p1&dentist_id=d1&status=scheduled&date_from=2024-01-01&date_to=2024-01-31`
    );
    expect(req.request.method).toBe('GET');
    req.flush([APPOINTMENT]);
  });

  it('gets a single appointment by id', () => {
    service.get('a1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/appointments/a1`);
    expect(req.request.method).toBe('GET');
    req.flush(APPOINTMENT);
  });

  it('creates an appointment', () => {
    const body = { patient_id: 'p1', dentist_id: 'd1', starts_at: '2024-01-01T10:00:00', reason: 'Consulta' };
    service.create(body).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/appointments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(APPOINTMENT);
  });

  it('updates an appointment', () => {
    service.update('a1', { reason: 'Revision' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/appointments/a1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ reason: 'Revision' });
    req.flush(APPOINTMENT);
  });

  it('updates appointment status via PATCH', () => {
    service.updateStatus('a1', { status: 'completed' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/appointments/a1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'completed' });
    req.flush(APPOINTMENT);
  });

  it('removes an appointment', () => {
    service.remove('a1').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/appointments/a1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
