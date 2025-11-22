import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservasService } from '../../../../services/reservas.service';
import { PagosService } from '../../../../services/pagos.service';

@Component({
  selector: 'app-completar-pago',
  imports: [CommonModule, FormsModule],
  templateUrl: './completar-pago.component.html',
  styleUrl: './completar-pago.component.css'
})
export class CompletarPagoComponent {
  nombreCliente: string = '';
  reservas: any[] = [];
  reservaSeleccionada: any = null;
  mensaje: string = '';
  cargando: boolean = false;

  constructor(private reservaService: ReservasService, private pagoService: PagosService) {}

  buscarReservas() {
    if (!this.nombreCliente.trim()) {
      this.mensaje = 'Por favor ingrese un nombre de cliente';
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.reservaSeleccionada = null;
    
    this.reservaService.getReservasPorClienteYFecha(this.nombreCliente).subscribe({
      next: (res: any) => {
        this.reservas = res.data || [];
        this.cargando = false;
        
        if (this.reservas.length === 0) {
          this.mensaje = 'No se encontraron reservas para este cliente en la fecha de hoy.';
        } else {
          this.mensaje = `Se encontraron ${this.reservas.length} reserva(s) para hoy.`;
        }
      },
      error: (err) => {
        console.error('Error al buscar reservas:', err);
        this.mensaje = 'Ocurrió un error al buscar las reservas. Por favor intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  seleccionarReserva(reserva: any) {
    this.reservaSeleccionada = reserva;
  }

  registrarPago() {
    if (!this.reservaSeleccionada) return;
    
    this.pagoService.updatePago(this.reservaSeleccionada.pago._id, {
      estado: 'pagado',
      importePendiente: 0
    }).subscribe({
      next: (res) => {
        this.mensaje = 'Pago completado con éxito';
        // Actualizar el estado en la lista
        const index = this.reservas.findIndex(r => r._id === this.reservaSeleccionada._id);
        if (index !== -1) {
          this.reservas[index].pago.estado = 'pagado';
          this.reservas[index].pago.importePendiente = 0;
        }
        this.reservaSeleccionada = null;
      },
      error: (err) => {
        console.error('Error al registrar el pago:', err);
        this.mensaje = 'Error al registrar el pago. Por favor intente nuevamente.';
      }
    });
  }
}
