import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginResponse, CreateUserDto, UserResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Método de Login
  login(dados: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, dados).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('userId', res.userId);
      })
    );
  }


  register(dados: CreateUserDto): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API}/users`, dados);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.clear();
  }
}
