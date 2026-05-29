import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpHeaders,
  HttpClientModule
} from '@angular/common/http';

@Component({
  selector: 'app-historico',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],

  templateUrl: './historico.html',

  styleUrls: ['./historico.css']
})
export class Historico
  implements OnInit {

  /*
   * BACKEND
   */
  private API_URL =
    'https://nonlyrically-collocative-humberto.ngrok-free.dev';

  /*
   * TOKEN
   */
  accessToken =
    localStorage.getItem('token') || '';

  /*
   * SENSORES
   */
  listaSensores: any[] = [];

  /*
   * SENSOR
   */
  sensorSelecionado = '';

  carregandoSensores = false;

  carregandoGrafico = false;

  /*
   * RESUMO
   */
  sensorIdResumo = '-';

  monthlyTotal = '0.00';

  totalDias = 0;

  /*
   * GRAFICO
   */
  dadosGrafico: any[] = [];

  /*
   * MENSAGEM
   */
  chartMessage = '';

  deviceMessage = '';

  barInfoMessage = '';

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    if (
      this.accessToken
    ) {

      this.carregarSensores();
    }
  }

  /*
   * HEADERS
   */
  private getHeaders(): HttpHeaders {

    return new HttpHeaders({

      Authorization:
        `Bearer ${this.accessToken}`,

      'ngrok-skip-browser-warning':
        'true',

      'Content-Type':
        'application/json'
    });
  }

  /*
   * SENSORES
   */
  carregarSensores(carregarGraficoDepois = true): void {

    this.deviceMessage = '';
    this.carregandoSensores = true;

    if (
      !this.accessToken
    ) {

      this.deviceMessage =
        'Faça login primeiro.';

      this.carregandoSensores = false;

      if (
        carregarGraficoDepois
      ) {

        this.carregandoGrafico = false;
      }

      return;
    }

    this.http.get<any[]>(

      `${this.API_URL}/sensores/disponiveis`,

      {
        headers:
          this.getHeaders()
      }

    ).subscribe({

      next: (devices) => {

        console.log(
          'SENSORES:',
          devices
        );

        this.listaSensores =
          (devices || []).map(
            device =>
              this.normalizarSensor(device)
          );

        const sensorAtualExiste =
          this.listaSensores.some(
            sensor =>
              String(sensor.id) === this.sensorSelecionado
          );

        if (
          (!this.sensorSelecionado || !sensorAtualExiste) &&
          this.listaSensores.length > 0
        ) {

          this.sensorSelecionado =
            String(
              this.listaSensores[0].id
            ).trim();
        }

        this.carregandoSensores = false;

        if (
          this.listaSensores.length === 0
        ) {

          this.deviceMessage =
            'Nenhum dispositivo encontrado.';

          if (
            carregarGraficoDepois
          ) {

            this.carregandoGrafico = false;
          }
        }

        else if (
          carregarGraficoDepois
        ) {

          this.carregarGrafico();
        }
      },

      error: (error) => {

        console.error(error);

        this.carregandoSensores = false;

        if (
          carregarGraficoDepois
        ) {

          this.carregandoGrafico = false;
        }

        this.deviceMessage =
          'Erro ao carregar sensores.';
      }
    });
  }

  /*
   * GRAFICO
   */
  carregarGrafico(): void {

    this.chartMessage = '';

    this.dadosGrafico = [];

    this.barInfoMessage = '';

    this.carregandoGrafico = true;

    let sensorId =
      String(
        this.sensorSelecionado || ''
      ).trim();

    if (
      this.listaSensores.length === 0
    ) {

      this.carregarSensores(true);

      return;
    }

    if (
      !sensorId
    ) {

      const primeiroSensor =
        this.listaSensores.find(
          sensor =>
            sensor.id
        );

      if (
        primeiroSensor
      ) {

        this.sensorSelecionado =
          String(
            primeiroSensor.id
          ).trim();

        sensorId =
          this.sensorSelecionado;
      }

      else {

        this.chartMessage =
          'Nenhum sensor valido encontrado.';

        this.carregandoGrafico = false;

        return;
      }
    }

    this.http.get<any>(

      `${this.API_URL}/consumo/${encodeURIComponent(sensorId)}/mensal/grafico`,

      {
        headers:
          this.getHeaders()
      }

    ).subscribe({

      next: (data) => {

        console.log(
          'GRAFICO:',
          data
        );

        const dias =
          Array.isArray(data)
            ? data
            : data.dias ||
          data.days ||
          data.consumos ||
          data.consumoDiario ||
          data.dailyConsumption ||
          [];

        this.sensorIdResumo =
          data.sensorId ||
          data.sensor_id ||
          data.idSensor ||
          sensorId;

        this.monthlyTotal =
          Number(
            data.monthlyTotal ??
            data.totalMensal ??
            data.consumoMensal ??
            data.total ??
            this.calcularTotalMensal(dias)
          ).toFixed(2);

        this.dadosGrafico =
          dias.map(
            (item: any) =>
              this.normalizarDiaGrafico(item)
          );

        this.totalDias =
          this.dadosGrafico.length;

        this.carregandoGrafico = false;

        if (
          this.dadosGrafico.length === 0
        ) {

          this.chartMessage =
            'Nenhum consumo registrado.';
        }
      },

      error: (error) => {

        console.error(error);

        this.carregandoGrafico = false;

        this.chartMessage =
          'Erro ao buscar gráfico.';
      }
    });
  }

  onSensorChange(sensorId: string): void {

    this.sensorSelecionado =
      String(
        sensorId || ''
      ).trim();
    this.chartMessage = '';
    this.dadosGrafico = [];
    this.barInfoMessage = '';
    this.sensorIdResumo = '-';
    this.monthlyTotal = '0.00';
    this.totalDias = 0;

    if (
      this.sensorSelecionado &&
      !this.carregandoSensores
    ) {

      this.carregarGrafico();
      }
  }

  mostrarConsumoBarra(item: any): void {

    this.barInfoMessage =
      `Dia ${item.dia}: ${Number(item.litros || 0).toFixed(2)} L`;
  }

  private normalizarSensor(device: any): any {

    if (
      typeof device === 'string' ||
      typeof device === 'number'
    ) {

      return {
        id:
          String(device),
        name:
          `Sensor ${device}`,
        online:
          true
      };
    }

    return {
      ...device,
      id:
        device.id ??
        device.sensorId ??
        device.sensor_id ??
        device.deviceId ??
        device.device_id ??
        device.codigo ??
        device.code,
      name:
        device.name ??
        device.nome ??
        device.sensorName ??
        device.deviceName ??
        device.descricao ??
        'Sensor',
      online:
        device.online ??
        device.isOnline ??
        device.status === 'online'
    };
  }

  private normalizarDiaGrafico(item: any): any {

    const litros =
      Number(
        String(
          item.litros ??
          item.liters ??
          item.consumo ??
          item.consumoLitros ??
          item.totalLitros ??
          item.total ??
          0
        ).replace(',', '.')
      );

    return {
      ...item,
      dia:
        item.dia ||
        item.day ||
        item.data ||
        item.date ||
        '-',
      litros:
        Number.isFinite(litros)
          ? litros
          : 0
    };
  }

  private calcularTotalMensal(dias: any[]): number {

    return dias.reduce(
      (total, item) =>
        total +
        Number(
          String(
            item.litros ??
            item.liters ??
            item.consumo ??
            item.consumoLitros ??
            item.totalLitros ??
            item.total ??
            0
          ).replace(',', '.')
        ),
      0
    );
  }

  /*
   * MAIOR VALOR
   */
  calcularMaiorValor(): number {

    if (
      this.dadosGrafico.length === 0
    ) {

      return 1;
    }

    return Math.max(

      ...this.dadosGrafico.map(
        item =>
          Number(
            item.litros || 0
          )
      ),

      1
    );
  }

  /*
   * ALTURA
   */
  calcularAltura(
    litros: number
  ): number {

    return litros > 0

      ? Math.max(

        (
          litros /
          this.calcularMaiorValor()
        ) * 100,

        6
      )

      : 0;
  }
}
