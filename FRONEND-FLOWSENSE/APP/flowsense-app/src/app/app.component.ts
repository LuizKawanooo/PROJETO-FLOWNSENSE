import { Component, NgZone, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router, RouterOutlet } from '@angular/router';

import { PushNotificationService } from './services/push-notification';

import { IonicModule } from '@ionic/angular';

import {
  App,
  URLOpenListenerEvent
} from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private pushNotificationService: PushNotificationService,
    private zone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    this.initializeDeepLinks();

    await this.initializePushNotifications();
  }

  async initializePushNotifications(): Promise<void> {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
      console.log('Usuário não logado. Push não iniciado no AppComponent.');
      return;
    }

    await this.pushNotificationService.init();
  }

  initializeDeepLinks(): void {
    App.addListener(
      'appUrlOpen',
      (event: URLOpenListenerEvent) => {
        console.log('DEEPLINK:', event.url);
        this.handleDeepLink(event.url);
      }
    );

    App.getLaunchUrl().then((launchData) => {
      if (launchData?.url) {
        console.log('LAUNCH URL:', launchData.url);
        this.handleDeepLink(launchData.url);
      }
    });
  }

  handleDeepLink(url: string): void {
    this.zone.run(() => {
      try {
        if (url.includes('reset-password')) {
          const split = url.split('token=');

          if (split.length < 2) {
            return;
          }

          const token = split[1];

          console.log('TOKEN:', token);

          this.router.navigate(
            ['/reset-password'],
            {
              queryParams: {
                token
              }
            }
          );
        }
      } catch (error) {
        console.error('Erro Deep Link:', error);
      }
    });
  }
}