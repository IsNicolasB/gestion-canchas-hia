import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { ClientesService } from '../../../../services/clientes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent {
  passwordForm: FormGroup;
  cambiada = false;
  notificaciones = true;
  eliminada = false;
  mostrarActual = false;
  mostrarNueva = false;
  mostrarRepetir = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clientesService: ClientesService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      actual: ['', Validators.required],
      nueva: ['', [Validators.required, Validators.minLength(6)]],
      repetir: ['', Validators.required]
    });
  }

  cambiarPassword() {
    if (this.passwordForm.invalid || this.passwordForm.value.nueva !== this.passwordForm.value.repetir) {
      alert('Las contraseñas no coinciden o son inválidas');
      return;
    }
    const usuario = this.authService.getUsuario();
    const id = usuario.userid || usuario._id;
    const { actual, nueva } = this.passwordForm.value;
    this.authService.cambiarPassword(id, actual, nueva).subscribe({
      next: () => {
        this.cambiada = true;
        this.passwordForm.reset();
        setTimeout(() => this.cambiada = false, 3000);
      },
      error: (err) => {
        alert(err.error?.message || 'Error al cambiar la contraseña');
      }
    });
  }

  eliminarCuenta() {
    if (confirm('¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      const usuario = this.authService.getUsuario();
      const id = usuario.userid || usuario._id;
      
      this.clientesService.deleteCliente(id).subscribe({
        next: () => {
          this.eliminada = true;
          alert('Cuenta eliminada correctamente');
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error: (err) => {
          alert(err.error?.message || 'Error al eliminar la cuenta');
        }
      });
    }
  }
}
