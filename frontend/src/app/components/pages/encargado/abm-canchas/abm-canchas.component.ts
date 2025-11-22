import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanchasService } from '../../../../services/canchas.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-abm-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './abm-canchas.component.html',
  styleUrl: './abm-canchas.component.css'
})
export class AbmCanchasComponent implements OnInit {
  canchas: any[] = [];
  loading = false;
  error: string | null = null;
  tipoUsuario: string = '';

  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  canchaAEliminar: any = null;
  nuevaCancha: any = {
    nombre: '', tipo: '', ubicacion: '', dimensiones: '', precioPorHora: 0, estado: 'disponible', imagen: ''
  };
  canchaEdit: any = null;

  constructor(
    private canchasService: CanchasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    this.tipoUsuario = usuario?.tipo || '';
    this.obtenerCanchas();
  }

  obtenerCanchas() {
    this.loading = true;
    this.canchasService.getCanchas().subscribe({
      next: (data: any) => {
        this.canchas = data.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al obtener canchas';
        this.loading = false;
      }
    });
  }

  abrirModalAgregar() {
    this.nuevaCancha = {
      nombre: '', tipo: '', ubicacion: '', dimensiones: '', precioPorHora: 0, estado: 'disponible', imagen: ''
    };
    this.showAddModal = true;
  }

  agregarCancha() {
    const usuario = this.authService.getUsuario();
    const token = usuario?.token;
    this.canchasService.createCancha(this.nuevaCancha, token).subscribe({
      next: () => {
        this.obtenerCanchas();
        this.showAddModal = false;
      },
      error: () => {
        this.showAddModal = false;
        alert('Error al agregar cancha');
      }
    });
  }

  abrirModalEditar(cancha: any) {
    this.canchaEdit = { ...cancha };
    if (!this.canchaEdit.imagen) this.canchaEdit.imagen = '';
    this.showEditModal = true;
  }

  editarCanchaSubmit() {
    const usuario = this.authService.getUsuario();
    const token = usuario?.token;
    this.canchasService.updateCancha(this.canchaEdit._id, this.canchaEdit, token).subscribe({
      next: () => {
        this.obtenerCanchas();
        this.showEditModal = false;
      },
      error: () => {
        this.showEditModal = false;
        alert('Error al editar cancha');
      }
    });
  }

  abrirModalEliminar(cancha: any) {
    this.canchaAEliminar = cancha;
    this.showDeleteModal = true;
  }

  eliminarCanchaConfirmada() {
    const usuario = this.authService.getUsuario();
    const token = usuario?.token;
    this.canchasService.deleteCancha(this.canchaAEliminar._id, token).subscribe(() => {
      this.obtenerCanchas();
      this.showDeleteModal = false;
    });
  }

  cerrarModal(modal: string) {
    if (modal === 'add') this.showAddModal = false;
    if (modal === 'edit') this.showEditModal = false;
    if (modal === 'delete') this.showDeleteModal = false;
  }

  // Eliminadas funciones de imagen
}
