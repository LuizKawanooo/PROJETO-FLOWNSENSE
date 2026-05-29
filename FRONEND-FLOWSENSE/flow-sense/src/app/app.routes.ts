import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { QuemSomos } from './pages/quem-somos/quem-somos';
import { Login } from './pages/login/login';
import { Historico } from './pages/historico/historico';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'quem-somos',
    component: QuemSomos,
    canActivate: [authGuard]
  },
  {
    path: 'historico',
    component: Historico,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
