import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TreatmentController } from '../../controllers/treatment.controller';
import { Treatment, TreatmentFormData } from '../../models/treatment.model';

@Component({
  selector: 'app-treatment-list-view',
  imports: [FormsModule],
  templateUrl: './treatment-list.view.html',
  styleUrl: './treatment-list.view.scss'
})
export class TreatmentListView implements OnInit {
  private readonly treatmentController = inject(TreatmentController);

  readonly treatments = this.treatmentController.list;
  readonly isLoading = this.treatmentController.isLoading;
  readonly errorMessage = this.treatmentController.errorMessage;
  readonly query = signal('');
  readonly modalMode = signal<'create' | 'edit' | 'delete' | null>(null);
  readonly selectedTreatment = signal<Treatment | null>(null);

  formData: TreatmentFormData = this.createEmptyForm();

  readonly filteredTreatments = computed(() => {
    const normalizedQuery = this.query().trim().toLowerCase();

    return this.treatments().filter((treatment) => {
      const matchesQuery =
        !normalizedQuery ||
        treatment.name.toLowerCase().includes(normalizedQuery) ||
        treatment.code.toLowerCase().includes(normalizedQuery) ||
        treatment.category.toLowerCase().includes(normalizedQuery);

      return matchesQuery;
    });
  });

  ngOnInit(): void {
    this.treatmentController.load();
  }

  openCreate(): void {
    this.formData = this.createEmptyForm();
    this.selectedTreatment.set(null);
    this.modalMode.set('create');
  }

  openEdit(treatment: Treatment): void {
    this.selectedTreatment.set(treatment);
    this.formData = this.toFormData(treatment);
    this.modalMode.set('edit');
  }

  openDelete(treatment: Treatment): void {
    this.selectedTreatment.set(treatment);
    this.modalMode.set('delete');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedTreatment.set(null);
  }

  saveTreatment(): void {
    const selectedTreatment = this.selectedTreatment();

    if (this.modalMode() === 'edit' && selectedTreatment) {
      this.treatmentController
        .update(selectedTreatment.id, this.formData)
        .subscribe(() => this.closeModal());
      return;
    }

    this.treatmentController.create(this.formData).subscribe(() => this.closeModal());
  }

  deleteTreatment(): void {
    const treatment = this.selectedTreatment();

    if (!treatment) {
      return;
    }

    this.treatmentController.remove(treatment.id).subscribe(() => this.closeModal());
  }

  formatShortId(id: string): string {
    return id.slice(-4).toUpperCase();
  }

  formatPrice(value: number): string {
    return `S/ ${value.toFixed(2)}`;
  }

  private createEmptyForm(): TreatmentFormData {
    return {
      category: '',
      code: '',
      name: '',
      description: '',
      defaultPrice: 0,
      defaultDurationMinutes: 30,
      isActive: true
    };
  }

  private toFormData(treatment: Treatment): TreatmentFormData {
    return {
      category: treatment.category,
      code: treatment.code,
      name: treatment.name,
      description: treatment.description,
      defaultPrice: treatment.defaultPrice,
      defaultDurationMinutes: treatment.defaultDurationMinutes,
      isActive: treatment.isActive
    };
  }
}
