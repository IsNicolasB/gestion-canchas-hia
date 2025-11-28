import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../../../services/clientes.service';

@Component({
  selector: 'app-ver-antecedentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-antecedentes.component.html',
  styleUrl: './ver-antecedentes.component.css'
})
export class VerAntecedentesComponent{
  clientes: any[] = [];
  clienteSeleccionado: any = null;
  nombreBusqueda: string = '';
  apellidoBusqueda: string = '';
  nuevoAntecedente: string = '';
  buscando = false;
  error: string | null = null;

// Paginación para clientes
  pageSize: number = 10;
  currentPageClientes: number = 1;

  // Paginación para antecedentes
  pageSizeAntecedentes: number = 5;
  currentPage: number = 1;


  constructor(private clientesService: ClientesService) {}

  buscarCliente() {
    this.buscando = true;
    this.error = null;
    this.clientesService.buscarClientes(this.nombreBusqueda, this.apellidoBusqueda).subscribe({
      next: (resp: any) => {
        this.clientes = resp.data || resp;
        this.currentPageClientes = 1;
        this.buscando = false;
      },
      error: () => {
        this.error = 'Error al buscar clientes';
        this.buscando = false;
      }
    });
  }

  seleccionarCliente(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.nuevoAntecedente = '';
    this.currentPage = 1;
  }

  agregarAntecedente() {
    if (!this.nuevoAntecedente.trim()) return;
    const antecedentes = this.clienteSeleccionado.antecedentes || [];
    antecedentes.push(this.nuevoAntecedente.trim());
    this.clientesService.updateCliente(this.clienteSeleccionado._id, { antecedentes }).subscribe({
      next: () => {
        this.clienteSeleccionado.antecedentes = antecedentes;
        this.nuevoAntecedente = '';
        alert('Antecedente agregado correctamente');
      },
      error: () => {
        alert('Error al agregar antecedente');
      }
    });
  }

  get totalPagesClientes(): number {
    return Math.ceil(this.clientes.length / this.pageSize);
  }

  // Páginas a mostrar (máximo 5 alrededor de la actual)
  get paginasVisibles(): number[] {
    const totalPages = this.totalPagesClientes;
    const ventana = 5;  // Mostrar máximo 5 páginas
    let inicio = Math.max(1, this.currentPageClientes - Math.floor(ventana / 2));
    let fin = Math.min(totalPages, inicio + ventana - 1);

    if (fin - inicio < ventana - 1) {
      inicio = Math.max(1, fin - ventana + 1);
    }

    const paginas = [];
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  get clientesMostrados(): any[] {
    const start = (this.currentPageClientes - 1) * this.pageSize;
    return this.clientes.slice(start, start + this.pageSize);
  }

  changePageClientes(page: number): void {
    if (page >= 1 && page <= this.totalPagesClientes) {
      this.currentPageClientes = page;
    }
  }

  // Métodos existentes para antecedentes
  get totalPages(): number {
    return this.clienteSeleccionado?.antecedentes ? Math.ceil(this.clienteSeleccionado.antecedentes.length / this.pageSizeAntecedentes) : 0;
  }

  get antecedentesMostrados(): any[] {
    if (!this.clienteSeleccionado?.antecedentes) return [];
    const start = (this.currentPage - 1) * this.pageSizeAntecedentes;
    return this.clienteSeleccionado.antecedentes.slice(start, start + this.pageSizeAntecedentes);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
