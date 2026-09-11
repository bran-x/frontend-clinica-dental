import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { PatientOutDto } from '../../../../core/api/api.types';
import { PatientController } from '../../controllers/patient.controller';
import { PatientListView } from './patient-list.view';

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

describe('PatientListView', () => {
  let fixture: ComponentFixture<PatientListView>;
  let component: PatientListView;
  let controllerSpy: jasmine.SpyObj<PatientController>;

  beforeEach(async () => {
    controllerSpy = jasmine.createSpyObj<PatientController>(
      'PatientController',
      ['load', 'create', 'update', 'remove'],
      { list: signal([]).asReadonly(), isLoading: signal(false), errorMessage: signal('') }
    );
    controllerSpy.create.and.returnValue(of(PATIENT_DTO));

    await TestBed.configureTestingModule({
      imports: [PatientListView],
      providers: [{ provide: PatientController, useValue: controllerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads patients on init', () => {
    expect(controllerSpy.load).toHaveBeenCalled();
  });

  it('disables the create-form submit button until required fields are filled', fakeAsync(() => {
    component.openCreate();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const submitButton: HTMLButtonElement = fixture.debugElement.query(
      By.css('form.patient-form button[type="submit"]')
    ).nativeElement;

    expect(submitButton.disabled).toBeTrue();
  }));

  it('calls create with the current form data on save while in create mode', () => {
    component.openCreate();
    component.formData = {
      dni: '123',
      firstName: 'Ana',
      lastName: 'Gomez',
      birthDate: '1990-01-01',
      phone: '555',
      email: 'ana@example.com',
      observations: ''
    };

    component.savePatient();

    expect(controllerSpy.create).toHaveBeenCalledWith(component.formData);
  });

  it('calls update instead of create when in edit mode', () => {
    controllerSpy.update.and.returnValue(of(PATIENT_DTO));
    const patient = {
      id: 'p1',
      dni: '123',
      firstName: 'Ana',
      lastName: 'Gomez',
      birthDate: '1990-01-01',
      phone: '555',
      email: 'ana@example.com',
      observations: '',
      registeredAt: '2024-01-01T00:00:00Z'
    };

    component.openEdit(patient);
    component.savePatient();

    expect(controllerSpy.update).toHaveBeenCalledWith('p1', component.formData);
    expect(controllerSpy.create).not.toHaveBeenCalled();
  });

  it('calls remove and closes the modal when confirming delete', () => {
    controllerSpy.remove.and.returnValue(of(undefined));
    const patient = {
      id: 'p1',
      dni: '123',
      firstName: 'Ana',
      lastName: 'Gomez',
      birthDate: '1990-01-01',
      phone: '555',
      email: 'ana@example.com',
      observations: '',
      registeredAt: '2024-01-01T00:00:00Z'
    };

    component.openDelete(patient);
    component.deletePatient();

    expect(controllerSpy.remove).toHaveBeenCalledWith('p1');
    expect(component.modalMode()).toBeNull();
  });
});
