import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservasService } from '../../../../services/reservas.service';
  
@Component({
  selector: 'app-listar-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-reservas.component.html',
  styleUrl: './listar-reservas.component.css'
})
export class ListarReservasComponent implements OnInit {
  reservas: any[] = [];
  loading = false;
  error: string | null = null;

  // Paginación del backend
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;  // Del backend
  totalReservas: number = 0;  // Agrega esto

  constructor(private reservasService: ReservasService) {}

  ngOnInit(): void {
    this.obtenerReservas();
  }

  obtenerReservas() {
    this.loading = true;
    this.reservasService.getReservas(this.currentPage, this.pageSize).subscribe({  // Pasa page y limit
      next: (data: any) => {
        this.reservas = data.data || [];
        this.totalPages = data.pagination?.totalPages || 0;
        this.totalReservas = data.pagination?.total || 0;  // Setea el total
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al obtener reservas';
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

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.obtenerReservas();  // Carga nueva página del backend
    }
  }

  getEstadoBadge(estado: string): string {
    switch(estado) {
      case 'Confirmada':
        return 'bg-success';
      case 'Pendiente':
        return 'bg-warning';
      case 'Cancelada':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
