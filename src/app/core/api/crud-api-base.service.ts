import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from './api.config';

/**
 * Shared base for the feature API services that expose a conventional
 * REST CRUD surface (`GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`).
 *
 * Each concrete list endpoint has its own filter/query-param shape, so
 * `list()` is intentionally left for subclasses to implement.
 */
export abstract class CrudApiBaseService<TOutDto, TCreateDto, TUpdateDto> {
  protected constructor(
    protected readonly http: HttpClient,
    private readonly resourcePath: string
  ) {}

  protected get resourceUrl(): string {
    return `${API_BASE_URL}/${this.resourcePath}`;
  }

  get(id: string) {
    return this.http.get<TOutDto>(`${this.resourceUrl}/${id}`);
  }

  create(data: TCreateDto) {
    return this.http.post<TOutDto>(this.resourceUrl, data);
  }

  update(id: string, data: TUpdateDto) {
    return this.http.put<TOutDto>(`${this.resourceUrl}/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
