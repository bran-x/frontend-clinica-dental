import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_STORAGE_KEY = 'muelas_dent_access_token';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};

export { TOKEN_STORAGE_KEY };
