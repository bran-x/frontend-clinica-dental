import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TreatmentPlanController } from '../../controllers/treatment-plan.controller';
import {
  TreatmentPlan,
  TreatmentPlanFormData,
  TreatmentPlanFormItem,
  TreatmentPlanStatus
} from '../../models/treatment-plan.model';

const STATUS_OPTIONS: { value: TreatmentPlanStatus; label: string }[] = [
  { value: 'proposed', label: 'Propuesto' },
  { value: 'accepted', label: 'Aceptado' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' }
];

@Component({
  selector: 'app-treatment-plan-list-view',
  imports: [FormsModule],
  templateUrl: './treatment-plan-list.view.html',
  styleUrl: './treatment-plan-list.view.scss'
})
export class TreatmentPlanListView implements OnInit {
  private readonly treatmentPlanController = inject(TreatmentPlanController);

  readonly treatmentPlans = this.treatmentPlanController.list;
  readonly patientOptions = this.treatmentPlanController.patientOptions;
  readonly dentistOptions = this.treatmentPlanController.dentistOptions;
  readonly treatmentOptions = this.treatmentPlanController.treatmentOptions;
  readonly isLoading = this.treatmentPlanController.isLoading;
  readonly errorMessage = this.treatmentPlanController.errorMessage;
  readonly statusOptions = STATUS_OPTIONS;
  readonly query = signal('');
  readonly modalMode = signal<'create' | 'edit' | 'detail' | 'delete' | null>(null);
  readonly selectedTreatmentPlan = signal<TreatmentPlan | null>(null);

  formData: TreatmentPlanFormData = this.createEmptyForm();

  readonly filteredTreatmentPlans = computed(() => {
    const normalizedQuery = this.query().trim().toLowerCase();

    return this.treatmentPlans().filter((treatmentPlan) => {
      const matchesQuery =
        !normalizedQuery ||
        treatmentPlan.patientName.toLowerCase().includes(normalizedQuery) ||
        treatmentPlan.dentistName.toLowerCase().includes(normalizedQuery) ||
        treatmentPlan.title.toLowerCase().includes(normalizedQuery);

      return matchesQuery;
    });
  });

  ngOnInit(): void {
    this.treatmentPlanController.load();
  }

  formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const [date] = value.split('T');
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  formatShortId(id: string): string {
    return id.slice(-4).toUpperCase();
  }

  formatCurrency(value: number): string {
    return `S/ ${value.toFixed(2)}`;
  }

  getStatusLabel(status: TreatmentPlanStatus): string {
    return this.statusOptions.find((option) => option.value === status)?.label ?? status;
  }

  openCreate(): void {
    this.formData = this.createEmptyForm();
    this.formData.patient_id = this.patientOptions()[0]?.id ?? '';
    this.formData.dentist_id = this.dentistOptions()[0]?.id ?? '';
    this.selectedTreatmentPlan.set(null);
    this.modalMode.set('create');
  }

  openDetail(treatmentPlan: TreatmentPlan): void {
    this.selectedTreatmentPlan.set(treatmentPlan);
    this.modalMode.set('detail');
  }

  openEdit(treatmentPlan: TreatmentPlan): void {
    this.selectedTreatmentPlan.set(treatmentPlan);
    this.formData = this.toFormData(treatmentPlan);
    this.modalMode.set('edit');
  }

  openDelete(treatmentPlan: TreatmentPlan): void {
    this.selectedTreatmentPlan.set(treatmentPlan);
    this.modalMode.set('delete');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedTreatmentPlan.set(null);
  }

  addItemRow(): void {
    const firstTreatment = this.treatmentOptions()[0];

    this.formData.items.push({
      treatment_id: firstTreatment?.id ?? '',
      tooth_fdi: '',
      quantity: 1,
      unit_price: firstTreatment?.defaultPrice ?? 0,
      status: 'pending'
    });
  }

  removeItemRow(index: number): void {
    this.formData.items.splice(index, 1);
  }

  onItemTreatmentChange(item: TreatmentPlanFormItem): void {
    const treatment = this.treatmentOptions().find((option) => option.id === item.treatment_id);

    if (treatment) {
      item.unit_price = treatment.defaultPrice;
    }
  }

  getItemLineTotal(item: TreatmentPlanFormItem): number {
    return (item.quantity || 0) * (item.unit_price || 0);
  }

  getFormRunningTotal(): number {
    return this.formData.items.reduce((total, item) => total + this.getItemLineTotal(item), 0);
  }

  saveTreatmentPlan(): void {
    const selectedTreatmentPlan = this.selectedTreatmentPlan();

    if (this.modalMode() === 'edit' && selectedTreatmentPlan) {
      this.treatmentPlanController
        .update(selectedTreatmentPlan.id, this.formData)
        .subscribe(() => this.closeModal());
      return;
    }

    this.treatmentPlanController.create(this.formData).subscribe(() => this.closeModal());
  }

  deleteTreatmentPlan(): void {
    const treatmentPlan = this.selectedTreatmentPlan();

    if (!treatmentPlan) {
      return;
    }

    this.treatmentPlanController.remove(treatmentPlan.id).subscribe(() => this.closeModal());
  }

  private createEmptyForm(): TreatmentPlanFormData {
    return {
      patient_id: '',
      dentist_id: '',
      title: '',
      status: 'proposed',
      items: []
    };
  }

  private toFormData(treatmentPlan: TreatmentPlan): TreatmentPlanFormData {
    return {
      patient_id: treatmentPlan.patientId,
      dentist_id: treatmentPlan.dentistId,
      title: treatmentPlan.title,
      status: treatmentPlan.status,
      items: treatmentPlan.items.map((item) => ({
        treatment_id: item.treatmentId,
        tooth_fdi: item.toothFdi,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        status: item.status
      }))
    };
  }
}
