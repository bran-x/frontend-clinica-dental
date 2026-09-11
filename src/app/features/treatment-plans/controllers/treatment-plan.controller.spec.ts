import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import {
  DentistOutDto,
  PatientOutDto,
  TreatmentOutDto,
  TreatmentPlanOutDto
} from '../../../core/api/api.types';
import { PatientApiService } from '../../patients/services/patient-api.service';
import { TreatmentPlanApiService } from '../services/treatment-plan-api.service';
import { TreatmentPlanFormData } from '../models/treatment-plan.model';
import { TreatmentPlanController } from './treatment-plan.controller';

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

const PLAN: TreatmentPlanOutDto = {
  id: 'tp1',
  patient_id: 'p1',
  dentist_id: 'd1',
  title: 'Plan integral',
  items: [
    { treatment_id: 't1', tooth_fdi: '11', quantity: 2, unit_price: 100, status: 'pending' }
  ],
  status: 'proposed',
  total_estimated: 200,
  created_at: '2024-01-01T00:00:00Z'
};

const FORM_DATA: TreatmentPlanFormData = {
  patient_id: 'p1',
  dentist_id: 'd1',
  title: 'Plan integral',
  status: 'proposed',
  items: [{ treatment_id: 't1', tooth_fdi: '11', quantity: 2, unit_price: 100, status: 'pending' }]
};

describe('TreatmentPlanController', () => {
  let controller: TreatmentPlanController;
  let planApiSpy: jasmine.SpyObj<TreatmentPlanApiService>;
  let patientApiSpy: jasmine.SpyObj<PatientApiService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    planApiSpy = jasmine.createSpyObj<TreatmentPlanApiService>('TreatmentPlanApiService', [
      'list',
      'create',
      'update',
      'remove'
    ]);
    patientApiSpy = jasmine.createSpyObj<PatientApiService>('PatientApiService', ['list']);

    TestBed.configureTestingModule({
      providers: [
        TreatmentPlanController,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TreatmentPlanApiService, useValue: planApiSpy },
        { provide: PatientApiService, useValue: patientApiSpy }
      ]
    });

    controller = TestBed.inject(TreatmentPlanController);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function loadWithBackendData(): void {
    patientApiSpy.list.and.returnValue(of([PATIENT]));
    planApiSpy.list.and.returnValue(of([PLAN]));

    controller.load();

    httpMock.expectOne((r) => r.url === `${API_BASE_URL}/dentists`).flush([DENTIST]);
    httpMock.expectOne((r) => r.url === `${API_BASE_URL}/treatments`).flush([TREATMENT]);
  }

  it('loads patients, dentists, treatments and plans, resolving names and recomputing item totals', () => {
    loadWithBackendData();

    expect(controller.isLoading()).toBeFalse();
    expect(controller.patientOptions()).toEqual([{ id: 'p1', name: 'Ana Gomez' }]);
    expect(controller.dentistOptions()).toEqual([{ id: 'd1', name: 'Dr. Perez' }]);
    expect(controller.treatmentOptions()).toEqual([{ id: 't1', name: 'Limpieza', defaultPrice: 100 }]);
    expect(controller.list()).toEqual([
      {
        id: 'tp1',
        patientId: 'p1',
        patientName: 'Ana Gomez',
        dentistId: 'd1',
        dentistName: 'Dr. Perez',
        title: 'Plan integral',
        items: [
          {
            treatmentId: 't1',
            treatmentName: 'Limpieza',
            toothFdi: '11',
            quantity: 2,
            unitPrice: 100,
            status: 'pending'
          }
        ],
        status: 'proposed',
        totalEstimated: 200,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]);
  });

  it('sets an error message when load fails', () => {
    patientApiSpy.list.and.returnValue(throwError(() => new Error('boom')));
    planApiSpy.list.and.returnValue(of([]));

    controller.load();

    expect(controller.errorMessage()).toBe('No se pudieron cargar los planes de tratamiento del backend.');
    expect(controller.isLoading()).toBeFalse();
  });

  it('creates a treatment plan, sending mapped items in the request body', (done) => {
    loadWithBackendData();
    planApiSpy.create.and.returnValue(of(PLAN));

    controller.create(FORM_DATA).subscribe(() => {
      expect(planApiSpy.create).toHaveBeenCalledWith({
        patient_id: 'p1',
        dentist_id: 'd1',
        title: 'Plan integral',
        items: [{ treatment_id: 't1', tooth_fdi: '11', quantity: 2, unit_price: 100, status: 'pending' }]
      });
      expect(controller.list().length).toBe(2);
      done();
    });
  });

  it('recalculates the total when an item quantity changes via update', (done) => {
    loadWithBackendData();
    const updatedPlan: TreatmentPlanOutDto = {
      ...PLAN,
      items: [{ ...PLAN.items[0], quantity: 4 }],
      total_estimated: 400
    };
    planApiSpy.update.and.returnValue(of(updatedPlan));

    controller
      .update('tp1', { ...FORM_DATA, items: [{ ...FORM_DATA.items[0], quantity: 4 }] })
      .subscribe(() => {
        const plan = controller.list().find((p) => p.id === 'tp1');
        expect(plan?.items[0].quantity).toBe(4);
        expect(plan?.totalEstimated).toBe(400);
        done();
      });
  });

  it('updates plan status in place', (done) => {
    loadWithBackendData();
    planApiSpy.update.and.returnValue(of({ ...PLAN, status: 'accepted' }));

    controller.updateStatus('tp1', 'accepted').subscribe(() => {
      expect(controller.list()[0].status).toBe('accepted');
      done();
    });
  });

  it('removes a treatment plan from the list', (done) => {
    loadWithBackendData();
    planApiSpy.remove.and.returnValue(of(undefined));

    controller.remove('tp1').subscribe(() => {
      expect(controller.list()).toEqual([]);
      done();
    });
  });
});
