import { Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, tap } from 'rxjs';

import {
  AppointmentCreateDto,
  AppointmentOutDto,
  AppointmentStatusDto,
  AppointmentUpdateDto,
  PatientOutDto
} from '../../../core/api/api.types';
import { PatientApiService } from '../../patients/services/patient-api.service';
import { AppointmentApiService } from '../services/appointment-api.service';
import { Appointment, AppointmentFormData, AppointmentPatientOption } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentController {
  private readonly appointments = signal<Appointment[]>([]);
  private readonly patients = signal<AppointmentPatientOption[]>([]);

  readonly list = this.appointments.asReadonly();
  readonly patientOptions = this.patients.asReadonly();
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
      appointments: this.appointmentApiService.list({ limit: 200 })
    }).subscribe({
      next: ({ patients, appointments }) => {
        const patientNames = this.createPatientNameMap(patients);
        this.patients.set(
          patients.map((patient) => ({
            id: patient.id,
            name: `${patient.first_name} ${patient.last_name}`
          }))
        );
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
      dentist_name: data.dentist_name,
      starts_at: this.toApiDateTime(data.starts_at),
      duration_minutes: data.duration_minutes,
      reason: data.reason
    };
  }

  private toUpdateDto(data: AppointmentFormData): AppointmentUpdateDto {
    return {
      dentist_name: data.dentist_name,
      starts_at: this.toApiDateTime(data.starts_at),
      duration_minutes: data.duration_minutes,
      reason: data.reason
    };
  }

  private createPatientNameMap(patients: PatientOutDto[]): Map<string, string> {
    return new Map(patients.map((patient) => [patient.id, `${patient.first_name} ${patient.last_name}`]));
  }

  private currentPatientNames(): Map<string, string> {
    return new Map(this.patients().map((patient) => [patient.id, patient.name]));
  }

  private toApiDateTime(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }
}
