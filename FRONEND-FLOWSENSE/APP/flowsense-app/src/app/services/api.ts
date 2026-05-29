import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

// api.ts
export interface AuthResponse {
  userId?: string;
  email?: string;
  accessToken?: string;
  token?: string;
  expiresIn?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'https://nonlyrically-collocative-humberto.ngrok-free.dev/';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',  // ← ESSE HEADER É OBRIGATÓRIO
      'Content-Type': 'application/json'
    });
  }

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login`, loginData, {
      headers: this.getHeaders()
    });
  }

  signup(signupData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}users`, signupData, {
      headers: this.getHeaders()
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}logout`, {}, {
      headers: this.getHeaders()
    });
  }
}