import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../../../services/clientes.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  usuario: any;
  guardado = false;
  private _editar = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private clientesService: ClientesService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.perfilForm = this.fb.group({
      nombre: [this.usuario?.nombre, Validators.required],
      apellido: [this.usuario?.apellido, Validators.required],
      correo: [this.usuario?.correo, [Validators.required, Validators.email]],
      telefono: [this.usuario?.telefono || '']
    });
    this.perfilForm.disable();
  }

  get editar() {
    return this._editar;
  }
  set editar(valor: boolean) {
    this._editar = valor;
    if (valor) {
      this.perfilForm.enable();
      this.perfilForm.get('correo')?.disable();
    } else {
      this.perfilForm.disable();
    }
  }

  guardar() {
    if (this.perfilForm.invalid) return;
    const datosActualizados = { ...this.usuario, ...this.perfilForm.value };
    this.clientesService.updateCliente(this.usuario.userid || this.usuario._id, datosActualizados).subscribe({
      next: (resp: any) => {
        const usuarioActualizado = resp.data || datosActualizados;
        this.usuario = usuarioActualizado;
        this.authService.setUsuario(usuarioActualizado);
        this.guardado = true;
        this.editar = false;
        setTimeout(() => this.guardado = false, 3000);
        this.perfilForm.patchValue({
          nombre: usuarioActualizado.nombre,
          apellido: usuarioActualizado.apellido,
          correo: usuarioActualizado.correo,
          telefono: usuarioActualizado.telefono
        });
      },
      error: () => {
        alert('Error al actualizar el perfil');
      }
    });
  }

  cambiarFoto() {
    alert('Funcionalidad de cambio de foto próximamente.');
  }
}
