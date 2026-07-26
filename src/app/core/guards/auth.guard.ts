import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

import { AuthController } from '../../features/auth/controllers/auth.controller';

export const authGuard: CanActivateChildFn = () => {
  const authController = inject(AuthController);
  const router = inject(Router);

  return authController.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};
