import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  IonicModule,
  AlertController
} from '@ionic/angular';

import {
  Router
} from '@angular/router';

import {
  interval,
  Subject,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs';

import {
  AuthService
} from '../services/auth.service';

import {
  Device,
  Sensor
} from '../services/sensor';

import {
  AppIconComponent
} from '../shared/app-icon/app-icon.component';

@Component({
  selector: 'app-device-list',

  standalone: true,

  imports: [
    CommonModule,
    IonicModule,
    AppIconComponent
  ],

  templateUrl:
    './device-list.component.html',

  styleUrls: [
    './device-list.component.scss'
  ]
})
export class DeviceListComponent
implements OnInit, OnDestroy {

  devices: Device[] = [];

  loading = false;

  private destroy$ =
    new Subject<void>();

  constructor(

    private router: Router,

    private authService: AuthService,

    private sensorService: Sensor,

    private alertController: AlertController

  ) {}

  ngOnInit() {

    /*
   * BLOQUEIA SEM LOGIN
   */
  if (!this.authService.isAuthenticated) {

    console.log(
      'USUÁRIO NÃO AUTENTICADO'
    );

    this.router.navigate([
      '/welcome'
    ]);

    return;
  }

  this.startRealtimeDevices();
    
    
  }

  ionViewWillEnter() {

    this.startRealtimeDevices();
  }

  /*
   * ATUALIZA LISTA EM TEMPO REAL
   */
  startRealtimeDevices() {

    this.loading = true;

    interval(3000)
      .pipe(

        startWith(0),

        switchMap(() =>
          this.sensorService.getDevices()
        ),

        takeUntil(this.destroy$)
      )
      .subscribe({

        next: (devices: Device[]) => {

          console.log(
            'DEVICES:',
            devices
          );

          this.devices = devices;

          this.loading = false;
        },

        error: async (error: any) => {

          console.error(
            'ERRO DEVICES:',
            error
          );

          this.loading = false;

          this.devices = [];

          await this.showAlert(
            'Erro',
            'Não foi possível carregar dispositivos.'
          );
        }
      });
  }
loadDevices() {

  this.sensorService.getDevices()
    .subscribe({

      next: (devices: Device[]) => {

        console.log(
          'DEVICES MANUAL:',
          devices
        );

        this.devices = devices;

        this.loading = false;
      },

      error: (error: any) => {

        console.error(
          'ERRO LOAD DEVICES:',
          error
        );

        this.loading = false;
      }
    }); 
}

  openDevice(device: Device) {

    const sensorId =
      this.getDeviceSensorId(device);

    if (!sensorId) {

      this.showAlert(
        'Dispositivo inválido',
        'Sensor sem ID.'
      );

      return;
    }

    this.router.navigate(
      ['/device', sensorId],
      {
        state: { device }
      }
    );
  }

  getDeviceSensorId(
    device: Device
  ): string | null {

    const sensorId =
      device.sensorId ?? device.id;

    return (
      sensorId === undefined ||
      sensorId === null
    )
      ? null
      : String(sensorId);
  }

  openWifiConfig() {

    this.router.navigate([
      '/device-config'
    ]);
  }

  async showAlert(
    header: string,
    message: string
  ) {

    const alert =
      await this.alertController.create({

        header,

        message,

        buttons: ['OK']
      });

    await alert.present();
  }

  onProfileClick() {

    this.router.navigate([
      '/profile'
    ]);
  }

  onLogout() {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }

  ngOnDestroy() {

    this.destroy$.next();

    this.destroy$.complete();
  }
}