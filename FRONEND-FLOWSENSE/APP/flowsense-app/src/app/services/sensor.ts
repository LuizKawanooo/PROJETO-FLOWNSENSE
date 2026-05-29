import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Device {
  id?: string | number;
  sensorId?: string | number;
  name: string;
  ip?: string;
  online?: boolean;
}

export interface SensorAtual {
  sensorId: number;
  name: string;
  online: boolean;
  fluxoAtualLitrosPorMinuto: number;
  totalFlow: number;
  dailyTotal: number;
  monthlyTotal: number;
  litrosPendentesEmMemoria: number;
}

export interface ConsumoMensal {
  sensorId: number;
  monthlyTotal: number;
}

export interface DeleteDeviceResponse {
  status: string;
  mensagem: string;
  idBanco: number;
  sensorId: number;
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class Sensor {

  private apiUrl = 'https://nonlyrically-collocative-humberto.ngrok-free.dev';

  constructor(private http: HttpClient) { }

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

  let headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  });

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  console.log('TOKEN SENSOR SERVICE:', token ? 'SIM' : 'NÃO');

  return headers;
}



  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(
      `${this.apiUrl}/devices/meus`,
      {
        headers: this.getAuthHeaders()
      }
    ).pipe(
      map((devices) => devices.map((device) => this.normalizeDevice(device)))
    );
  }
  getConsumoMensal(sensorId: string): Observable<ConsumoMensal> {
    return this.http.get<ConsumoMensal>(
      `${this.apiUrl}/consumo/${sensorId}/mensal`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
  getSensorAtual(sensorId: string): Observable<SensorAtual> {
    return this.http.get<SensorAtual>(
      `${this.apiUrl}/sensores/${sensorId}/atual`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

deleteDevice(id: string | number): Observable<DeleteDeviceResponse> {

  return this.http.delete<DeleteDeviceResponse>(

    `${this.apiUrl}/devices/${encodeURIComponent(String(id))}`,

    {
      headers: this.getAuthHeaders()
    }
  );
}

  private normalizeDevice(device: Device): Device {
    const sensorId = device.sensorId ?? device.id;

    return {
      ...device,
      id: device.id ?? sensorId,
      sensorId,
      ip: device.ip ?? '',
      online: Boolean(device.online)
    };
  }
}
