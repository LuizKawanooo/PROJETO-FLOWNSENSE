import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://nonlyrically-collocative-humberto.ngrok-free.dev/';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const currentUserStr = localStorage.getItem('currentUser');
    
    let token = '';
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        token = currentUser.accessToken || '';
      } catch (e) {
        console.error('Erro ao ler token:', e);
      }
    }
    
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}users/${id}`, {
      headers: this.getHeaders()
    });
  }

  // CORRIGIDO: aceita email, username e name
  updateUser(id: string, data: { email: string; username?: string; name?: string }): Observable<any> {
    const body = {
      email: data.email,
      username: data.username || data.name || '',
      password: ''
    };
    
    return this.http.put(`${this.apiUrl}users/${id}`, body, {
      headers: this.getHeaders()
    });
  }
}