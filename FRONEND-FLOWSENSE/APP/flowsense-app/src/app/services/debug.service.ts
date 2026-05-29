import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private apiUrl = 'https://nonlyrically-collocative-humberto.ngrok-free.dev/';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json'
    });
  }

  /**
   * Testa se o backend está online
   */
  testBackendConnection(): Observable<any> {
    console.log('🧪 Testando conexão com backend...');
    return this.http.get(`${this.apiUrl}health`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Testa o endpoint de login
   */
  testLogin(email: string, password: string): Observable<any> {
    console.log('🧪 Testando login...');
    return this.http.post(`${this.apiUrl}login`, 
      { email, password }, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Log detalhado de erro HTTP
   */
  logDetailedError(error: any): void {
    console.group('🔴 ERRO HTTP DETALHADO');
    console.log('Status:', error.status);
    console.log('StatusText:', error.statusText);
    console.log('URL:', error.url);
    console.log('Headers:', error.headers);
    console.log('Body:', error.error);
    console.log('Message:', error.message);
    console.groupEnd();
  }

  /**
   * Log detalhado de resposta bem-sucedida
   */
  logDetailedSuccess(response: any): void {
    console.group('✅ RESPOSTA BEM-SUCEDIDA');
    console.log('Status: 200 OK');
    console.log('Data:', response);
    console.log('Keys:', Object.keys(response));
    console.groupEnd();
  }
}
