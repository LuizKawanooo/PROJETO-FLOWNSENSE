import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],

  templateUrl: './login.html',

  styleUrls: ['./login.css']
})
export class Login
  implements OnInit {

  /*
   * LOGIN / SIGNUP
   */
  isLogin = true;

  /*
   * LOADING
   */
  isLoading = false;

  /*
   * ERROR
   */
  errorMessage = '';

  /*
   * PASSWORD
   */
  showPassword = false;

  /*
   * LOGIN DATA
   */
  loginData = {

    email: '',

    password: ''
  };

  /*
   * SIGNUP DATA
   */
  signupData = {

    username: '',

    email: '',

    password: ''
  };

  /*
   * BACKEND
   */
  private apiUrl =
    'https://nonlyrically-collocative-humberto.ngrok-free.dev';

  constructor(

    private http: HttpClient,

    private router: Router,

    private authService: AuthService

  ) { }

  /*
   * INIT
   */
  ngOnInit(): void {

    /*
     * JA LOGADO
     */
    if (this.authService.isAuthenticated()) {

      console.log(
        'Usuário já autenticado.'
      );

      this.router.navigateByUrl(
        '/historico',
        {
          replaceUrl: true
        }
      );
    }
  }

  /*
   * TOGGLE LOGIN / SIGNUP
   */
  toggleMode(): void {

    this.isLogin =
      !this.isLogin;

    this.errorMessage = '';
  }

  /*
   * SHOW PASSWORD
   */
  togglePasswordVisibility(): void {

    this.showPassword =
      !this.showPassword;
  }

  /*
   * LOGIN
   */
  aoLogar(): void {

    if (

      !this.loginData.email ||

      !this.loginData.password

    ) {

      this.errorMessage =
        'Preencha email e senha.';

      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    this.http.post<any>(

      `${this.apiUrl}/login`,

      {

        email:
          this.loginData.email,

        password:
          this.loginData.password
      },

      {
        headers: {

          'Content-Type':
            'application/json',

          'ngrok-skip-browser-warning':
            'true'
        }
      }

    ).subscribe({

      next: (response) => {

        console.log(
          'LOGIN:',
          response
        );

        /*
         * TOKEN
         */
        localStorage.setItem(

          'token',

          response.accessToken
        );

        /*
         * EMAIL
         */
        localStorage.setItem(

          'email',

          response.email || ''
        );

        /*
         * USER
         */
        localStorage.setItem(

          'currentUser',

          JSON.stringify(response)
        );

        this.isLoading = false;

        console.log(
          'LOGIN OK'
        );

        /*
         * HISTORICO
         */
        this.router.navigateByUrl(
          '/historico',
          {
            replaceUrl: true
          }
        );
      },

      error: (error) => {

        console.error(
          'LOGIN ERROR:',
          error
        );

        this.isLoading = false;

        if (
          error.status === 401
        ) {

          this.errorMessage =
            'Email ou senha inválidos.';
        }

        else if (
          error.status === 0
        ) {

          this.errorMessage =
            'Erro de conexão com backend.';
        }

        else {

          this.errorMessage =
            `Erro ao fazer login (${error.status})`;
        }
      }
    });
  }

  /*
   * CADASTRO
   */
  aoCadastrar(): void {

    console.log(
      'CADASTRO:',
      this.signupData
    );

    /*
     * FUTURO SIGNUP
     */
  }

  /*
   * ESQUECI SENHA
   */
  esqueceuSenha(): void {

    this.router.navigate([
      '/forgot-password'
    ]);
  }

  /*
   * LOGOUT
   */
  logout(): void {

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'email'
    );

    localStorage.removeItem(
      'currentUser'
    );

    console.log(
      'LOGOUT OK'
    );

    this.router.navigateByUrl(
      '/login',
      {
        replaceUrl: true
      }
    );
  }
}
