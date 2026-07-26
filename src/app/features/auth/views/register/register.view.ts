import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthController } from '../../controllers/auth.controller';
import { RegisterData } from '../../models/auth.models';

@Component({
  selector: 'app-register-view',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.view.html',
  styleUrl: './register.view.scss'
})
export class RegisterView {
  private readonly authController = inject(AuthController);
  private readonly router = inject(Router);

  data: RegisterData = {
    name: '',
    email: '',
    password: ''
  };
  isSubmitting = false;

  submit(): void {
    this.isSubmitting = true;

    this.authController.register(this.data).subscribe(() => {
      this.isSubmitting = false;
      this.router.navigateByUrl('/auth/login');
    });
  }
}
