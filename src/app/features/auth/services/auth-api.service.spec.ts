import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/api/api.config';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('logs in with a form-urlencoded body', () => {
    service.login('user', 'pass').subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    expect(req.request.body).toBe('username=user&password=pass');
    req.flush({ access_token: 'tok', token_type: 'bearer' });
  });

  it('registers a user with a JSON body', () => {
    const data = { username: 'user', password: 'pass', full_name: 'User', role: 'staff' as const };
    service.register(data).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ id: '1', username: 'user', role: 'staff' });
  });

  it('fetches the current authenticated user', () => {
    service.me().subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: '1', username: 'user', role: 'staff' });
  });
});
