import { Component, OnInit } from '@angular/core';
import { CanchasService } from '../../../../services/canchas.service';
import { ReservasService } from '../../../../services/reservas.service';
import { HorariosService } from '../../../../services/horarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reasignar-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reasignar-reserva.component.html',
  styleUrl: './reasignar-reserva.component.css'
})
export class ReasignarReservaComponent implements OnInit {
  canchas: any[] = [];
  reservas: any[] = [];
  canchaSeleccionada: any = null;
  fechaSeleccionada: string = '';
  reservaSeleccionada: any = null;
  horariosDisponibles: any[] = [];
  nuevaFecha: string = '';
  nuevoHorario: string = '';
  loading: boolean = false;
  minFecha: string = '';
  maxFecha: string = '';

  constructor(
    private canchasService: CanchasService,
    private reservasService: ReservasService,
    private horariosService: HorariosService
  ) {}

  ngOnInit() {
    this.cargarCanchas();
    this.setFechasLimite();
  }

  setFechasLimite() {
    const hoy = new Date();
    const max = new Date();
    max.setDate(hoy.getDate() + 30); // Permitir reasignaciones hasta 30 días adelante

    // Formatear fechas en formato YYYY-MM-DD
    this.minFecha = this.formatearFecha(hoy);
    this.maxFecha = this.formatearFecha(max);
  }

  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  validarFecha(fecha: string): boolean {
    if (!fecha) return false;
    
    // Verificar formato YYYY-MM-DD
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fecha)) return false;
    
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    // Verificar que no sea una fecha pasada
    if (fechaSeleccionada < hoy) return false;
    
    // Verificar que no sea más de 30 días en el futuro
    const maxFecha = new Date();
    maxFecha.setDate(hoy.getDate() + 30);
    maxFecha.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada > maxFecha) return false;
    
    return true;
  }

  cargarCanchas() {
    this.canchasService.getCanchas().subscribe((resp: any) => {
      this.canchas = resp.data || resp;
    });
  }

  buscarReservas() {
    if (!this.canchaSeleccionada || !this.fechaSeleccionada) return;
    
    // Validar fecha seleccionada
    if (!this.validarFecha(this.fechaSeleccionada)) {
      alert('Por favor selecciona una fecha válida (hoy o hasta 30 días en el futuro).');
      this.fechaSeleccionada = this.getHoy();
      return;
    }
    
    this.loading = true;
    this.reservasService.getReservas().subscribe((resp: any) => {
      // Filtra reservas por cancha y fecha
      this.reservas = (resp.data || resp).filter((r: any) =>
        r.cancha?._id === this.canchaSeleccionada && r.fecha === this.fechaSeleccionada
      );
      this.loading = false;
    });
  }

  abrirModalReasignar(reserva: any) {
    this.reservaSeleccionada = reserva;
    this.nuevaFecha = reserva.fecha;
    this.nuevoHorario = reserva.horaInicio;
    this.cargarHorariosDisponibles();
    // Aquí deberías abrir el modal con JS/Bootstrap
  }

  cargarHorariosDisponibles() {
    if (!this.canchaSeleccionada || !this.nuevaFecha) return;
    
    // Validar nueva fecha
    if (!this.validarFecha(this.nuevaFecha)) {
      alert('La nueva fecha seleccionada no es válida.');
      return;
    }
    
    this.horariosService.getHorariosReservados(this.canchaSeleccionada, this.nuevaFecha).subscribe((resp: any) => {
      const ocupados = resp.data
        .filter((h: any) => h.estado !== 'disponible')
        .map((h: any) => h.horaInicio);
      
      const bloques = this.generarBloquesHorarios(this.calcularDuracionReserva());
      this.horariosDisponibles = bloques.filter(b =>
        !ocupados.includes(b.horaInicio) || b.horaInicio === this.reservaSeleccionada?.horaInicio
      );
    });
  }

  calcularDuracionReserva(): number {
    if (!this.reservaSeleccionada) return 2; // Duración por defecto
    
    const horaInicio = parseInt(this.reservaSeleccionada.horaInicio.split(':')[0], 10);
    const horaFin = parseInt(this.reservaSeleccionada.horaFin.split(':')[0], 10);
    return horaFin - horaInicio;
  }

  validarReasignacion(): boolean {
    if (!this.reservaSeleccionada || !this.nuevaFecha || !this.nuevoHorario) {
      alert('Completa todos los campos requeridos.');
      return false;
    }
    
    // Validar nueva fecha
    if (!this.validarFecha(this.nuevaFecha)) {
      alert('La nueva fecha seleccionada no es válida.');
      return false;
    }
    
    // Validar que el nuevo horario esté disponible
    const horarioSeleccionado = this.horariosDisponibles.find(h => h.horaInicio === this.nuevoHorario);
    if (!horarioSeleccionado) {
      alert('El horario seleccionado no está disponible.');
      return false;
    }
    
    // Validar rango de horas (10:00 a 22:00)
    const horaInicioNum = parseInt(this.nuevoHorario.split(':')[0], 10);
    const duracion = this.calcularDuracionReserva();
    const horaFinNum = horaInicioNum + duracion;
    
    if (horaInicioNum < 10 || horaFinNum > 22) {
      alert('Los horarios solo están disponibles entre las 10:00 y 22:00 horas.');
      return false;
    }
    
    return true;
  }

  confirmarReasignacion() {
    if (!this.validarReasignacion()) {
      return;
    }
    
    const duracion = this.calcularDuracionReserva();
    const nuevaHoraFin = this.calcularHoraFin(this.nuevoHorario, duracion);
    
    this.reservasService.updateReserva(this.reservaSeleccionada._id, {
      fecha: this.nuevaFecha,
      horaInicio: this.nuevoHorario,
      horaFin: nuevaHoraFin
    }).subscribe({
      next: () => {
        alert('Reserva reasignada correctamente');
        this.buscarReservas();
        // Cierra el modal aquí
        this.cerrarModal();
      },
      error: () => {
        alert('Error al reasignar la reserva');
      }
    });
  }

  calcularHoraFin(horaInicio: string, duracion: number): string {
    const hora = parseInt(horaInicio.split(':')[0], 10) + duracion;
    return hora.toString().padStart(2, '0') + ':00';
  }

  generarBloquesHorarios(duracion: number = 2): { horaInicio: string, horaFin: string }[] {
    const bloques: { horaInicio: string, horaFin: string }[] = [];
    for (let h = 10; h <= 22 - duracion; h++) {
      const horaInicio = h.toString().padStart(2, '0') + ':00';
      const horaFin = (h + duracion).toString().padStart(2, '0') + ':00';
      bloques.push({ horaInicio, horaFin });
    }
    return bloques;
  }

  getHoy(): string {
    return this.formatearFecha(new Date());
  }

  cerrarModal() {
    const modalElement = document.getElementById('reasignarModal');
    if (modalElement) {
      // @ts-ignore
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}
