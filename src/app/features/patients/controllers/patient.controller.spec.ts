import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PatientOutDto } from '../../../core/api/api.types';
import { PatientApiService } from '../services/patient-api.service';
import { PatientFormData } from '../models/patient.model';
import { PatientController } from './patient.controller';

const PATIENT_DTO: PatientOutDto = {
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

const FORM_DATA: PatientFormData = {
  dni: '123',
  firstName: 'Ana',
  lastName: 'Gomez',
  birthDate: '1990-01-01',
  phone: '555',
  email: 'ana@example.com',
  observations: ''
};

describe('PatientController', () => {
  let controller: PatientController;
  let apiSpy: jasmine.SpyObj<PatientApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<PatientApiService>('PatientApiService', [
      'list',
      'create',
      'update',
      'remove'
    ]);

    TestBed.configureTestingModule({
      providers: [PatientController, { provide: PatientApiService, useValue: apiSpy }]
    });

    controller = TestBed.inject(PatientController);
  });

  it('loads the patient list and maps DTOs to view models', () => {
    apiSpy.list.and.returnValue(of([PATIENT_DTO]));

    controller.load('ana');

    expect(apiSpy.list).toHaveBeenCalledWith('ana');
    expect(controller.isLoading()).toBeFalse();
    expect(controller.errorMessage()).toBe('');
    expect(controller.list()).toEqual([
      {
        id: 'p1',
        dni: '123',
        firstName: 'Ana',
        lastName: 'Gomez',
        birthDate: '1990-01-01',
        phone: '555',
        email: 'ana@example.com',
        observations: '',
        registeredAt: '2024-01-01T00:00:00Z'
      }
    ]);
  });

  it('sets an error message and stops loading when load fails', () => {
    apiSpy.list.and.returnValue(throwError(() => new Error('network error')));

    controller.load();

    expect(controller.isLoading()).toBeFalse();
    expect(controller.errorMessage()).toBe('No se pudieron cargar los pacientes del backend.');
    expect(controller.list()).toEqual([]);
  });

  it('creates a patient and prepends it to the list', (done) => {
    apiSpy.create.and.returnValue(of(PATIENT_DTO));

    controller.create(FORM_DATA).subscribe(() => {
      expect(controller.list().length).toBe(1);
      expect(controller.list()[0].id).toBe('p1');
      expect(apiSpy.create).toHaveBeenCalledWith({
        first_name: 'Ana',
        last_name: 'Gomez',
        document_id: '123',
        email: 'ana@example.com',
        phone: '555',
        birth_date: '1990-01-01',
        notes: null
      });
      done();
    });
  });

  it('updates a patient in place', (done) => {
    apiSpy.create.and.returnValue(of(PATIENT_DTO));
    apiSpy.update.and.returnValue(of({ ...PATIENT_DTO, phone: '999' }));

    controller.create(FORM_DATA).subscribe(() => {
      controller.update('p1', { ...FORM_DATA, phone: '999' }).subscribe(() => {
        expect(controller.list()[0].phone).toBe('999');
        done();
      });
    });
  });

  it('removes a patient from the list', (done) => {
    apiSpy.create.and.returnValue(of(PATIENT_DTO));
    apiSpy.remove.and.returnValue(of(undefined));

    controller.create(FORM_DATA).subscribe(() => {
      controller.remove('p1').subscribe(() => {
        expect(controller.list()).toEqual([]);
        done();
      });
    });
  });
});
