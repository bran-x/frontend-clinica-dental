import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AUTH_STORAGE_KEY } from '../../features/auth/controllers/auth.controller';
import { TOKEN_STORAGE_KEY } from './auth-token.interceptor';
import { errorInterceptor, NormalizedHttpError } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('clears auth storage and redirects to login on a 401 response', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'a-token');
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id: '1' }));

    let capturedError: NormalizedHttpError | undefined;
    httpClient.get('/api/secure').subscribe({
      error: (err) => (capturedError = err)
    });

    httpMock.expectOne('/api/secure').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(capturedError?.status).toBe(401);
  });

  it('normalizes a 403 response with an access-denied message', () => {
    let capturedError: NormalizedHttpError | undefined;
    httpClient.get('/api/resource').subscribe({ error: (err) => (capturedError = err) });

    httpMock.expectOne('/api/resource').flush('error', { status: 403, statusText: 'Forbidden' });

    expect(capturedError?.status).toBe(403);
    expect(capturedError?.message).toContain('Acceso denegado');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('normalizes a 404 response with a not-found message', () => {
    let capturedError: NormalizedHttpError | undefined;
    httpClient.get('/api/resource').subscribe({ error: (err) => (capturedError = err) });

    httpMock.expectOne('/api/resource').flush('error', { status: 404, statusText: 'Not Found' });

    expect(capturedError?.status).toBe(404);
    expect(capturedError?.message).toContain('no fue encontrado');
  });

  it('normalizes a 409 response with a conflict message', () => {
    let capturedError: NormalizedHttpError | undefined;
    httpClient.post('/api/appointments', {}).subscribe({ error: (err) => (capturedError = err) });

    httpMock.expectOne('/api/appointments').flush('error', { status: 409, statusText: 'Conflict' });

    expect(capturedError?.status).toBe(409);
    expect(capturedError?.message).toContain('Conflicto');
  });

  it('normalizes a 422 response with a validation message', () => {
    let capturedError: NormalizedHttpError | undefined;
    httpClient.post('/api/patients', {}).subscribe({ error: (err) => (capturedError = err) });

    httpMock.expectOne('/api/patients').flush('error', { status: 422, statusText: 'Unprocessable Entity' });

    expect(capturedError?.status).toBe(422);
    expect(capturedError?.message).toContain('no son validos');
  });

  it('normalizes a 500 response with a generic server-error message', () => {
    let capturedError: NormalizedHttpError | undefined;
    httpClient.get('/api/resource').subscribe({ error: (err) => (capturedError = err) });

    httpMock.expectOne('/api/resource').flush('error', { status: 500, statusText: 'Server Error' });

    expect(capturedError?.status).toBe(500);
    expect(capturedError?.message).toContain('error interno del servidor');
  });

  it('falls back to a generic message for unmapped status codes', () => {
    let capturedError: NormalizedHttpError | undefined;
    httpClient.get('/api/resource').subscribe({ error: (err) => (capturedError = err) });

    httpMock.expectOne('/api/resource').flush('error', { status: 418, statusText: 'Teapot' });

    expect(capturedError?.message).toBe('Ocurrio un error inesperado. Intente nuevamente.');
  });
});
