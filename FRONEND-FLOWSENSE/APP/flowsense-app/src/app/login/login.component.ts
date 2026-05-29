import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { PushNotificationService } from '../services/push-notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private pushNotificationService: PushNotificationService
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.authService.isAuthenticated) {
      console.log('Usuário já logado. Iniciando Push Notifications...');

      await this.iniciarPushNotifications();

      this.router.navigate(['/device-list']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
  if (this.loginForm.invalid) {
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  const { email, password } = this.loginForm.value;

  this.authService.login(email, password).subscribe({
    next: async (response) => {
      console.log('LOGIN BEM SUCEDIDO');
      console.log('Full response:', response);

      try {
        await this.pushNotificationService.init();
      } catch (error) {
        console.error('Erro ao iniciar Push Notification:', error);
      }

      this.isLoading = false;
      this.router.navigate(['/device-list']);
    },

    error: (error) => {
      this.isLoading = false;
      console.error('LOGIN FALHOU', error);

      if (error.status === 401) {
        this.errorMessage = 'Email ou senha inválidos.';
      } else if (error.status === 0) {
        this.errorMessage = 'Erro de conexão. Verifique o backend.';
      } else {
        this.errorMessage = `Erro ao fazer login (${error.status}).`;
      }
    }
  });
}

  private async iniciarPushNotifications(): Promise<void> {
    try {
      console.log('Chamando PushNotificationService.init()...');

      await this.pushNotificationService.init();

      console.log('PushNotificationService.init() finalizado.');
    } catch (error) {
      console.error('Erro ao iniciar Push Notification:', error);
    }
  }

  onSignup(): void {
    this.router.navigate(['/signup']);
  }

  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}