import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import { ClinicalRecordOutDto, DentistOutDto, PatientOutDto } from '../../../core/api/api.types';
import { PatientApiService } from '../../patients/services/patient-api.service';
import { ClinicalRecordApiService } from '../services/clinical-record-api.service';
import { ClinicalRecordFormData } from '../models/clinical-record.model';
import { ClinicalRecordController } from './clinical-record.controller';

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

const RECORD: ClinicalRecordOutDto = {
  id: 'cr1',
  patient_id: 'p1',
  dentist_id: 'd1',
  appointment_id: null,
  chief_complaint: 'Dolor',
  diagnosis: 'Caries',
  notes: null,
  odontogram_entries: [],
  created_at: '2024-01-01T00:00:00Z'
};

const FORM_DATA: ClinicalRecordFormData = {
  patient_id: 'p1',
  dentist_id: 'd1',
  appointment_id: '',
  chief_complaint: 'Dolor',
  diagnosis: 'Caries',
  notes: '',
  odontogram_entries: []
};

describe('ClinicalRecordController', () => {
  let controller: ClinicalRecordController;
  let recordApiSpy: jasmine.SpyObj<ClinicalRecordApiService>;
  let patientApiSpy: jasmine.SpyObj<PatientApiService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    recordApiSpy = jasmine.createSpyObj<ClinicalRecordApiService>('ClinicalRecordApiService', [
      'list',
      'create',
      'update',
      'remove'
    ]);
    patientApiSpy = jasmine.createSpyObj<PatientApiService>('PatientApiService', ['list']);

    TestBed.configureTestingModule({
      providers: [
        ClinicalRecordController,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ClinicalRecordApiService, useValue: recordApiSpy },
        { provide: PatientApiService, useValue: patientApiSpy }
      ]
    });

    controller = TestBed.inject(ClinicalRecordController);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function loadWithBackendData(): void {
    patientApiSpy.list.and.returnValue(of([PATIENT]));
    recordApiSpy.list.and.returnValue(of([RECORD]));

    controller.load();

    httpMock.expectOne((r) => r.url === `${API_BASE_URL}/dentists`).flush([DENTIST]);
  }

  it('loads patients, dentists and clinical records, resolving names', () => {
    loadWithBackendData();

    expect(controller.isLoading()).toBeFalse();
    expect(controller.list()).toEqual([
      {
        id: 'cr1',
        patientId: 'p1',
        patientName: 'Ana Gomez',
        dentistId: 'd1',
        dentistName: 'Dr. Perez',
        appointmentId: null,
        chiefComplaint: 'Dolor',
        diagnosis: 'Caries',
        notes: '',
        odontogramEntries: [],
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]);
  });

  it('sets an error message when load fails', () => {
    patientApiSpy.list.and.returnValue(throwError(() => new Error('boom')));
    recordApiSpy.list.and.returnValue(of([]));

    controller.load();

    expect(controller.errorMessage()).toBe('No se pudieron cargar las historias clinicas del backend.');
    expect(controller.isLoading()).toBeFalse();
  });

  it('creates a clinical record and prepends it to the list', (done) => {
    loadWithBackendData();
    recordApiSpy.create.and.returnValue(of(RECORD));

    controller.create(FORM_DATA).subscribe(() => {
      expect(recordApiSpy.create).toHaveBeenCalledWith({
        patient_id: 'p1',
        dentist_id: 'd1',
        appointment_id: null,
        chief_complaint: 'Dolor',
        diagnosis: 'Caries',
        notes: null,
        odontogram_entries: []
      });
      expect(controller.list().length).toBe(2);
      done();
    });
  });

  it('updates a clinical record in place', (done) => {
    loadWithBackendData();
    recordApiSpy.update.and.returnValue(of({ ...RECORD, diagnosis: 'Pulpitis' }));

    controller.update('cr1', { ...FORM_DATA, diagnosis: 'Pulpitis' }).subscribe(() => {
      const record = controller.list().find((r) => r.id === 'cr1');
      expect(record?.diagnosis).toBe('Pulpitis');
      done();
    });
  });

  it('removes a clinical record from the list', (done) => {
    loadWithBackendData();
    recordApiSpy.remove.and.returnValue(of(undefined));

    controller.remove('cr1').subscribe(() => {
      expect(controller.list()).toEqual([]);
      done();
    });
  });
});
