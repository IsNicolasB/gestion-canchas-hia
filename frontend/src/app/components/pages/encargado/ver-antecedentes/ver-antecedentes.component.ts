import { Component } from '@angular/core';
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
export class VerAntecedentesComponent {
  clientes: any[] = [];
  clienteSeleccionado: any = null;
  nombreBusqueda: string = '';
  apellidoBusqueda: string = '';
  nuevoAntecedente: string = '';
  buscando = false;
  error: string | null = null;

  constructor(private clientesService: ClientesService) {}

  buscarCliente() {
    this.buscando = true;
    this.error = null;
    this.clientesService.buscarClientes(this.nombreBusqueda, this.apellidoBusqueda).subscribe({
      next: (resp: any) => {
        this.clientes = resp.data || resp;
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
}
