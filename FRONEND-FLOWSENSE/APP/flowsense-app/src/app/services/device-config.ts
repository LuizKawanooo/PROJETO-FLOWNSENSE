import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable,
  from,
  timeout
} from 'rxjs';

import {
  Capacitor,
  CapacitorHttp
} from '@capacitor/core';

export interface RegisterDeviceRequest {

  sensorId: number;

  name: string;
}

export interface RegisterDeviceResponse {

  sensorId: number;

  name: string;

  deviceToken: string;

  ownerEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceConfigService {

  /*
   * BACKEND
   */
  private apiUrl =
    'https://nonlyrically-collocative-humberto.ngrok-free.dev';

  /*
   * ESP32 ACCESS POINT
   */
  private esp32Url =
    'http://192.168.4.1';

  constructor(
    private http: HttpClient
  ) { }

  /*
   * JWT LOGIN
   */
  private getAuthHeaders(): HttpHeaders {

    const currentUser =
      localStorage.getItem(
        'currentUser'
      );

    let token = '';

    if (currentUser) {

      try {

        const user =
          JSON.parse(currentUser);

        console.log(
          'USER STORAGE:',
          user
        );

        token =
          user.accessToken || '';

      } catch (error) {

        console.error(
          'Erro localStorage:',
          error
        );
      }
    }

    console.log(
      'TOKEN JWT:',
      token
    );

    let headers =
      new HttpHeaders({

        'Content-Type':
          'application/json',

        'ngrok-skip-browser-warning':
          'true'
      });

    if (token) {

      headers =
        headers.set(

          'Authorization',

          'Bearer ' + token
        );
    }

    return headers;
  }

  /*
   * REGISTRAR SENSOR
   */
  registerDevice(
    data: RegisterDeviceRequest
  ): Observable<RegisterDeviceResponse> {

    const url =
      `${this.apiUrl}/devices/registrar`;

    console.log(
      'REGISTER URL:',
      url
    );

    console.log(
      'REGISTER BODY:',
      data
    );

    return this.http.post<
      RegisterDeviceResponse
    >(
      url,

      data,

      {
        headers:
          this.getAuthHeaders()
      }
    );
  }

  /*
   * CONFIGURAR ESP32
   */
  configureEsp32(data: {

    ssid: string;

    pass: string;

    backend: string;

    id: number;

    name: string;

    token: string;

  }): Observable<string> {

    const url =
      `${this.esp32Url}/save`;

    /*
     * JSON PRO ESP32
     */
    const body = {

      ssid:
        data.ssid,

      pass:
        data.pass,

      backend:
        data.backend,

      id:
        data.id,

      name:
        data.name,

      token:
        data.token
    };

    const headers =
      new HttpHeaders({

        'Content-Type':
          'application/json'
      });

    console.log(
      'ESP32 URL:',
      url
    );

    console.log(
      'ESP32 BODY:',
      body
    );

    if (Capacitor.isNativePlatform()) {

      return from(
        CapacitorHttp.post({
          url,
          headers: {
            'Content-Type':
              'application/json'
          },
          data: body,
          connectTimeout: 15000,
          readTimeout: 15000
        }).then((response) => {

          console.log(
            'ESP32 NATIVE STATUS:',
            response.status
          );

          if (
            response.status < 200 ||
            response.status >= 300
          ) {

            throw new Error(
              `ESP32 respondeu status ${response.status}`
            );
          }

          return typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);
        })
      ).pipe(
        timeout(16000)
      );
    }

    return this.http.post(
      url,

      body,

      {
        headers,

        responseType:
          'text'
      }
    ).pipe(
      timeout(15000)
    );
  }
}
