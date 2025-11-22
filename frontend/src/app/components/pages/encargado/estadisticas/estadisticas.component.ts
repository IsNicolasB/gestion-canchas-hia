// estadisticas.component.ts
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './estadisticas.component.html',
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  @ViewChild('chartFechas', { static: true }) chartFechasRef!: ElementRef;
  @ViewChild('chartCanchas', { static: true }) chartCanchasRef!: ElementRef;

  reservas: any[] = [];
  
  // Charts instances
  chartFechas: any;
  chartCanchas: any;

  // Gráfico de barras (Reservas por fecha)
  chartFechasLabels: string[] = [];
  chartFechasData: number[] = [];

  // Gráfico de torta (Reservas por cancha)
  chartCanchasLabels: string[] = [];
  chartCanchasData: number[] = [];

  constructor(private http: HttpClient) {
    // Registrar todos los componentes de Chart.js
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/reservas`).subscribe(response => {
      this.reservas = response.data;

      this.generarGraficoPorFechas();
      this.generarGraficoPorCanchas();
      
      // Crear los gráficos después de cargar los datos
      this.crearGraficos();
    });
  }

  ngAfterViewInit(): void {
    // Si ya tenemos datos, crear los gráficos
    if (this.reservas.length > 0) {
      this.crearGraficos();
    }
  }

  generarGraficoPorFechas(): void {
    const conteo: { [fecha: string]: number } = {};

    this.reservas.forEach(reserva => {
      const fecha = new Date(reserva.fecha).toLocaleDateString(); // formato corto
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    });

    this.chartFechasLabels = Object.keys(conteo);
    this.chartFechasData = Object.values(conteo);
  }

  generarGraficoPorCanchas(): void {
    const conteo: { [cancha: string]: number } = {};

    this.reservas.forEach(reserva => {
      const nombreCancha = reserva.cancha?.nombre || 'Sin nombre';
      conteo[nombreCancha] = (conteo[nombreCancha] || 0) + 1;
    });

    this.chartCanchasLabels = Object.keys(conteo);
    this.chartCanchasData = Object.values(conteo);
  }

  crearGraficos(): void {
    this.crearGraficoFechas();
    this.crearGraficoCanchas();
  }

  crearGraficoFechas(): void {
    if (this.chartFechas) {
      this.chartFechas.destroy();
    }

    const ctx = this.chartFechasRef.nativeElement.getContext('2d');
    
    this.chartFechas = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.chartFechasLabels,
        datasets: [{
          label: 'Reservas',
          data: this.chartFechasData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    } as any);
  }

  crearGraficoCanchas(): void {
    if (this.chartCanchas) {
      this.chartCanchas.destroy();
    }

    const ctx = this.chartCanchasRef.nativeElement.getContext('2d');
    
    // Colores para el gráfico de dona
    const colores = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#C9CBCF'
    ];

    this.chartCanchas = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.chartCanchasLabels,
        datasets: [{
          data: this.chartCanchasData,
          backgroundColor: colores.slice(0, this.chartCanchasData.length),
          borderColor: colores.slice(0, this.chartCanchasData.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    } as any);
  }
}