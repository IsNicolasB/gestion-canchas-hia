import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanchasService } from '../../../services/canchas.service';
import { PagosService } from '../../../services/pagos.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ClientesService } from '../../../services/clientes.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit, OnDestroy {
  fecha: string = '';
  hora: string = '';
  horaFin: string = ''; // Nuevo
  cancha: any = {};
  loading = true;
  error: string = "";
  mp_init_point: string = '';
  cliente: any = {};
  pago: any = null;
  reserva: any = null;
  reservaConfirmada: boolean = false;
  pollingInterval: any;
  cantidadHoras: number = 1; // Nuevo

  constructor(
    private route: ActivatedRoute,
    private canchasService: CanchasService,
    private pagosService: PagosService,
    private clienteService: ClientesService // Asumiendo que tienes un servicio para clientes
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const canchaId = params['canchaId'];
      this.fecha = params['fecha'];
      this.hora = params['hora'];
      this.horaFin = params['horaFin']; // Nuevo
      this.cantidadHoras = Number(params['cantidadHoras']) || 1;

      this.cliente = JSON.parse(localStorage.getItem('usuario') || '{}');

      if (canchaId) {
        this.canchasService.getCanchaById(canchaId).subscribe({
          next: (resp: any) => {
            this.cancha = resp.data || resp;
            this.loading = false;
          },
          error: () => {
            this.error = 'No se pudo cargar la cancha';
            this.loading = false;
          }
        });
      }
    });
  }

  iniciarPollingPago() {
    if (!this.pago?._id) return;
    this.pollingInterval = setInterval(() => {
      this.pagosService.getPagoById(this.pago._id).subscribe((resp: any) => {
        if (resp.data && resp.data.estado === 'señado') {
          this.reservaConfirmada = true;
          clearInterval(this.pollingInterval);
        }
      });
    }, 5000); // cada 5 segundos
  }

  sumarUnaHora(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const nuevaHora = (h + 1).toString().padStart(2, '0') + ':' + (m || 0).toString().padStart(2, '0');
    return nuevaHora;
  }

  confirmarPago() {
    const cantidadHorasNum = Number(this.cantidadHoras) || 1;
    const importeTotal = this.cancha.precioPorHora * cantidadHorasNum;

    const pagoData = {
      importeTotal: importeTotal,
      descripcion: `Reserva de cancha ${this.cancha.nombre} el ${this.fecha} de ${this.hora} a ${this.horaFin}`,
      cancha: this.cancha._id,
      cliente: this.cliente.userid,
      fecha: this.fecha,
      horaInicio: this.hora,
      horaFin: this.horaFin,
      cantidadHoras: cantidadHorasNum
    };
    this.pagosService.createPagoMercadoPago(pagoData).subscribe({
      next: (resp: any) => {
        this.mp_init_point = resp.data.mp_init_point;
        this.pago = resp.data.pago;
        this.iniciarPollingPago();
      },
      error: () => {
        this.error = 'No se pudo generar el link de pago';
      }
    });
  }

  // Simulación de confirmación de reserva (en la práctica, esto lo haría el webhook)
  confirmarReservaManual() {
    this.reservaConfirmada = true;
    this.reserva = {
      numero: Math.floor(Math.random() * 1000000), // Simulación de número de reserva
      // Puedes agregar más datos si lo necesitas
    };
  }

  imprimirComprobante() {
    window.print();
  }

  descargarPDF() {
    const comprobante = document.getElementById('comprobante');
    if (!comprobante) {
      alert('No se encontró el comprobante para descargar.');
      return;
    }
    html2canvas(comprobante).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Ajusta el tamaño de la imagen al ancho de la página
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('comprobante_reserva.pdf');
    });
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
