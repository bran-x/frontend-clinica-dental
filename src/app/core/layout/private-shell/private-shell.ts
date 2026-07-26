import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthController } from '../../../features/auth/controllers/auth.controller';

@Component({
  selector: 'app-private-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './private-shell.html',
  styleUrl: './private-shell.scss'
})
export class PrivateShell {
  private readonly authController = inject(AuthController);
  private readonly router = inject(Router);

  readonly user = this.authController.user;

  logout(): void {
    this.authController.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
