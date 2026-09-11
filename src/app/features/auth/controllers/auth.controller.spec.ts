import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TOKEN_STORAGE_KEY } from '../../../core/interceptors/auth-token.interceptor';
import { AuthApiService } from '../services/auth-api.service';
import { LoginCredentials, RegisterData } from '../models/auth.models';
import { AuthController, AUTH_STORAGE_KEY } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let apiSpy: jasmine.SpyObj<AuthApiService>;

  const CREDENTIALS: LoginCredentials = { username: ' user@test.com ', password: 'secret', remember: false };

  beforeEach(() => {
    localStorage.clear();
    apiSpy = jasmine.createSpyObj<AuthApiService>('AuthApiService', ['login', 'register', 'me']);

    TestBed.configureTestingModule({
      providers: [AuthController, { provide: AuthApiService, useValue: apiSpy }]
    });

    controller = TestBed.inject(AuthController);
  });

  afterEach(() => localStorage.clear());

  it('is not authenticated when there is no stored user or token', () => {
    expect(controller.isAuthenticated()).toBeFalse();
  });

  it('logs in, stores the token/user and marks the session authenticated', (done) => {
    apiSpy.login.and.returnValue(of({ access_token: 'tok-123', token_type: 'bearer' }));
    apiSpy.me.and.returnValue(
      of({ id: 'u1', username: 'user@test.com', full_name: 'Test User', role: 'staff' })
    );

    controller.login(CREDENTIALS).subscribe((success) => {
      expect(success).toBeTrue();
      expect(apiSpy.login).toHaveBeenCalledWith('user@test.com', 'secret');
      expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('tok-123');
      expect(controller.user()).toEqual({
        id: 'u1',
        name: 'Test User',
        username: 'user@test.com',
        role: 'staff'
      });
      expect(controller.isAuthenticated()).toBeTrue();
      done();
    });
  });

  it('clears state and resolves false when login fails', (done) => {
    apiSpy.login.and.returnValue(throwError(() => new Error('invalid credentials')));

    controller.login(CREDENTIALS).subscribe((success) => {
      expect(success).toBeFalse();
      expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
      expect(controller.user()).toBeNull();
      expect(controller.isAuthenticated()).toBeFalse();
      done();
    });
  });

  it('registers a new user mapping the DTO to a domain user', (done) => {
    const data: RegisterData = { name: 'New Guy', email: 'New.Guy@Test.com', password: 'secret' };
    apiSpy.register.and.returnValue(
      of({ id: 'u2', username: 'new.guy@test.com', full_name: 'New Guy', role: 'staff' })
    );

    controller.register(data).subscribe((user) => {
      expect(apiSpy.register).toHaveBeenCalledWith({
        username: 'new.guy@test.com',
        password: 'secret',
        full_name: 'New Guy',
        role: 'staff'
      });
      expect(user).toEqual({ id: 'u2', name: 'New Guy', username: 'new.guy@test.com', role: 'staff' });
      done();
    });
  });

  it('logs out clearing stored user and token', (done) => {
    apiSpy.login.and.returnValue(of({ access_token: 'tok-123', token_type: 'bearer' }));
    apiSpy.me.and.returnValue(
      of({ id: 'u1', username: 'user@test.com', full_name: 'Test User', role: 'staff' })
    );

    controller.login(CREDENTIALS).subscribe(() => {
      controller.logout();

      expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
      expect(controller.user()).toBeNull();
      expect(controller.isAuthenticated()).toBeFalse();
      done();
    });
  });
});
