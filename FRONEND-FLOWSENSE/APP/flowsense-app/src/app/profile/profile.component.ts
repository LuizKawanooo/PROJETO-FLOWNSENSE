import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user';
import { AppIconComponent } from '../shared/app-icon/app-icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, AppIconComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  editMode = false;
  userName = '';
  userEmail = '';
  userId = '';
  isLoading = false;

  private originalUserName = '';
  private originalUserEmail = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

loadUserData() {

  const user = this.authService.getCurrentUser();

  console.log('👤 USER LOCAL:', user);

  if (user && user.userId) {

    this.userId = user.userId;

    // carrega local primeiro
    this.userName =
      user?.['username'] || '';

    this.userEmail =
      user?.['email'] || '';

    // atualiza backend
    this.userService.getUser(this.userId).subscribe({

      next: (userData) => {

        console.log('USER BACKEND:', userData);

        this.userName =
          userData['username'] ||
          userData['name'] ||
          this.userName;

        this.userEmail =
          userData['email'] ||
          this.userEmail;
      },

      error: (err) => {
        console.error(err);
      }
    });
  }
}

  toggleEditMode() {
    if (this.editMode) {
      this.cancelEdit();
    } else {
      this.editMode = true;
      this.originalUserName = this.userName;
      this.originalUserEmail = this.userEmail;
    }
  }

  saveChanges() {
    if (!this.userEmail.trim()) {
      alert('Por favor, preencha o email');
      return;
    }

    if (!this.userId) {
      alert('Erro: ID do usuário não encontrado.');
      return;
    }

    const emailChanged = this.userEmail !== this.originalUserEmail;
    this.isLoading = true;

    this.userService.updateUser(this.userId, {
      email: this.userEmail,
      username: this.userName
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.editMode = false;
        alert('Dados atualizados com sucesso!');
        
        // SEMPRE deslogar após atualizar para sincronizar com o banco
        // Isso garante que o JWT seja regenerado com os dados novos
        console.log('Fazendo logout após atualização de dados...');
        
        setTimeout(() => {
          this.authService.logout();
          
          if (emailChanged) {
            alert('Email alterado. Faça login novamente com o novo email.');
          } else {
            alert('Faça login novamente para sincronizar suas alterações.');
          }
          
          this.router.navigate(['/login']);
        }, 500);
      },
      error: (err) => {
        this.isLoading = false;
        alert('Erro ao atualizar: ' + (err.error?.message || 'Erro desconhecido'));
        console.error('Update error:', err);
      }
    });
  }

  cancelEdit() {
    this.userName = this.originalUserName;
    this.userEmail = this.originalUserEmail;
    this.editMode = false;
  }

  onBackClick() {
    this.router.navigate(['/device-list']);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
