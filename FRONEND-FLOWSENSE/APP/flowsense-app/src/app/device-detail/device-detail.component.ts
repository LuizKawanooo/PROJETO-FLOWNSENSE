import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';

import { ActivatedRoute, Router } from '@angular/router';

import {
  Subject,
  firstValueFrom,
  interval,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs';

import { Sensor } from '../services/sensor';
import { AppIconComponent } from '../shared/app-icon/app-icon.component';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, AppIconComponent],
  templateUrl: './device-detail.component.html',
  styleUrls: ['./device-detail.component.scss']
})
export class DeviceDetailComponent implements OnInit, OnDestroy {

  deviceName = 'Sensor de Fluxo';
  deviceId = '1';
  deviceDatabaseId = '';
  isOnline = false;

  flowRate = '0.00';
  totalFlow = '0.00';

  dailyTotal = '0.00';
  monthlyTotal = '0.00';

  valveOpen = false;

  deleting = false;
  confirmDeleteMode = false;

  private destroy$ = new Subject<void>();
  private confirmDeleteTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sensorService: Sensor,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.deviceId = id;
    }

    const deviceFromState = history.state?.device;

    if (deviceFromState) {
      this.deviceName = deviceFromState.name ?? this.deviceName;
      this.isOnline = Boolean(deviceFromState.online);

      if (deviceFromState.id !== undefined && deviceFromState.id !== null) {
        this.deviceDatabaseId = String(deviceFromState.id);
      }

      if (deviceFromState.sensorId !== undefined && deviceFromState.sensorId !== null) {
        this.deviceId = String(deviceFromState.sensorId);
      }
    }

    this.loadDeviceData();
    this.loadMonthlyConsumption();
  }

  loadDeviceData() {
    interval(1000)
      .pipe(
        startWith(0),
        switchMap(() => this.sensorService.getSensorAtual(this.deviceId)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.deviceName = data.name;
          this.isOnline = data.online;

          this.flowRate = Number(data.fluxoAtualLitrosPorMinuto || 0).toFixed(2);
          this.totalFlow = Number(data.totalFlow || 0).toFixed(2);
          this.dailyTotal = Number(data.dailyTotal || 0).toFixed(2);
        },
        error: (error) => {
          console.error('Erro ao buscar dados do sensor:', error);
          this.isOnline = false;
        }
      });
  }

  loadMonthlyConsumption() {
    interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.sensorService.getConsumoMensal(this.deviceId)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.monthlyTotal = Number(response.monthlyTotal || 0).toFixed(2);
        },
        error: (error) => {
          console.error('Erro ao buscar consumo mensal:', error);
          this.monthlyTotal = '0.00';
        }
      });
  }

  deleteDevice() {
    if (this.deleting) {
      return;
    }

    this.confirmDeleteMode = true;

    if (this.confirmDeleteTimer) {
      clearTimeout(this.confirmDeleteTimer);
    }

    this.confirmDeleteTimer = setTimeout(() => {
      this.confirmDeleteMode = false;
    }, 8000);
  }

  cancelDeleteDevice() {
    this.confirmDeleteMode = false;

    if (this.confirmDeleteTimer) {
      clearTimeout(this.confirmDeleteTimer);
      this.confirmDeleteTimer = undefined;
    }
  }

  async confirmDeleteDevice() {
    if (this.deleting) {
      return;
    }

    if (!this.deviceId) {
      await this.showAlert(
        'Erro ao excluir',
        'ID do sensor não encontrado.'
      );

      return;
    }

    this.deleting = true;
    this.confirmDeleteMode = false;

    if (this.confirmDeleteTimer) {
      clearTimeout(this.confirmDeleteTimer);
      this.confirmDeleteTimer = undefined;
    }

    console.log('EXCLUINDO DISPOSITIVO PELO SENSOR ID:', this.deviceId);

    try {
      const response = await this.deleteDeviceWithFallback();

      console.log('DISPOSITIVO EXCLUÍDO:', response);

      this.deleting = false;

      await this.showAlert(
        'Dispositivo excluído',
        'O dispositivo foi removido da sua conta e apagado do banco de dados.'
      );

      this.router.navigate(['/device-list']);

    } catch (error: any) {
      console.error('ERRO AO EXCLUIR DISPOSITIVO:', error);

      this.deleting = false;

      const backendMessage =
        error?.error?.erro ||
        error?.error?.message ||
        error?.message ||
        'Erro desconhecido';

      await this.showAlert(
        'Erro ao excluir',
        `Não foi possível excluir o dispositivo. Status: ${error?.status || 'sem resposta'}<br><br>${backendMessage}`
      );
    }
  }

  private async deleteDeviceWithFallback() {
    try {
      return await firstValueFrom(
        this.sensorService.deleteDevice(this.deviceId)
      );
    } catch (error: any) {
      const canTryDatabaseId =
        error?.status === 404 &&
        this.deviceDatabaseId &&
        this.deviceDatabaseId !== this.deviceId;

      if (!canTryDatabaseId) {
        throw error;
      }

      console.log('TENTANDO EXCLUIR PELO ID DO BANCO:', this.deviceDatabaseId);

      return firstValueFrom(
        this.sensorService.deleteDevice(this.deviceDatabaseId)
      );
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  openValve() {
    this.valveOpen = true;
  }

  closeValve() {
    this.valveOpen = false;
  }

  toggleValve() {
    this.valveOpen = !this.valveOpen;
  }

  goBack() {
    this.router.navigate(['/device-list']);
  }

  ngOnDestroy() {
    if (this.confirmDeleteTimer) {
      clearTimeout(this.confirmDeleteTimer);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
