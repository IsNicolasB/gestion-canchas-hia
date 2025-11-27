import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../../../services/clientes.service';

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-usuarios.component.html',
  styleUrl: './listar-usuarios.component.css'
})
export class ListarUsuariosComponent implements OnInit {
  clientes: any[] = [];
  loading: boolean = false;
  error: string | null = null;

// Paginación del backend
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;  // Del backend
  totalClientes: number = 0;  // Agrega esto

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.obtenerTodosLosClientes();
  }

   // Obtener clientes con paginación del backend
  obtenerTodosLosClientes(): void {
    this.loading = true;
    this.error = null;
    this.clientesService.getClientes(this.currentPage, this.pageSize).subscribe({  // This.currentPage, this.pageSize
      next: (resp: any) => {
        this.clientes = resp.data || resp;  // Cambia a clientes
        this.totalPages = resp.pagination?.totalPages || 0;  // Usa totalPages del backend
        this.totalClientes = resp.pagination?.total || 0;  // Total de clientes
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al obtener clientes';
        this.loading = false;
      }
    });
  }

    get paginasVisibles(): number[] {
    const ventana = 5;
    let inicio = Math.max(1, this.currentPage - Math.floor(ventana / 2));
    let fin = Math.min(this.totalPages, inicio + ventana - 1);

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
    // En paginación del backend, ya viene la página actual
    return this.clientes;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.obtenerTodosLosClientes();  // Carga nueva página del backend
    }
  }
}