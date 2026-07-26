import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthController } from '../../controllers/auth.controller';
import { LoginCredentials } from '../../models/auth.models';

@Component({
  selector: 'app-login-view',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.view.html',
  styleUrl: './login.view.scss'
})
export class LoginView {
  private readonly authController = inject(AuthController);
  private readonly router = inject(Router);

  credentials: LoginCredentials = {
    username: '',
    password: '',
    remember: false
  };
  showPassword = false;
  errorMessage = '';
  isSubmitting = false;

  submit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authController.login(this.credentials).subscribe((isLoggedIn) => {
      this.isSubmitting = false;

      if (!isLoggedIn) {
        this.errorMessage = 'Usuario o contrasena incorrectos. Verifique sus credenciales.';
        return;
      }

      this.router.navigateByUrl('/pacientes');
    });
  }
}
