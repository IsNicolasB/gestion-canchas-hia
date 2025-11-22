import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { PagosService } from '../../../../services/pagos.service';
import { CommonModule } from '@angular/common';
import { Pago } from '../../../../models/pago.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-pagos.component.html',
  styleUrl: './mis-pagos.component.css'
})
export class MisPagosComponent implements OnInit {
  showDetalleModal = false;
  pagoDetalle: Pago | null = null;
  showComprobanteModal = false;
  comprobantePago: Pago | null = null;
  showCorreoModal = false;
  correoPago: Pago | null = null;
  pagos: Pago[] = [];
  pagosFiltrados: Pago[] = [];
  usuarioId: string = '';
  cargando = true;
  filtro = '';
  estadoFiltro = '';

  constructor(private pagoService: PagosService, private authService: AuthService) {}

  ngOnInit() {
    this.recargarPagos();
  }

  recargarPagos() {
    this.cargando = true;
    const usuario = this.authService.getUsuario();
    this.usuarioId = usuario?.userid;
    this.pagoService.obtenerPagosPorCliente(this.usuarioId).subscribe({
      next: (res: Pago[]) => {
        this.pagos = res;
        this.filtrarPagos();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  filtrarPagos() {
    this.pagosFiltrados = this.pagos.filter(p =>
      (!this.filtro || p.estado.toLowerCase().includes(this.filtro.toLowerCase())) &&
      (!this.estadoFiltro || p.estado === this.estadoFiltro)
    );
  }

  verDetalle(pago: Pago) {
    this.pagoDetalle = pago;
    this.showDetalleModal = true;
  }

  mostrarComprobante(pago: Pago) {
    this.comprobantePago = pago;
    this.showComprobanteModal = true;
  }

  enviarPorCorreo(pago: Pago) {
    this.correoPago = pago;
    this.showCorreoModal = true;
    // Aquí podrías llamar al servicio real
  }

  verHistorial(pago: Pago) {
    // Aquí podrías abrir otro modal si lo deseas
    alert('Historial de pago');
  }
  cerrarModal(tipo: string) {
    if (tipo === 'detalle') this.showDetalleModal = false;
    if (tipo === 'comprobante') this.showComprobanteModal = false;
    if (tipo === 'correo') this.showCorreoModal = false;
  }
}
