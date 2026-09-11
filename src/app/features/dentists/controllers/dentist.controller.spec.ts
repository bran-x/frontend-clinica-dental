import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DentistOutDto } from '../../../core/api/api.types';
import { DentistApiService } from '../services/dentist-api.service';
import { DentistFormData } from '../models/dentist.model';
import { DentistController } from './dentist.controller';

const DENTIST_DTO: DentistOutDto = {
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

const FORM_DATA: DentistFormData = {
  fullName: 'Dr. Perez',
  licenseNumber: '123',
  specialtiesText: 'ortodoncia, general',
  colorHex: '#000000',
  bio: '',
  workSchedule: [],
  isActive: true
};

describe('DentistController', () => {
  let controller: DentistController;
  let apiSpy: jasmine.SpyObj<DentistApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<DentistApiService>('DentistApiService', [
      'list',
      'create',
      'update',
      'remove'
    ]);

    TestBed.configureTestingModule({
      providers: [DentistController, { provide: DentistApiService, useValue: apiSpy }]
    });

    controller = TestBed.inject(DentistController);
  });

  it('loads the dentist list and maps DTOs to view models', () => {
    apiSpy.list.and.returnValue(of([DENTIST_DTO]));

    controller.load();

    expect(controller.isLoading()).toBeFalse();
    expect(controller.list()).toEqual([
      {
        id: 'd1',
        fullName: 'Dr. Perez',
        licenseNumber: '123',
        specialties: ['ortodoncia'],
        colorHex: '#000000',
        bio: '',
        workSchedule: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]);
  });

  it('sets an error message when load fails', () => {
    apiSpy.list.and.returnValue(throwError(() => new Error('boom')));

    controller.load();

    expect(controller.isLoading()).toBeFalse();
    expect(controller.errorMessage()).toBe('No se pudieron cargar los odontologos del backend.');
  });

  it('creates a dentist, parsing the comma separated specialties text', (done) => {
    apiSpy.create.and.returnValue(of(DENTIST_DTO));

    controller.create(FORM_DATA).subscribe(() => {
      expect(apiSpy.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ specialties: ['ortodoncia', 'general'] })
      );
      expect(controller.list().length).toBe(1);
      done();
    });
  });

  it('updates a dentist including is_active', (done) => {
    apiSpy.create.and.returnValue(of(DENTIST_DTO));
    apiSpy.update.and.returnValue(of({ ...DENTIST_DTO, is_active: false }));

    controller.create(FORM_DATA).subscribe(() => {
      controller.update('d1', { ...FORM_DATA, isActive: false }).subscribe(() => {
        expect(apiSpy.update).toHaveBeenCalledWith('d1', jasmine.objectContaining({ is_active: false }));
        expect(controller.list()[0].isActive).toBeFalse();
        done();
      });
    });
  });

  it('removes a dentist from the list', (done) => {
    apiSpy.create.and.returnValue(of(DENTIST_DTO));
    apiSpy.remove.and.returnValue(of(undefined));

    controller.create(FORM_DATA).subscribe(() => {
      controller.remove('d1').subscribe(() => {
        expect(controller.list()).toEqual([]);
        done();
      });
    });
  });
});
