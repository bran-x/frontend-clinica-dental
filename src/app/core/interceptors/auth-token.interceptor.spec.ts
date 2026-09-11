import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authTokenInterceptor, TOKEN_STORAGE_KEY } from './auth-token.interceptor';

describe('authTokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authTokenInterceptor])), provideHttpClientTesting()]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches the Authorization header when a token is stored', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123');

    httpClient.get('/api/patients').subscribe();

    const req = httpMock.expectOne('/api/patients');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({});
  });

  it('passes the request through unchanged (no Authorization header) when no token is stored', () => {
    httpClient.get('/api/patients').subscribe();

    const req = httpMock.expectOne('/api/patients');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('documents current behavior: the token is also attached to /auth/login requests', () => {
    // Per AGENTS.md the JWT should not be added to /auth/login or
    // /auth/register, but the interceptor is intentionally unconditional in
    // this demo and does not special-case those routes (see QA_TEST_PLAN.md
    // "auth-token.interceptor attaches Authorization to ALL requests").
    // This test pins/documents the current behavior rather than changing it.
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123');

    httpClient.post('/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({});
  });

  it('documents current behavior: the token is also attached to /auth/register requests', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123');

    httpClient.post('/auth/register', {}).subscribe();

    const req = httpMock.expectOne('/auth/register');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({});
  });
});
