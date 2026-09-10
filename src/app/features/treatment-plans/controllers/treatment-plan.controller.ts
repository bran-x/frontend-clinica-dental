import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import {
  DentistOutDto,
  PatientOutDto,
  TreatmentOutDto,
  TreatmentPlanCreateDto,
  TreatmentPlanOutDto,
  TreatmentPlanStatusDto,
  TreatmentPlanUpdateDto
} from '../../../core/api/api.types';
import { PatientApiService } from '../../patients/services/patient-api.service';
import { TreatmentPlanApiService } from '../services/treatment-plan-api.service';
import {
  TreatmentPlan,
  TreatmentPlanDentistOption,
  TreatmentPlanFormData,
  TreatmentPlanPatientOption,
  TreatmentPlanTreatmentOption
} from '../models/treatment-plan.model';

@Injectable({ providedIn: 'root' })
export class TreatmentPlanController {
  private readonly http = inject(HttpClient);

  private readonly treatmentPlans = signal<TreatmentPlan[]>([]);
  private readonly patients = signal<TreatmentPlanPatientOption[]>([]);
  private readonly dentists = signal<TreatmentPlanDentistOption[]>([]);
  private readonly treatments = signal<TreatmentPlanTreatmentOption[]>([]);

  readonly list = this.treatmentPlans.asReadonly();
  readonly patientOptions = this.patients.asReadonly();
  readonly dentistOptions = this.dentists.asReadonly();
  readonly treatmentOptions = this.treatments.asReadonly();
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(
    private readonly treatmentPlanApiService: TreatmentPlanApiService,
    private readonly patientApiService: PatientApiService
  ) {}

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      patients: this.patientApiService.list(undefined, 0, 200),
      dentists: this.http.get<DentistOutDto[]>(`${API_BASE_URL}/dentists`, { params: { limit: 200 } }),
      treatments: this.http.get<TreatmentOutDto[]>(`${API_BASE_URL}/treatments`, { params: { limit: 200 } }),
      treatmentPlans: this.treatmentPlanApiService.list()
    }).subscribe({
      next: ({ patients, dentists, treatments, treatmentPlans }) => {
        const patientNames = this.createPatientNameMap(patients);
        const dentistNames = this.createDentistNameMap(dentists);
        const treatmentNames = this.createTreatmentNameMap(treatments);

        this.patients.set(
          patients.map((patient) => ({
            id: patient.id,
            name: `${patient.first_name} ${patient.last_name}`
          }))
        );
        this.dentists.set(dentists.map((dentist) => ({ id: dentist.id, name: dentist.full_name })));
        this.treatments.set(
          treatments.map((treatment) => ({
            id: treatment.id,
            name: treatment.name,
            defaultPrice: treatment.default_price
          }))
        );
        this.treatmentPlans.set(
          treatmentPlans.map((treatmentPlan) =>
            this.toTreatmentPlan(treatmentPlan, patientNames, dentistNames, treatmentNames)
          )
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los planes de tratamiento del backend.');
        this.isLoading.set(false);
      }
    });
  }

  create(data: TreatmentPlanFormData): Observable<TreatmentPlanOutDto> {
    return this.treatmentPlanApiService.create(this.toCreateDto(data)).pipe(
      tap((created) =>
        this.treatmentPlans.update((plans) => [
          this.toTreatmentPlan(
            created,
            this.currentPatientNames(),
            this.currentDentistNames(),
            this.currentTreatmentNames()
          ),
          ...plans
        ])
      )
    );
  }

  update(treatmentPlanId: string, data: TreatmentPlanFormData): Observable<TreatmentPlanOutDto> {
    return this.treatmentPlanApiService.update(treatmentPlanId, this.toUpdateDto(data)).pipe(
      tap((updated) =>
        this.treatmentPlans.update((plans) =>
          plans.map((plan) =>
            plan.id === treatmentPlanId
              ? this.toTreatmentPlan(
                  updated,
                  this.currentPatientNames(),
                  this.currentDentistNames(),
                  this.currentTreatmentNames()
                )
              : plan
          )
        )
      )
    );
  }

  updateStatus(treatmentPlanId: string, status: TreatmentPlanStatusDto): Observable<TreatmentPlanOutDto> {
    return this.treatmentPlanApiService.update(treatmentPlanId, { status }).pipe(
      tap((updated) =>
        this.treatmentPlans.update((plans) =>
          plans.map((plan) =>
            plan.id === treatmentPlanId
              ? this.toTreatmentPlan(
                  updated,
                  this.currentPatientNames(),
                  this.currentDentistNames(),
                  this.currentTreatmentNames()
                )
              : plan
          )
        )
      )
    );
  }

  remove(treatmentPlanId: string): Observable<void> {
    return this.treatmentPlanApiService.remove(treatmentPlanId).pipe(
      tap(() =>
        this.treatmentPlans.update((plans) => plans.filter((plan) => plan.id !== treatmentPlanId))
      )
    );
  }

  private toTreatmentPlan(
    treatmentPlan: TreatmentPlanOutDto,
    patientNames: Map<string, string>,
    dentistNames: Map<string, string>,
    treatmentNames: Map<string, string>
  ): TreatmentPlan {
    return {
      id: treatmentPlan.id,
      patientId: treatmentPlan.patient_id,
      patientName: patientNames.get(treatmentPlan.patient_id) ?? treatmentPlan.patient_id,
      dentistId: treatmentPlan.dentist_id,
      dentistName: dentistNames.get(treatmentPlan.dentist_id) ?? treatmentPlan.dentist_id,
      title: treatmentPlan.title,
      items: treatmentPlan.items.map((item) => ({
        treatmentId: item.treatment_id,
        treatmentName: treatmentNames.get(item.treatment_id) ?? item.treatment_id,
        toothFdi: item.tooth_fdi ?? '',
        quantity: item.quantity ?? 1,
        unitPrice: item.unit_price,
        status: item.status ?? 'pending'
      })),
      status: treatmentPlan.status,
      totalEstimated: treatmentPlan.total_estimated,
      createdAt: treatmentPlan.created_at
    };
  }

  private toCreateDto(data: TreatmentPlanFormData): TreatmentPlanCreateDto {
    return {
      patient_id: data.patient_id,
      dentist_id: data.dentist_id,
      title: data.title,
      items: data.items.map((item) => ({
        treatment_id: item.treatment_id,
        tooth_fdi: item.tooth_fdi || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        status: item.status
      }))
    };
  }

  private toUpdateDto(data: TreatmentPlanFormData): TreatmentPlanUpdateDto {
    return {
      title: data.title,
      status: data.status,
      items: data.items.map((item) => ({
        treatment_id: item.treatment_id,
        tooth_fdi: item.tooth_fdi || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        status: item.status
      }))
    };
  }

  private createPatientNameMap(patients: PatientOutDto[]): Map<string, string> {
    return new Map(patients.map((patient) => [patient.id, `${patient.first_name} ${patient.last_name}`]));
  }

  private createDentistNameMap(dentists: DentistOutDto[]): Map<string, string> {
    return new Map(dentists.map((dentist) => [dentist.id, dentist.full_name]));
  }

  private createTreatmentNameMap(treatments: TreatmentOutDto[]): Map<string, string> {
    return new Map(treatments.map((treatment) => [treatment.id, treatment.name]));
  }

  private currentPatientNames(): Map<string, string> {
    return new Map(this.patients().map((patient) => [patient.id, patient.name]));
  }

  private currentDentistNames(): Map<string, string> {
    return new Map(this.dentists().map((dentist) => [dentist.id, dentist.name]));
  }

  private currentTreatmentNames(): Map<string, string> {
    return new Map(this.treatments().map((treatment) => [treatment.id, treatment.name]));
  }
}
