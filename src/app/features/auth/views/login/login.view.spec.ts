import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthController } from '../../controllers/auth.controller';
import { LoginView } from './login.view';

describe('LoginView', () => {
  let fixture: ComponentFixture<LoginView>;
  let component: LoginView;
  let authSpy: jasmine.SpyObj<AuthController>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthController>('AuthController', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginView],
      providers: [provideRouter([]), { provide: AuthController, useValue: authSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginView);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('disables the submit button while the form is empty (required fields invalid)', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const submitButton: HTMLButtonElement = fixture.debugElement.query(
      By.css('.submit-button')
    ).nativeElement;

    expect(submitButton.disabled).toBeTrue();
  }));

  it('enables the submit button once username and password are filled', fakeAsync(() => {
    const usernameInput: HTMLInputElement = fixture.debugElement.query(
      By.css('input[name="username"]')
    ).nativeElement;
    const passwordInput: HTMLInputElement = fixture.debugElement.query(
      By.css('input[name="password"]')
    ).nativeElement;

    usernameInput.value = 'admin';
    usernameInput.dispatchEvent(new Event('input'));
    passwordInput.value = 'secret';
    passwordInput.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    const submitButton: HTMLButtonElement = fixture.debugElement.query(
      By.css('.submit-button')
    ).nativeElement;

    expect(submitButton.disabled).toBeFalse();
  }));

  it('shows a generic error message and stays on the page when login fails', () => {
    authSpy.login.and.returnValue(of(false));

    component.credentials = { username: 'admin', password: 'wrong', remember: false };
    component.submit();

    expect(component.errorMessage).toBe('Usuario o contrasena incorrectos. Verifique sus credenciales.');
    expect(component.isSubmitting).toBeFalse();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('navigates to the patients page when login succeeds', () => {
    authSpy.login.and.returnValue(of(true));

    component.credentials = { username: 'admin', password: 'secret', remember: false };
    component.submit();

    expect(component.errorMessage).toBe('');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/pacientes');
  });
});
