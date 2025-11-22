import { Component, OnInit } from '@angular/core';
import { CanchasService } from '../../../../services/canchas.service';
import { HorariosService } from '../../../../services/horarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-bloquear-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bloquear-horarios.component.html',
  styleUrl: './bloquear-horarios.component.css'
})
export class BloquearHorariosComponent implements OnInit {
  canchas: any[] = [];
  canchaSeleccionada: any = null;
  fechaSeleccionada: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  horariosBloqueados: any[] = [];
  horariosOcupados: any[] = [];
  horariosDisponibles: string[] = [];
  loadingCanchas = false;
  loadingHorarios = false;
  error: string | null = null;

  // Nuevas propiedades para control de fechas
  minFecha: string = '';
  maxFecha: string = '';

  constructor(
    private canchasService: CanchasService,
    private horariosService: HorariosService
  ) {}

  ngOnInit() {
    this.cargarCanchas();
    this.setFechasLimite();
  }

  setFechasLimite() {
    const hoy = new Date();
    const max = new Date();
    max.setDate(hoy.getDate() + 30); // Permitir bloqueos hasta 30 días adelante

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
    this.loadingCanchas = true;
    this.canchasService.getCanchas().subscribe({
      next: (resp: any) => {
        this.canchas = resp.data || resp;
        this.loadingCanchas = false;
      },
      error: () => {
        this.error = 'Error al cargar canchas';
        this.loadingCanchas = false;
      }
    });
  }

  onSeleccionarCanchaOFecha() {
    if (!this.canchaSeleccionada || !this.fechaSeleccionada) {
      this.horariosBloqueados = [];
      this.horariosOcupados = [];
      this.horariosDisponibles = [];
      return;
    }

    // Validar fecha seleccionada
    if (!this.validarFecha(this.fechaSeleccionada)) {
      alert('Por favor selecciona una fecha válida (hoy o hasta 30 días en el futuro).');
      this.fechaSeleccionada = this.getHoy();
      return;
    }

    this.loadingHorarios = true;
    this.horariosService.getHorariosReservados(this.canchaSeleccionada._id, this.fechaSeleccionada).subscribe({
      next: (resp: any) => {
        const horarios = resp.data || [];
        this.horariosBloqueados = horarios.filter((h: any) => h.estado === 'bloqueado');
        this.horariosOcupados = horarios.filter((h: any) => h.estado !== 'bloqueado');
        this.horariosDisponibles = this.generarHorariosDisponibles();
        this.loadingHorarios = false;
      },
      error: () => {
        this.horariosBloqueados = [];
        this.horariosOcupados = [];
        this.horariosDisponibles = [];
        this.loadingHorarios = false;
      }
    });
  }

  generarHorariosDisponibles(): string[] {
    const bloques: string[] = [];
    for (let h = 10; h < 22; h++) {
      const hora = h.toString().padStart(2, '0') + ':00';
      // Solo agregar si no está ocupado ni bloqueado
      const ocupado = this.horariosOcupados.some(hor => hor.horaInicio === hora);
      const bloqueado = this.horariosBloqueados.some(hor => hor.horaInicio === hora);
      if (!ocupado && !bloqueado) {
        bloques.push(hora);
      }
    }
    return bloques;
  }

  validarRangoHoras(horaInicio: string, horaFin: string): boolean {
    if (!horaInicio || !horaFin) return false;
    
    const horaInicioNum = parseInt(horaInicio.split(':')[0], 10);
    const horaFinNum = parseInt(horaFin.split(':')[0], 10);
    
    // Validar que la hora de fin sea mayor que la de inicio
    if (horaFinNum <= horaInicioNum) {
      alert('La hora de fin debe ser mayor que la hora de inicio.');
      return false;
    }
    
    // Validar rango de horas (10:00 a 22:00)
    if (horaInicioNum < 10 || horaFinNum > 22) {
      alert('Los horarios solo están disponibles entre las 10:00 y 22:00 horas.');
      return false;
    }
    
    // Validar que todos los bloques del rango estén disponibles
    for (let h = horaInicioNum; h < horaFinNum; h++) {
      const bloque = h.toString().padStart(2, '0') + ':00';
      if (!this.horariosDisponibles.includes(bloque)) {
        alert(`El bloque ${bloque} no está disponible para bloquear.`);
        return false;
      }
    }
    
    return true;
  }

  bloquearHorario() {
    if (!this.canchaSeleccionada || !this.fechaSeleccionada || !this.horaInicio || !this.horaFin) {
      alert('Completa todos los campos');
      return;
    }

    // Validar fecha
    if (!this.validarFecha(this.fechaSeleccionada)) {
      alert('La fecha seleccionada no es válida.');
      return;
    }

    // Validar rango de horas
    if (!this.validarRangoHoras(this.horaInicio, this.horaFin)) {
      return;
    }

    const horaInicioNum = parseInt(this.horaInicio.split(':')[0], 10);
    const horaFinNum = parseInt(this.horaFin.split(':')[0], 10);

    // Crear horarios bloqueados para cada bloque
    const peticiones = [];
    for (let h = horaInicioNum; h < horaFinNum; h++) {
      const bloqueInicio = h.toString().padStart(2, '0') + ':00';
      const bloqueFin = (h + 1).toString().padStart(2, '0') + ':00';
      peticiones.push(firstValueFrom(this.horariosService.createHorario({
        cancha: this.canchaSeleccionada._id,
        fecha: this.fechaSeleccionada,
        horaInicio: bloqueInicio,
        horaFin: bloqueFin,
        estado: 'bloqueado'
      })));
    }
    
    Promise.all(peticiones).then(() => {
      alert('Horario(s) bloqueado(s) correctamente');
      this.onSeleccionarCanchaOFecha();
      this.horaInicio = '';
      this.horaFin = '';
    }).catch(() => {
      alert('Error al bloquear horario(s)');
    });
  }

  desbloquearHorario(horario: any) {
    if (!confirm('¿Seguro que deseas desbloquear este horario?')) return;
    this.horariosService.deleteHorario(horario._id).subscribe({
      next: () => {
        alert('Horario desbloqueado');
        this.onSeleccionarCanchaOFecha();
      },
      error: () => {
        alert('Error al desbloquear horario');
      }
    });
  }

  getHoy(): string {
    return this.formatearFecha(new Date());
  }
}
