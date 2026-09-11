import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { throwError, of } from 'rxjs';

import { NormalizedHttpError } from '../../../../core/interceptors/error.interceptor';
import { AppointmentOutDto } from '../../../../core/api/api.types';
import { AppointmentController } from '../../controllers/appointment.controller';
import { AppointmentListView } from './appointment-list.view';

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

describe('AppointmentListView', () => {
  let fixture: ComponentFixture<AppointmentListView>;
  let component: AppointmentListView;
  let controllerSpy: jasmine.SpyObj<AppointmentController>;

  beforeEach(async () => {
    controllerSpy = jasmine.createSpyObj<AppointmentController>(
      'AppointmentController',
      ['load', 'create', 'update', 'reschedule', 'updateStatus', 'remove'],
      {
        list: signal([]).asReadonly(),
        patientOptions: signal([{ id: 'p1', name: 'Ana Gomez' }]).asReadonly(),
        dentistOptions: signal([{ id: 'd1', name: 'Dr. Perez' }]).asReadonly(),
        isLoading: signal(false),
        errorMessage: signal('')
      }
    );

    await TestBed.configureTestingModule({
      imports: [AppointmentListView],
      providers: [{ provide: AppointmentController, useValue: controllerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentListView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads appointments on init', () => {
    expect(controllerSpy.load).toHaveBeenCalled();
  });

  it('surfaces a 409 double-booking conflict as a friendly form error and keeps the modal open', () => {
    const conflict: NormalizedHttpError = {
      status: 409,
      message: 'Conflicto: la operacion no pudo completarse porque entra en conflicto con datos existentes.',
      original: {} as never
    };
    controllerSpy.create.and.returnValue(throwError(() => conflict));

    component.openCreate();
    component.formData = {
      patient_id: 'p1',
      dentist_id: 'd1',
      starts_at: '2024-01-01T10:00',
      duration_minutes: 30,
      reason: 'Consulta'
    };

    component.saveAppointment();
    fixture.detectChanges();

    expect(component.formError()).toBe(
      'Ya existe una cita para ese odontologo en el horario seleccionado. Elija otro horario.'
    );
    expect(component.modalMode()).toBe('create');

    const errorText = fixture.debugElement.query(By.css('.form-error'));
    expect(errorText.nativeElement.textContent).toContain('Ya existe una cita');
  });

  it('closes the modal and clears the error after a successful save', () => {
    controllerSpy.create.and.returnValue(of(APPOINTMENT));

    component.openCreate();
    component.formData = {
      patient_id: 'p1',
      dentist_id: 'd1',
      starts_at: '2024-01-01T10:00',
      duration_minutes: 30,
      reason: 'Consulta'
    };

    component.saveAppointment();

    expect(component.formError()).toBe('');
    expect(component.modalMode()).toBeNull();
  });
});
