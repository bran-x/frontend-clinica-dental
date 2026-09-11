import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_BASE_URL } from '../../../core/api/api.config';
import { TokenResponse, UserCreateDto, UserOutDto } from '../../../core/api/api.types';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);


  login(username: string, password: string) {
    const body = new HttpParams().set('username', username).set('password', password);

    return this.http.post<TokenResponse>(`${API_BASE_URL}/auth/login`, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  register(data: UserCreateDto) {
    return this.http.post<UserOutDto>(`${API_BASE_URL}/auth/register`, data);
  }

  me() {
    return this.http.get<UserOutDto>(`${API_BASE_URL}/auth/me`);
  }
}
