import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import { AppointmentOutDto, DentistOutDto, PatientOutDto } from '../../../core/api/api.types';
import { PatientApiService } from '../../patients/services/patient-api.service';
import { AppointmentApiService } from '../services/appointment-api.service';
import { AppointmentFormData } from '../models/appointment.model';
import { AppointmentController } from './appointment.controller';

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

const DENTIST: DentistOutDto = {
  id: 'd1',
  full_name: 'Dr. Perez',
  license_number: '123',
  specialties: [],
  color_hex: '#000000',
  bio: null,
  work_schedule: [],
  schedule_exceptions: [],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

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

const FORM_DATA: AppointmentFormData = {
  patient_id: 'p1',
  dentist_id: 'd1',
  starts_at: '2024-01-01T10:00',
  duration_minutes: 30,
  reason: 'Consulta'
};

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let appointmentApiSpy: jasmine.SpyObj<AppointmentApiService>;
  let patientApiSpy: jasmine.SpyObj<PatientApiService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    appointmentApiSpy = jasmine.createSpyObj<AppointmentApiService>('AppointmentApiService', [
      'list',
      'create',
      'update',
      'updateStatus',
      'remove'
    ]);
    patientApiSpy = jasmine.createSpyObj<PatientApiService>('PatientApiService', ['list']);

    TestBed.configureTestingModule({
      providers: [
        AppointmentController,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppointmentApiService, useValue: appointmentApiSpy },
        { provide: PatientApiService, useValue: patientApiSpy }
      ]
    });

    controller = TestBed.inject(AppointmentController);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function loadWithBackendData(): void {
    patientApiSpy.list.and.returnValue(of([PATIENT]));
    appointmentApiSpy.list.and.returnValue(of([APPOINTMENT]));

    controller.load();

    const req = httpMock.expectOne((r) => r.url === `${API_BASE_URL}/dentists`);
    req.flush([DENTIST]);
  }

  it('loads patients, dentists and appointments, mapping patient names', () => {
    loadWithBackendData();

    expect(controller.isLoading()).toBeFalse();
    expect(controller.patientOptions()).toEqual([{ id: 'p1', name: 'Ana Gomez' }]);
    expect(controller.dentistOptions()).toEqual([{ id: 'd1', name: 'Dr. Perez' }]);
    expect(controller.list()).toEqual([
      {
        id: 'a1',
        patientId: 'p1',
        patientName: 'Ana Gomez',
        dentistId: 'd1',
        dentistName: 'Dr. Perez',
        reason: 'Consulta',
        startsAt: '2024-01-01T10:00:00',
        date: '2024-01-01',
        time: '10:00',
        durationMinutes: 30,
        status: 'scheduled'
      }
    ]);
  });

  it('sets an error message when load fails', () => {
    patientApiSpy.list.and.returnValue(throwError(() => new Error('boom')));
    appointmentApiSpy.list.and.returnValue(of([]));

    controller.load();

    expect(controller.isLoading()).toBeFalse();
    expect(controller.errorMessage()).toBe('No se pudieron cargar las citas del backend.');
  });

  it('creates an appointment and prepends it to the list', (done) => {
    loadWithBackendData();
    appointmentApiSpy.create.and.returnValue(of(APPOINTMENT));

    controller.create(FORM_DATA).subscribe(() => {
      expect(appointmentApiSpy.create).toHaveBeenCalledWith({
        patient_id: 'p1',
        dentist_id: 'd1',
        starts_at: '2024-01-01T10:00:00',
        duration_minutes: 30,
        reason: 'Consulta'
      });
      expect(controller.list().length).toBe(2);
      expect(controller.list()[0].id).toBe('a1');
      done();
    });
  });

  it('surfaces a 409 conflict error from updateStatus/create through the observable error channel', (done) => {
    loadWithBackendData();
    appointmentApiSpy.create.and.returnValue(
      throwError(() => new Error('Conflict: dentist already booked'))
    );

    controller.create(FORM_DATA).subscribe({
      next: () => done.fail('expected an error'),
      error: (err) => {
        expect(err.message).toContain('Conflict');
        done();
      }
    });
  });

  it('updates appointment status in place', (done) => {
    loadWithBackendData();
    appointmentApiSpy.updateStatus.and.returnValue(of({ ...APPOINTMENT, status: 'completed' }));

    controller.updateStatus('a1', 'completed').subscribe(() => {
      expect(controller.list()[0].status).toBe('completed');
      done();
    });
  });

  it('removes an appointment from the list', (done) => {
    loadWithBackendData();
    appointmentApiSpy.remove.and.returnValue(of(undefined));

    controller.remove('a1').subscribe(() => {
      expect(controller.list()).toEqual([]);
      done();
    });
  });
});
