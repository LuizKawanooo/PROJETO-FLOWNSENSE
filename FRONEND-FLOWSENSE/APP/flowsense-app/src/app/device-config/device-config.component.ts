import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { DeviceConfigService } from '../services/device-config';
import { AppIconComponent } from '../shared/app-icon/app-icon.component';

@Component({
  selector: 'app-device-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppIconComponent
  ],
  templateUrl: './device-config.component.html',
  styleUrls: ['./device-config.component.scss']
})
export class DeviceConfigComponent {

  sensorId = 1;

  sensorName = 'Sensor FlowSense';

  wifiSsid = '';

  wifiPassword = '';

  backendUrl = 'https://nonlyrically-collocative-humberto.ngrok-free.dev';

  deviceToken = '';

  loadingRegister = false;

  loadingEsp32 = false;

  successMessage = '';

  errorMessage = '';

  step = 1;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private deviceConfigService: DeviceConfigService
  ) {}

  goBack() {
    this.router.navigate(['/device-list']);
  }

  async registerDevice() {
    const sensorId = Number(this.sensorId);
    const sensorName = this.sensorName.trim();

    if (!Number.isFinite(sensorId) || sensorId <= 0 || !sensorName) {
      this.errorMessage = 'Preencha um ID válido e o nome do sensor';
      return;
    }

    if (this.loadingRegister) {
      return;
    }

    this.loadingRegister = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.deviceToken = '';

    try {
      console.log('REGISTRANDO DEVICE...', {
        sensorId,
        name: sensorName
      });

      const response = await firstValueFrom(
        this.deviceConfigService.registerDevice({
          sensorId,
          name: sensorName
        })
      );

      console.log('DEVICE REGISTRADO:', response);

      this.deviceToken = response.deviceToken;

      if (!this.deviceToken) {
        throw new Error('Backend não retornou deviceToken.');
      }

      this.step = 2;
      this.successMessage = 'Dispositivo registrado com sucesso';

      const alert = await this.alertController.create({
        header: 'Dispositivo registrado',
        message:
          'Agora conecte o celular no Wi-Fi FlowSense_Config e envie a configuração para o ESP32.',
        buttons: ['OK']
      });

      await alert.present();

    } catch (error: any) {
      console.error('ERRO REGISTER:', error);

      const backendMessage =
        error?.error?.erro ||
        error?.error?.message ||
        error?.message ||
        'Não foi possível registrar o dispositivo.';

      this.errorMessage = backendMessage;

      const alert = await this.alertController.create({
        header: 'Erro backend',
        message:
          `Não foi possível registrar o dispositivo.<br><br>` +
          `Status: ${error?.status || 'sem resposta'}<br><br>` +
          backendMessage,
        buttons: ['OK']
      });

      await alert.present();

    } finally {
      this.loadingRegister = false;
    }
  }

  async configureEsp32() {
    const sensorId = Number(this.sensorId);
    const sensorName = this.sensorName.trim();
    const backend = this.backendUrl.trim();

    if (!this.wifiSsid.trim() || !this.wifiPassword) {
      this.errorMessage = 'Preencha Wi-Fi e senha';
      return;
    }

    if (!this.deviceToken) {
      this.errorMessage = 'Registre o dispositivo primeiro';
      return;
    }

    if (!backend) {
      this.errorMessage = 'Preencha a URL do backend';
      return;
    }

    if (this.loadingEsp32) {
      return;
    }

    this.loadingEsp32 = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      console.log('ENVIANDO CONFIG ESP32...');

      const response = await firstValueFrom(
        this.deviceConfigService.configureEsp32({
          ssid: this.wifiSsid.trim(),
          pass: this.wifiPassword,
          backend,
          id: sensorId,
          name: sensorName,
          token: this.deviceToken
        })
      );

      console.log('RESPOSTA ESP32:', response);

      this.successMessage = 'ESP32 configurado com sucesso';

      const alert = await this.alertController.create({
        header: 'ESP32 configurado',
        message:
          'Configuração enviada com sucesso.<br><br>' +
          'O ESP32 irá reiniciar automaticamente.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.router.navigate(['/device-list']);
            }
          }
        ]
      });

      await alert.present();

    } catch (error: any) {
      console.error('ERRO CONFIG ESP32:', error);

      const esp32Message =
        error?.message ||
        error?.error?.message ||
        'Não foi possível conectar no ESP32';

      this.errorMessage = esp32Message;

      const alert = await this.alertController.create({
        header: 'Erro conexão ESP32',
        message:
          'Verifique se o celular está conectado no Wi-Fi FlowSense_Config e desligue os dados móveis.<br><br>' +
          esp32Message,
        buttons: ['OK']
      });

      await alert.present();

    } finally {
      this.loadingEsp32 = false;
    }
  }
}
