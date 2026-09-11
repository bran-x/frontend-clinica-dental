import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import {
  AppointmentCreateDto,
  AppointmentOutDto,
  AppointmentStatusDto,
  AppointmentUpdateDto,
  DentistOutDto,
  PatientOutDto
} from '../../../core/api/api.types';
import { toNameMap } from '../../../shared/utils/name-map.util';
import { PatientApiService } from '../../patients/services/patient-api.service';
import { AppointmentApiService } from '../services/appointment-api.service';
import {
  Appointment,
  AppointmentDentistOption,
  AppointmentFormData,
  AppointmentPatientOption
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentController {
  private readonly http = inject(HttpClient);

  private readonly appointments = signal<Appointment[]>([]);
  private readonly patients = signal<AppointmentPatientOption[]>([]);
  private readonly dentists = signal<AppointmentDentistOption[]>([]);

  readonly list = this.appointments.asReadonly();
  readonly patientOptions = this.patients.asReadonly();
  readonly dentistOptions = this.dentists.asReadonly();
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(
    private readonly appointmentApiService: AppointmentApiService,
    private readonly patientApiService: PatientApiService
  ) {}

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      patients: this.patientApiService.list(undefined, 0, 200),
      dentists: this.http.get<DentistOutDto[]>(`${API_BASE_URL}/dentists`, { params: { limit: 200 } }),
      appointments: this.appointmentApiService.list({ limit: 200 })
    }).subscribe({
      next: ({ patients, dentists, appointments }) => {
        const patientNames = this.createPatientNameMap(patients);
        this.patients.set(
          patients.map((patient) => ({
            id: patient.id,
            name: `${patient.first_name} ${patient.last_name}`
          }))
        );
        this.dentists.set(dentists.map((dentist) => ({ id: dentist.id, name: dentist.full_name })));
        this.appointments.set(
          appointments.map((appointment) => this.toAppointment(appointment, patientNames))
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las citas del backend.');
        this.isLoading.set(false);
      }
    });
  }

  create(data: AppointmentFormData): Observable<AppointmentOutDto> {
    return this.appointmentApiService.create(this.toCreateDto(data)).pipe(
      tap((createdAppointment) => {
        this.appointments.update((appointments) => [
          this.toAppointment(createdAppointment, this.currentPatientNames()),
          ...appointments
        ]);
      })
    );
  }

  update(appointmentId: string, data: AppointmentFormData): Observable<AppointmentOutDto> {
    return this.appointmentApiService.update(appointmentId, this.toUpdateDto(data)).pipe(
      tap((updatedAppointment) =>
        this.appointments.update((appointments) =>
          appointments.map((appointment) =>
            appointment.id === appointmentId
              ? this.toAppointment(updatedAppointment, this.currentPatientNames())
              : appointment
          )
        )
      )
    );
  }

  reschedule(
    appointmentId: string,
    startsAt: string,
    durationMinutes: number
  ): Observable<AppointmentOutDto> {
    return this.appointmentApiService
      .update(appointmentId, {
        starts_at: this.toApiDateTime(startsAt),
        duration_minutes: durationMinutes
      })
      .pipe(
        tap((updatedAppointment) =>
          this.appointments.update((appointments) =>
            appointments.map((appointment) =>
              appointment.id === appointmentId
                ? this.toAppointment(updatedAppointment, this.currentPatientNames())
                : appointment
            )
          )
        )
      );
  }

  updateStatus(appointmentId: string, status: AppointmentStatusDto): Observable<AppointmentOutDto> {
    return this.appointmentApiService.updateStatus(appointmentId, { status }).pipe(
      tap((updatedAppointment) =>
        this.appointments.update((appointments) =>
          appointments.map((appointment) =>
            appointment.id === appointmentId
              ? this.toAppointment(updatedAppointment, this.currentPatientNames())
              : appointment
          )
        )
      )
    );
  }

  remove(appointmentId: string): Observable<void> {
    return this.appointmentApiService.remove(appointmentId).pipe(
      tap(() =>
        this.appointments.update((appointments) =>
          appointments.filter((appointment) => appointment.id !== appointmentId)
        )
      )
    );
  }

  private toAppointment(
    appointment: AppointmentOutDto,
    patientNames: Map<string, string>
  ): Appointment {
    const [date, rawTime = ''] = appointment.starts_at.split('T');
    const time = rawTime.slice(0, 5);

    return {
      id: appointment.id,
      patientId: appointment.patient_id,
      patientName: patientNames.get(appointment.patient_id) ?? appointment.patient_id,
      dentistId: appointment.dentist_id,
      dentistName: appointment.dentist_name,
      reason: appointment.reason,
      startsAt: appointment.starts_at,
      date,
      time,
      durationMinutes: appointment.duration_minutes,
      status: appointment.status
    };
  }

  private toCreateDto(data: AppointmentFormData): AppointmentCreateDto {
    return {
      patient_id: data.patient_id,
      dentist_id: data.dentist_id,
      starts_at: this.toApiDateTime(data.starts_at),
      duration_minutes: data.duration_minutes,
      reason: data.reason
    };
  }

  private toUpdateDto(data: AppointmentFormData): AppointmentUpdateDto {
    return {
      dentist_id: data.dentist_id,
      starts_at: this.toApiDateTime(data.starts_at),
      duration_minutes: data.duration_minutes,
      reason: data.reason
    };
  }

  private createPatientNameMap(patients: PatientOutDto[]): Map<string, string> {
    return toNameMap(
      patients,
      (patient) => patient.id,
      (patient) => `${patient.first_name} ${patient.last_name}`
    );
  }

  private currentPatientNames(): Map<string, string> {
    return toNameMap(
      this.patients(),
      (patient) => patient.id,
      (patient) => patient.name
    );
  }

  private toApiDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }
}
