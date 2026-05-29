import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss']
})
export class ForgotPasswordPage {

  form: FormGroup;

  loading = false;

  successMessage = '';

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {

    this.form = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]
    });
  }

  sendEmail(): void {

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(
      'https://nonlyrically-collocative-humberto.ngrok-free.dev/api/password/forgot',
      {
        email: this.form.value.email
      },
      {
        responseType: 'text'
      }
    ).subscribe({

      next: async () => {

        this.loading = false;
        this.successMessage =
          'Email de recuperacao enviado com sucesso.';

        await this.notifyRecoveryEmailSent();

        setTimeout(() => {

          this.router.navigate(
            ['/login'],
            {
              replaceUrl: true
            }
          );

        }, 2500);
      },

      error: (error) => {

        this.loading = false;
        this.errorMessage =
          this.getErrorMessage(error);
      }
    });
  }

  back(): void {
    this.router.navigate(['/login']);
  }

  private async notifyRecoveryEmailSent(): Promise<void> {

    if (
      !Capacitor.isNativePlatform() ||
      Capacitor.getPlatform() !== 'android'
    ) {
      return;
    }

    const currentPermission =
      await LocalNotifications.checkPermissions();

    const permission =
      currentPermission.display === 'granted'
        ? currentPermission
        : await LocalNotifications.requestPermissions();

    if (permission.display !== 'granted') {
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now() % 2147483647,
          title: 'FlowSense',
          body: 'Link de recuperacao enviado para o seu email.',
          schedule: {
            at: new Date(Date.now() + 500)
          }
        }
      ]
    });
  }

  private getErrorMessage(error: unknown): string {

    const responseError =
      (error as { error?: unknown })?.error;

    if (typeof responseError === 'string') {
      return responseError;
    }

    if (
      responseError &&
      typeof responseError === 'object' &&
      'message' in responseError &&
      typeof responseError.message === 'string'
    ) {
      return responseError.message;
    }

    return 'Erro ao enviar email.';
  }
}
