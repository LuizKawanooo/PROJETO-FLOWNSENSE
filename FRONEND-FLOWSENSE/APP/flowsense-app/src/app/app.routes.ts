import { Routes } from '@angular/router';
import { GuestGuard } from './guards/guest-guard';
import { AuthGuard } from './guards/auth-guard';


export const routes: Routes = [
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome.component').then((m) => m.WelcomeComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.component').then((m) => m.SignupComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'device-list',
    loadComponent: () => import('./device-list/device-list.component').then((m) => m.DeviceListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'device/:id',
    loadComponent: () => import('./device-detail/device-detail.component').then((m) => m.DeviceDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'device-config',
    loadComponent: () => import('./device-config/device-config.component').then((m) => m.DeviceConfigComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },
];
