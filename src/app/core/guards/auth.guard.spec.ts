import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { AuthController } from '../../features/auth/controllers/auth.controller';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authControllerSpy: jasmine.SpyObj<AuthController>;
  let router: Router;

  beforeEach(() => {
    authControllerSpy = jasmine.createSpyObj<AuthController>('AuthController', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthController, useValue: authControllerSpy }]
    });

    router = TestBed.inject(Router);
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
  }

  it('allows navigation when the user is authenticated', () => {
    authControllerSpy.isAuthenticated.and.returnValue(true);

    expect(runGuard()).toBeTrue();
  });

  it('redirects to /auth/login when the user is not authenticated', () => {
    authControllerSpy.isAuthenticated.and.returnValue(false);

    const result = runGuard();

    expect(result).not.toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });
});
