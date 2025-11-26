import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanchasService } from '../../../services/canchas.service';
import { HorariosService } from '../../../services/horarios.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Agrega FormsModule aquí
  templateUrl: './canchas.component.html',
  styleUrl: './canchas.component.css'
})
export class CanchasComponent implements OnInit {
  // ...
  canchas: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  tipoUsuario: string = '';
  canchasFiltradas: any[] = []; // Nueva propiedad para canchas filtradas
  canchasPaginadas: any[] = [];
  pageSize: number = 6;
  currentPage: number = 1;

  // Filtros
  filtroTipo: string = '';
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;
  filtroUbicacion: string = '';

  // Opciones para dropdowns
  tiposDisponibles: string[] = ['Fútbol 5', 'Fútbol 7', 'Fútbol 11'];

  selectedCancha: any = null;
  // Eliminado ABM: showAddModal, showEditModal, showDeleteModal, canchaAEliminar, nuevaCancha, nuevaImagen, editImagen, canchaEdit
  horariosDisponibles: string[] = [];
  selectedFecha: string = ''; // formato 'YYYY-MM-DD'
  loadingHorarios = false;

  minFecha: string = '';
  maxFecha: string = '';

  horaSeleccionada: string | null = null;
  cantidadHoras: number = 1; // Nuevo campo

  horariosReservados: string[] = [];

  constructor(
    private canchasService: CanchasService,
    private horariosService: HorariosService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerCanchas();
    this.setFechasLimite();
    const usuario = this.authService.getUsuario();
    this.tipoUsuario = usuario?.tipo || '';
  }

  // Eliminado ABM: abrirModalAgregar, agregarCancha, abrirModalEditar, editarCanchaSubmit, abrirModalEliminar, eliminarCanchaConfirmada, cerrarModal

