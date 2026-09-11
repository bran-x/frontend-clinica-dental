import { signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

/**
 * Shared signal-based state + CRUD orchestration for the "simple" feature
 * controllers (patients, dentists, treatments) that only manage a single
 * flat list loaded via an optional text query.
 *
 * Subclasses only need to provide the API calls and the DTO <-> view-model
 * mapping; `load`/`create`/`update`/`remove` and the `list`/`isLoading`/
 * `errorMessage` signals are implemented once here.
 */
export abstract class SimpleCrudController<
  TModel,
  TOutDto,
  TFormData,
  TCreateDto = TFormData,
  TUpdateDto = TCreateDto
> {
  private readonly items = signal<TModel[]>([]);

  readonly list = this.items.asReadonly();
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  protected abstract readonly loadErrorMessage: string;

  protected abstract apiList(q?: string): Observable<TOutDto[]>;
  protected abstract apiCreate(data: TCreateDto): Observable<TOutDto>;
  protected abstract apiUpdate(id: string, data: TUpdateDto): Observable<TOutDto>;
  protected abstract apiRemove(id: string): Observable<void>;

  protected abstract toModel(dto: TOutDto): TModel;
  protected abstract toCreateDto(data: TFormData): TCreateDto;
  protected abstract toUpdateDto(data: TFormData): TUpdateDto;
  protected abstract getId(model: TModel): string;

  load(q?: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.apiList(q).subscribe({
      next: (dtos) => {
        this.items.set(dtos.map((dto) => this.toModel(dto)));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(this.loadErrorMessage);
        this.isLoading.set(false);
      }
    });
  }

  create(data: TFormData): Observable<TOutDto> {
    return this.apiCreate(this.toCreateDto(data)).pipe(
      tap((created) => this.items.update((items) => [this.toModel(created), ...items]))
    );
  }

  update(id: string, data: TFormData): Observable<TOutDto> {
    return this.apiUpdate(id, this.toUpdateDto(data)).pipe(
      tap((updated) =>
        this.items.update((items) =>
          items.map((item) => (this.getId(item) === id ? this.toModel(updated) : item))
        )
      )
    );
  }

  remove(id: string): Observable<void> {
    return this.apiRemove(id).pipe(
      tap(() => this.items.update((items) => items.filter((item) => this.getId(item) !== id)))
    );
  }
}
