import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-test-login',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-content class="ion-padding">
      <div class="test-container">
        <h1>🧪 Teste de Login</h1>
        
        <ion-card>
          <ion-card-header>
            <ion-card-title>Credenciais de Teste</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input [(ngModel)]="testEmail" type="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Senha</ion-label>
              <ion-input [(ngModel)]="testPassword" type="password"></ion-input>
            </ion-item>
            
            <ion-button expand="block" (click)="testLogin()" class="ion-margin-top">
              🔐 Testar Login
            </ion-button>

            <div *ngIf="testResult" [ngClass]="testResult.class" class="result">
              <strong>{{ testResult.title }}</strong>
              <p>{{ testResult.message }}</p>
              <small *ngIf="testResult.details">{{ testResult.details }}</small>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Usuários Pré-Configurados</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button expand="block" (click)="setCredentials('luizzzz@gmail.com', '123456')" color="primary">
              📧 luizzzz@gmail.com / 123456
            </ion-button>
            <ion-button expand="block" (click)="setCredentials('teste@email.com', '123456')" color="secondary">
              📧 teste@email.com / 123456
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Informações</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>
              <strong>Backend URL:</strong><br>
              {{ apiUrl }}
            </p>
            <p>
              <strong>Status Esperado:</strong><br>
              ✅ 200 OK = Login bem-sucedido<br>
              ❌ 401 = Usuário não existe ou senha errada<br>
              ❌ 404 = Endpoint não existe
            </p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .test-container {
      max-width: 600px;
      margin: 20px auto;
    }

    h1 {
      text-align: center;
      margin-bottom: 20px;
      color: #3880ff;
    }

    .result {
      margin-top: 15px;
      padding: 15px;
      border-radius: 4px;
      animation: slideIn 0.3s ease-in;
    }

    .result-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .result-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .result strong {
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
    }

    .result p {
      margin: 5px 0;
    }

    .result small {
      display: block;
      margin-top: 8px;
      opacity: 0.8;
      font-style: italic;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TestLoginComponent {
  testEmail = 'luizzzz@gmail.com';
  testPassword = '123456';
  testResult: any = null;
  apiUrl = 'https://nonlyrically-collocative-humberto.ngrok-free.dev/';

  constructor(private http: HttpClient) {}

  setCredentials(email: string, password: string): void {
    this.testEmail = email;
    this.testPassword = password;
  }

  testLogin(): void {
    if (!this.testEmail || !this.testPassword) {
      this.testResult = {
        title: '⚠️ Campos Obrigatórios',
        message: 'Preencha email e senha',
        class: 'result result-error'
      };
      return;
    }

    this.testResult = {
      title: '⏳ Testando...',
      message: 'Enviando credenciais para o servidor...',
      class: 'result result-info'
    };

    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json'
    });

    this.http.post(
      `${this.apiUrl}login`,
      { email: this.testEmail, password: this.testPassword },
      { headers }
    ).subscribe({
      next: (response: any) => {
        console.log('✅ Login bem-sucedido:', response);
        this.testResult = {
          title: '✅ LOGIN BEM-SUCEDIDO',
          message: `Usuário ${this.testEmail} autenticado com sucesso!`,
          details: `Token: ${response.accessToken?.substring(0, 30)}...`,
          class: 'result result-success'
        };
      },
      error: (error) => {
        console.log('❌ Erro de login:', error);
        let message = '';
        let details = '';

        if (error.status === 401) {
          message = 'Credenciais inválidas';
          details = 'Verifique se o usuário existe no banco com a senha correta';
        } else if (error.status === 404) {
          message = 'Endpoint não encontrado';
          details = 'O endpoint /login não existe no servidor';
        } else if (error.status === 0) {
          message = 'Erro de conexão';
          details = 'Servidor offline ou URL incorreta';
        } else {
          message = `Erro ${error.status}`;
          details = error.statusText || 'Erro desconhecido';
        }

        this.testResult = {
          title: '❌ LOGIN FALHOU',
          message,
          details,
          class: 'result result-error'
        };
      }
    });
  }
}