  setFechasLimite() {
    const hoy = new Date();
    const max = new Date();
    max.setDate(hoy.getDate() + 30); // Permitir reservas hasta 30 días adelante

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

  obtenerCanchas(): void {
    this.loading = true;
    this.error = null;
    this.canchasService.getCanchas().subscribe({
      next: (data: any) => {
        this.canchas = data.data || [];
        this.aplicarFiltros(); // Aplicar filtros iniciales
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al obtener canchas';
        this.loading = false;
        console.error('Error al obtener canchas:', err);
      }
    });
  }

  
  verHorarios(cancha: any) {
    this.selectedCancha = cancha;
    this.setFechasLimite();
    this.selectedFecha = this.getHoy();
    this.loadingHorarios = true;
    this.horariosDisponibles = [];
    this.cargarHorarios();
  }

  onFechaChange() {
    if (!this.validarFecha(this.selectedFecha)) {
      alert('Por favor selecciona una fecha válida (hoy o hasta 30 días en el futuro).');
      this.selectedFecha = this.getHoy();
      return;
    }
    
    this.loadingHorarios = true;
    this.horariosDisponibles = [];
    this.cargarHorarios();
  }

  cargarHorarios() {
    this.horariosService.getHorariosReservados(this.selectedCancha._id, this.selectedFecha).subscribe({
      next: (resp: any) => {
        // Extrae solo las horas de inicio de los horarios ocupados
        this.horariosReservados = resp.data
          .filter((h: any) => h.estado !== 'disponible')
          .map((h: any) => h.horaInicio);

        this.horariosDisponibles = this.generarHorariosDisponibles(this.horariosReservados);
        this.loadingHorarios = false;
        // Abre el modal solo si no está abierto aún
        const modalElement = document.getElementById('horariosModal');
        if (modalElement && !modalElement.classList.contains('show')) {
          // @ts-ignore
          const modal = new window.bootstrap.Modal(modalElement);
          modal.show();
        }
      },
      error: () => {
        this.horariosDisponibles = [];
        this.horariosReservados = [];
        this.loadingHorarios = false;
      }
    });
  }

  generarHorariosDisponibles(reservados: string[]): string[] {
    const bloques: string[] = [];
    for (let h = 10; h <= 22 - this.cantidadHoras; h++) {
      let disponible = true;
      for (let offset = 0; offset < this.cantidadHoras; offset++) {
        const hora = (h + offset).toString().padStart(2, '0') + ':00';
        if (reservados.map(r => r.slice(0,5)).includes(hora)) {
          disponible = false;
          break;
        }
      }
      if (disponible) {
        bloques.push(h.toString().padStart(2, '0') + ':00');
      }
    }
    return bloques;
  }

  getHoy(): string {
    return this.formatearFecha(new Date());
  }

  abrirModalHorarios(cancha: any) {
    this.selectedCancha = cancha;
    this.setFechasLimite();
    this.selectedFecha = ''; // No hay fecha seleccionada aún
    this.horariosDisponibles = [];
    this.loadingHorarios = false;
    // Abre el modal
    const modalElement = document.getElementById('horariosModal');
    if (modalElement) {
      // @ts-ignore
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
  }

  reservar() {
    // Validaciones previas
    if (!this.selectedCancha) {
      alert('Debes seleccionar una cancha.');
      return;
    }

    if (!this.selectedFecha) {
      alert('Debes seleccionar una fecha.');
      return;
    }

    if (!this.validarFecha(this.selectedFecha)) {
      alert('La fecha seleccionada no es válida.');
      return;
    }

    if (!this.horaSeleccionada) {
      alert('Debes seleccionar un horario.');
      return;
    }

    // Validar cantidad de horas
    if (!this.cantidadHoras || this.cantidadHoras < 1 || this.cantidadHoras > 4) {
      alert('La cantidad de horas debe estar entre 1 y 4.');
      return;
    }

    // Verificar si el usuario está logueado
    const usuario = this.authService.getUsuario();
    if (!usuario) {
      alert('Debes iniciar sesión para reservar.');
      this.router.navigate(['/login']);
      this.cerrarModal();
      return;
    }

    // Validar que el usuario sea de tipo Cliente
    if (usuario.tipo !== 'Cliente') {
      alert('Solo los clientes pueden realizar reservas.');
      return;
    }

    const horaInicio = this.horaSeleccionada;
    const cantidadHorasNum = Number(this.cantidadHoras) || 1;
    const horaInicioNum = parseInt(horaInicio.split(':')[0], 10);
    const horaFinNum = horaInicioNum + cantidadHorasNum;
    const horaFin = horaFinNum.toString().padStart(2, '0') + ':00';

    // Validar rango de horas (10:00 a 22:00)
    if (horaInicioNum < 10 || horaFinNum > 22) {
      alert('Las reservas solo están disponibles entre las 10:00 y 22:00 horas.');
      return;
    }

    // Validar que todos los bloques del rango estén disponibles
    for (let h = horaInicioNum; h < horaFinNum; h++) {
      const bloque = h.toString().padStart(2, '0') + ':00';
      if (this.horariosReservados.includes(bloque)) {
        alert(`El bloque ${bloque} ya está ocupado. Por favor, elige otro rango.`);
        return;
      }
    }

    // Cerrar modal antes de redirigir
    this.cerrarModal();

    // Redirigir con todos los parámetros validados
    this.router.navigate(['/reservas'], {
      queryParams: {
        canchaId: this.selectedCancha._id,
        fecha: this.selectedFecha,
        hora: horaInicio,
        horaFin: horaFin,
        cantidadHoras: cantidadHorasNum,
        usuarioId: usuario.userid
      }
    });
  }

  cerrarModal() {
    const modalElement = document.getElementById('horariosModal');
    if (modalElement) {
      // @ts-ignore
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  onSeleccionarCanchaYFecha(canchaId: string, fecha: string) {
    this.http.get<any>(`/api/horarios/filtrar?canchaId=${canchaId}&fecha=${fecha}`)
      .subscribe(resp => {
        // Extrae solo las horas de inicio de los horarios ocupados
        this.horariosReservados = resp.data.map((h: any) => h.horaInicio);
      });
  }

  getHoraFin(horaInicio: string): string {
    // Validaciones básicas
    if (!horaInicio || typeof horaInicio !== 'string') {
      return '';
    }
    
    // Extraer la hora (número antes de los dos puntos)
    const partes = horaInicio.split(':');
    if (partes.length < 1) {
      return '';
    }
    
    const horaInicioNum = parseInt(partes[0], 10);
    if (isNaN(horaInicioNum)) {
      return '';
    }
    
    // Obtener cantidad de horas
    const cantidadHoras = parseInt(this.cantidadHoras.toString(), 10);
    if (isNaN(cantidadHoras) || cantidadHoras < 1) {
      return '';
    }
    
    // Calcular hora de fin
    const horaFinNum = horaInicioNum + cantidadHoras;
    
    // Limitar a 22:00 máximo
    const horaFinal = Math.min(horaFinNum, 22);
    
    // Formatear resultado
    return horaFinal.toString().padStart(2, '0') + ':00';
  }

  aplicarFiltros(): void {
    this.canchasFiltradas = this.canchas.filter(cancha => {
      this.currentPage = 1; // Resetear a la primera página al aplicar filtros
      const matchTipo = !this.filtroTipo || cancha.tipo === this.filtroTipo;
      const matchPrecioMin = this.filtroPrecioMin === null || cancha.precioPorHora >= this.filtroPrecioMin;
      const matchPrecioMax = this.filtroPrecioMax === null || cancha.precioPorHora <= this.filtroPrecioMax;
      const matchUbicacion = !this.filtroUbicacion || cancha.ubicacion.toLowerCase().includes(this.filtroUbicacion.toLowerCase());
      return matchTipo && matchPrecioMin && matchPrecioMax && matchUbicacion;
    });
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroTipo = '';
    this.filtroPrecioMin = null;
    this.filtroPrecioMax = null;
    this.filtroUbicacion = '';
    this.aplicarFiltros();
  }
  
  get totalPages(): number {
    return Math.ceil(this.canchasFiltradas.length / this.pageSize);
  }

  get canchasMostradas(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.canchasFiltradas.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
