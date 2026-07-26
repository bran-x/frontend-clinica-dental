import { Injectable, signal } from '@angular/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { TOKEN_STORAGE_KEY } from '../../../core/interceptors/auth-token.interceptor';
import { AuthApiService } from '../services/auth-api.service';
import { AuthUser, LoginCredentials, RegisterData } from '../models/auth.models';

const AUTH_STORAGE_KEY = 'muelas_dent_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthController {
  private readonly currentUser = signal<AuthUser | null>(this.readStoredUser());

  readonly user = this.currentUser.asReadonly();

  constructor(private readonly authApiService: AuthApiService) {}

  isAuthenticated(): boolean {
    return this.currentUser() !== null && localStorage.getItem(TOKEN_STORAGE_KEY) !== null;
  }

  login(credentials: LoginCredentials) {
    return this.authApiService.login(credentials.username.trim(), credentials.password).pipe(
      tap((token) => localStorage.setItem(TOKEN_STORAGE_KEY, token.access_token)),
      switchMap(() => this.authApiService.me()),
      tap((user) =>
        this.setUser({
          id: user.id,
          name: user.full_name ?? user.username,
          username: user.username,
          role: user.role
        })
      ),
      map(() => true),
      catchError(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        this.currentUser.set(null);
        return of(false);
      })
    );
  }

  register(data: RegisterData) {
    return this.authApiService
      .register({
        username: data.email.trim().toLowerCase(),
        password: data.password,
        full_name: data.name.trim(),
        role: 'staff'
      })
      .pipe(
        map((user) => ({
          id: user.id,
          name: user.full_name ?? user.username,
          username: user.username,
          role: user.role
        }))
      );
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.currentUser.set(null);
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private readStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}
