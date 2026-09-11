import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AUTH_STORAGE_KEY } from '../../features/auth/controllers/auth.controller';
import { TOKEN_STORAGE_KEY } from './auth-token.interceptor';

/**
 * Normalized shape components can rely on to show a differentiated,
 * user-friendly message per HTTP status code without needing to inspect the
 * raw HttpErrorResponse.
 */
export interface NormalizedHttpError {
  status: number;
  message: string;
  original: HttpErrorResponse;
}

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  403: 'Acceso denegado. No tiene permisos para realizar esta accion.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Conflicto: la operacion no pudo completarse porque entra en conflicto con datos existentes.',
  422: 'Los datos enviados no son validos. Revise los campos e intente nuevamente.',
  500: 'Ocurrio un error interno del servidor. Intente nuevamente mas tarde.'
};

const DEFAULT_MESSAGE = 'Ocurrio un error inesperado. Intente nuevamente.';

/**
 * Global HTTP error interceptor.
 *
 * - 401: clears the locally stored auth state and redirects to the login
 *   screen (the backend is the actual authority on token validity; this is
 *   just the client-side reaction to being rejected).
 * - 403 / 404 / 409 / 422 / 500: rethrown as a NormalizedHttpError carrying a
 *   differentiated, user-facing message so components/services can display
 *   something meaningful instead of a raw stack trace.
 * - any other status: rethrown with a generic fallback message.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        void router.navigateByUrl('/auth/login');
      }

      const normalized: NormalizedHttpError = {
        status: error.status,
        message: STATUS_MESSAGES[error.status] ?? DEFAULT_MESSAGE,
        original: error
      };

      return throwError(() => normalized);
    })
  );
};
