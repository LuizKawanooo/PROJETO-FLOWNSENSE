import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';

import {
  IonicModule,
  ToastController
} from '@ionic/angular';
import { AppIconComponent } from '../shared/app-icon/app-icon.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AppIconComponent
  ]
})
export class ResetPasswordPage implements OnInit {

  form: FormGroup;

  token = '';

  loading = false;

  showPassword = false;

  showRepeatPassword = false;

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService
  ) {

    this.form = this.fb.group({

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      repeatPassword: [
        '',
        [
          Validators.required
        ]
      ]
    });
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.token = params['token'];

      console.log(
        'TOKEN:',
        this.token
      );
    });
  }

  async resetPassword(): Promise<void> {

    if (this.form.invalid) {
      return;
    }

    if (
      this.form.value.password !==
      this.form.value.repeatPassword
    ) {

      this.errorMessage =
        'As senhas não coincidem.';

      const toast =
        await this.toastController.create({

          message:
            this.errorMessage,

          duration: 3000,

          position: 'top',

          color: 'danger'
        });

      await toast.present();

      return;
    }

    this.loading = true;

    this.errorMessage = '';

    const body = {

      token: this.token,

      password:
        this.form.value.password,

      repeatPassword:
        this.form.value.repeatPassword
    };

    this.http.post(
      'https://nonlyrically-collocative-humberto.ngrok-free.dev/api/password/reset',
      body,
      {
        responseType: 'text'
      }
    ).subscribe({

      next: async () => {

        this.loading = false;

        const toast =
          await this.toastController.create({

            message:
              'Senha alterada com sucesso.',

            duration: 2500,

            position: 'top',

            color: 'success'
          });

        await toast.present();

        this.authService.logout();

        setTimeout(() => {

          this.router.navigate(
            ['/login'],
            {
              replaceUrl: true
            }
          );

        }, 2500);
      },

      error: async (error) => {

        this.loading = false;

        console.log(error);

        if (
          typeof error.error === 'string'
        ) {

          this.errorMessage =
            error.error;

        } else {

          this.errorMessage =
            'Erro ao alterar senha.';
        }

        const toast =
          await this.toastController.create({

            message:
              this.errorMessage,

            duration: 3000,

            position: 'top',

            color: 'danger'
          });

        await toast.present();
      }
    });
  }

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }

  toggleRepeatPassword(): void {

    this.showRepeatPassword =
      !this.showRepeatPassword;
  }
}
