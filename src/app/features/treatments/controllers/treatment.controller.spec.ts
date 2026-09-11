import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TreatmentOutDto } from '../../../core/api/api.types';
import { TreatmentApiService } from '../services/treatment-api.service';
import { TreatmentFormData } from '../models/treatment.model';
import { TreatmentController } from './treatment.controller';

const TREATMENT_DTO: TreatmentOutDto = {
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

const FORM_DATA: TreatmentFormData = {
  category: 'general',
  code: 'G-1',
  name: 'Limpieza',
  description: '',
  defaultPrice: 100,
  defaultDurationMinutes: 30,
  isActive: true
};

describe('TreatmentController', () => {
  let controller: TreatmentController;
  let apiSpy: jasmine.SpyObj<TreatmentApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<TreatmentApiService>('TreatmentApiService', [
      'list',
      'create',
      'update',
      'remove'
    ]);

    TestBed.configureTestingModule({
      providers: [TreatmentController, { provide: TreatmentApiService, useValue: apiSpy }]
    });

    controller = TestBed.inject(TreatmentController);
  });

  it('loads the treatment list and maps DTOs to view models', () => {
    apiSpy.list.and.returnValue(of([TREATMENT_DTO]));

    controller.load();

    expect(controller.isLoading()).toBeFalse();
    expect(controller.list()).toEqual([
      {
        id: 't1',
        category: 'general',
        code: 'G-1',
        name: 'Limpieza',
        description: '',
        defaultPrice: 100,
        defaultDurationMinutes: 30,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]);
  });

  it('sets an error message when load fails', () => {
    apiSpy.list.and.returnValue(throwError(() => new Error('boom')));

    controller.load();

    expect(controller.errorMessage()).toBe('No se pudieron cargar los tratamientos del backend.');
  });

  it('creates a treatment', (done) => {
    apiSpy.create.and.returnValue(of(TREATMENT_DTO));

    controller.create(FORM_DATA).subscribe(() => {
      expect(apiSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'Limpieza', default_price: 100 })
      );
      expect(controller.list().length).toBe(1);
      done();
    });
  });

  it('updates a treatment including is_active', (done) => {
    apiSpy.create.and.returnValue(of(TREATMENT_DTO));
    apiSpy.update.and.returnValue(of({ ...TREATMENT_DTO, is_active: false }));

    controller.create(FORM_DATA).subscribe(() => {
      controller.update('t1', { ...FORM_DATA, isActive: false }).subscribe(() => {
        expect(controller.list()[0].isActive).toBeFalse();
        done();
      });
    });
  });

  it('removes a treatment from the list', (done) => {
    apiSpy.create.and.returnValue(of(TREATMENT_DTO));
    apiSpy.remove.and.returnValue(of(undefined));

    controller.create(FORM_DATA).subscribe(() => {
      controller.remove('t1').subscribe(() => {
        expect(controller.list()).toEqual([]);
        done();
      });
    });
  });
});
