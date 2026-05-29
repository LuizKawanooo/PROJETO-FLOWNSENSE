import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors 
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  passwordsMatch: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });

    // Monitorar mudanças nas senhas
    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.onPasswordChange();
    });

    this.signupForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.onPasswordChange();
    });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onPasswordChange() {
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;
    
    if (password && confirmPassword) {
      this.passwordsMatch = password === confirmPassword;
    } else {
      this.passwordsMatch = true;
    }
    
    this.errorMessage = '';
  }

  onSignup() {

  Object.keys(this.signupForm.controls).forEach(key => {
    this.signupForm.get(key)?.markAsTouched();
  });

  if (this.signupForm.invalid) {
    this.errorMessage = 'Por favor, corrija os erros no formulário.';
    return;
  }

  if (!this.passwordsMatch) {
    this.errorMessage = 'As senhas não coincidem.';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  const signupData = {
    username: this.signupForm.value.fullName,
    email: this.signupForm.value.email,
    password: this.signupForm.value.password
  };

  console.log('DADOS ENVIADOS:', signupData);

  this.authService.signup(signupData).subscribe({
    next: () => {
      this.isLoading = false;
      alert('Conta criada com sucesso!');
      this.router.navigate(['/login']);
    },
    error: (error) => {
      this.isLoading = false;
      console.error(error);

      if (error.status === 422) {
        this.errorMessage = 'Este email já está cadastrado.';
      } else {
        this.errorMessage = 'Erro ao criar conta.';
      }
    }
  });
}

  goBack() {
    this.router.navigate(['/login']);
  }
}