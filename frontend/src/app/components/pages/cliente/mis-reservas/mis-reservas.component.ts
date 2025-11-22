import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { ReservasService } from '../../../../services/reservas.service';
import { CommonModule } from '@angular/common';
import { Cancha, Reserva } from '../../../../models/reserva.model';
import { FormsModule } from '@angular/forms';
import { CanchasService } from '../../../../services/canchas.service';
import { PagosService } from '../../../../services/pagos.service';
import { Pago } from '../../../../models/pago.model';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.css'
})
export class MisReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  usuarioId: string = '';
  cargando = true;
  filtroFecha = '';
  filtroCancha = '';
  estadoFiltro = '';
  cancha: Cancha = {} as Cancha;
  pago: Pago = {} as Pago;
  showDetalleModal = false;
  reservaDetalle: Reserva | null = null;

  constructor(
    private reservaService: ReservasService,
    private canchasService: CanchasService,
    private pagosService: PagosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.recargarReservas();
  }

  recargarReservas() {
    this.cargando = true;
    const usuario = this.authService.getUsuario();
    this.usuarioId = usuario?.userid;
    this.reservaService.obtenerReservasPorCliente(this.usuarioId).subscribe({
      next: (reservas: Reserva[]) => {
        this.reservas = reservas;
        console.log(this.reservas[0].cancha);
        console.log(this.reservas[0].pago);
        this.filtrarReservas();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  filtrarReservas() {
    this.reservasFiltradas = this.reservas.filter(r =>
      (!this.filtroFecha || r.fecha === this.filtroFecha) &&
      (!this.estadoFiltro || r.pago?.estado === this.estadoFiltro) &&
      (!this.filtroCancha || r.cancha?.nombre?.toLowerCase().includes(this.filtroCancha.toLowerCase()))
    );
  }

  verDetalle(reserva: Reserva) {
    this.reservaDetalle = reserva;
    this.showDetalleModal = true;
  }

  cerrarModal() {
    this.showDetalleModal = false;
    this.reservaDetalle = null;
  }

  cancelarReserva(reserva: Reserva) {
    // Lógica para cancelar la reserva (llamar al backend)
    if (confirm('¿Seguro que deseas cancelar esta reserva?')) {
      alert('Reserva cancelada (simulado)');
    }
  }
}
