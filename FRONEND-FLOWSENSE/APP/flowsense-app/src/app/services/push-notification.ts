import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Capacitor } from '@capacitor/core';

import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed
} from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  private apiUrl = 'https://nonlyrically-collocative-humberto.ngrok-free.dev';

  private listenersAdded = false;

  constructor(private http: HttpClient) {}

  async init(): Promise<void> {
    console.log('=== INICIANDO PUSH NOTIFICATIONS ===');

    if (!Capacitor.isNativePlatform()) {
      console.warn('Push só funciona em Android/iOS real. Não funciona no navegador.');
      return;
    }

    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
      console.warn('currentUser não encontrado. Faça login antes de iniciar push.');
      return;
    }

    console.log('currentUser encontrado:', currentUser);

    try {
      await PushNotifications.createChannel({
        id: 'leak_alerts',
        name: 'Alertas de Vazamento',
        description: 'Notificações de vazamento de água',
        importance: 5,
        visibility: 1,
        sound: 'default'
      });

      const permission = await PushNotifications.requestPermissions();

      console.log('Permissão push:', permission);

      if (permission.receive !== 'granted') {
        console.warn('Permissão de notificação negada.');
        return;
      }

      this.addListenersOnce();

      console.log('Registrando no FCM...');
      await PushNotifications.register();

    } catch (error) {
      console.error('Erro ao iniciar push:', error);
    }
  }

  private addListenersOnce(): void {
    if (this.listenersAdded) {
      console.log('Listeners de push já adicionados.');
      return;
    }

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('FCM TOKEN GERADO:', token.value);

      this.sendTokenToBackend(token.value).subscribe({
        next: (response) => {
          console.log('TOKEN PUSH SALVO NO BACKEND:', response);
        },
        error: (error) => {
          console.error('ERRO AO SALVAR TOKEN PUSH NO BACKEND:', error);
        }
      });
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('ERRO AO REGISTRAR FCM:', error);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('PUSH RECEBIDO COM APP ABERTO:', notification);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('USUÁRIO CLICOU NA NOTIFICAÇÃO:', notification);

        const data = notification.notification.data;

        if (data?.['type'] === 'leak_alert') {
          console.log('ALERTA DE VAZAMENTO:', data);
        }
      }
    );

    this.listenersAdded = true;
  }

  private sendTokenToBackend(fcmToken: string) {
    console.log('Enviando FCM token para backend...');

    return this.http.post(
      `${this.apiUrl}/push-token`,
      {
        token: fcmToken,
        platform: 'android'
      },
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const currentUser = localStorage.getItem('currentUser');

    let token = '';

    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        token = user.accessToken || '';
      } catch (error) {
        console.error('Erro ao ler currentUser:', error);
      }
    }

    console.log('TOKEN JWT PARA SALVAR PUSH:', token ? 'SIM' : 'NÃO');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}