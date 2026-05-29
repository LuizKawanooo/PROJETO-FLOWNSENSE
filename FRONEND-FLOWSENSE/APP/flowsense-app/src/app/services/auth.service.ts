import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Api, AuthResponse } from './api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AuthResponse | null>;
  public currentUser: Observable<AuthResponse | null>;

  constructor(private api: Api) {
    const storedUser = localStorage.getItem('currentUser');

    this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(
      storedUser ? JSON.parse(storedUser) : null
    );

    this.currentUser = this.currentUserSubject.asObservable();
  }

  get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

get isAuthenticated(): boolean {

  const token =
    this.currentUserValue?.accessToken;

  if (!token) {

    return false;
  }

  try {

    const payload =
      this.decodeJWT(token);

    if (!payload?.exp) {

      return false;
    }

    /*
     * JWT expiration
     */
    const expiration =
      payload.exp * 1000;

    const valid =
      Date.now() < expiration;

    console.log(
      'TOKEN VÁLIDO:',
      valid
    );

    return valid;

  } catch (error) {

    console.error(
      'JWT inválido:',
      error
    );

    return false;
  }
}

  get authToken(): string | null {
    return this.currentUserValue?.accessToken ?? null;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserValue;
  }

  login(email: string, password: string): Observable<any> {
    return this.api.login({ email, password }).pipe(
      tap((response: any) => {
        console.log('RESPONSE LOGIN:', response);

        const decodedToken = this.decodeJWT(response.accessToken);

        console.log('JWT DECODED:', decodedToken);

        const normalizedResponse: AuthResponse = {
          userId:
            decodedToken?.['sub'] ||
            response?.['userId'] ||
            response?.['id'] ||
            '',

          email:
            decodedToken?.['email'] ||
            response?.['email'] ||
            email,

          username:
            decodedToken?.['username'] ||
            decodedToken?.['name'] ||
            response?.['username'] ||
            response?.['name'] ||
            '',

          accessToken: response?.['accessToken'],

          expiresIn: response?.['expiresIn']
        };

        console.log('USER SALVO:', normalizedResponse);

        localStorage.setItem(
          'currentUser',
          JSON.stringify(normalizedResponse)
        );

        this.currentUserSubject.next(normalizedResponse);
      })
    );
  }

  signup(data: any): Observable<any> {
    return this.api.signup(data).pipe(
      tap(() => {
        console.log('Signup successful');
      }),
      catchError((error) => {
        console.error('Signup error:', error);
        throw error;
      })
    );
  }

logout(): void {

  localStorage.clear();

  sessionStorage.clear();

  this.currentUserSubject.next(null);

  console.log(
    'Logout completo realizado'
  );
}

  private decodeJWT(token: string): any {
    try {
      if (!token) return null;

      const parts = token.split('.');

      if (parts.length !== 3) return null;

      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const decodedPayload = atob(payload);

      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erro ao decodificar JWT:', error);
      return null;
    }
  }
}