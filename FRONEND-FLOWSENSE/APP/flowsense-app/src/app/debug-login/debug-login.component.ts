import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DebugService } from '../services/debug.service';

@Component({
  selector: 'app-debug-login',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-content class="ion-padding">
      <div class="debug-container">
        <h1>🧪 Debug - Teste de Login</h1>
        
        <ion-card>
          <ion-card-header>
            <ion-card-title>1. Testar Conexão Backend</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button expand="block" (click)="testConnection()">
              Testar /health
            </ion-button>
            <div *ngIf="connectionStatus" [ngClass]="connectionStatus.class">
              {{ connectionStatus.message }}
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>2. Testar Login</ion-card-title>
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
            <ion-button expand="block" (click)="testLoginEndpoint()" class="ion-margin-top">
              Testar Login
            </ion-button>
            <div *ngIf="loginStatus" [ngClass]="loginStatus.class">
              {{ loginStatus.message }}
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>3. Logs do Console</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p class="info">
              ℹ️ Abra o console do navegador (F12 → Console) para ver logs detalhados
            </p>
            <ion-button expand="block" (click)="clearLogs()">
              Limpar Logs
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>4. Checklist</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ul>
              <li>✅ Backend está online: {{ backendOnline ? 'SIM' : 'NÃO' }}</li>
              <li>✅ Endpoint /login existe: {{ loginEndpointExists ? 'SIM' : 'NÃO' }}</li>
              <li>✅ Credenciais válidas: {{ credentialsValid ? 'SIM' : 'NÃO' }}</li>
            </ul>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .debug-container {
      max-width: 600px;
      margin: 20px auto;
    }

    h1 {
      text-align: center;
      margin-bottom: 20px;
    }

    .status-message {
      margin-top: 15px;
      padding: 10px;
      border-radius: 4px;
      font-weight: bold;
    }

    .status-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .info {
      background-color: #e7f3ff;
      padding: 10px;
      border-left: 4px solid #2196F3;
      margin: 10px 0;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class DebugLoginComponent implements OnInit {
  testEmail = 'teste@email.com';
  testPassword = '123456';
  
  connectionStatus: any = null;
  loginStatus: any = null;
  
  backendOnline = false;
  loginEndpointExists = false;
  credentialsValid = false;

  constructor(private debugService: DebugService) {}

  ngOnInit() {
    console.clear();
    console.log('%c🧪 DEBUG MODE ATIVADO', 'color: blue; font-size: 16px; font-weight: bold');
    console.log('Abra este console para ver logs detalhados');
  }

  testConnection(): void {
    this.connectionStatus = { message: 'Testando...', class: 'status-message status-info' };
    
    this.debugService.testBackendConnection().subscribe({
      next: (response) => {
        this.backendOnline = true;
        this.connectionStatus = {
          message: '✅ Backend está ONLINE',
          class: 'status-message status-success'
        };
        this.debugService.logDetailedSuccess(response);
      },
      error: (error) => {
        this.backendOnline = false;
        this.connectionStatus = {
          message: `❌ Backend está OFFLINE (Erro: ${error.status})`,
          class: 'status-message status-error'
        };
        this.debugService.logDetailedError(error);
      }
    });
  }

  testLoginEndpoint(): void {
    if (!this.testEmail || !this.testPassword) {
      this.loginStatus = {
        message: '⚠️ Preencha email e senha',
        class: 'status-message status-info'
      };
      return;
    }

    this.loginStatus = { message: 'Testando login...', class: 'status-message status-info' };
    
    this.debugService.testLogin(this.testEmail, this.testPassword).subscribe({
      next: (response) => {
        this.loginEndpointExists = true;
        this.credentialsValid = true;
        this.loginStatus = {
          message: '✅ Login FUNCIONANDO - Credenciais válidas',
          class: 'status-message status-success'
        };
        this.debugService.logDetailedSuccess(response);
      },
      error: (error) => {
        this.loginEndpointExists = error.status !== 404;
        this.credentialsValid = error.status !== 401;
        
        let message = '';
        if (error.status === 404) {
          message = '❌ Endpoint /login não encontrado (404)';
        } else if (error.status === 401) {
          message = '❌ Credenciais inválidas (401) - Verifique email/senha no banco';
        } else if (error.status === 0) {
          message = '❌ Erro de conexão - Backend offline ou URL incorreta';
        } else {
          message = `❌ Erro ${error.status} - ${error.statusText}`;
        }
        
        this.loginStatus = {
          message,
          class: 'status-message status-error'
        };
        this.debugService.logDetailedError(error);
      }
    });
  }

  clearLogs(): void {
    console.clear();
    console.log('%c🧪 Logs limpos', 'color: blue; font-size: 14px');
  }
}
