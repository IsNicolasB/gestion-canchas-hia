import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../layout/headers/header-cliente/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  contactoForm: FormGroup;
  enviado: boolean = false;
  enviando: boolean = false;

  constructor(private fb: FormBuilder) {
    this.contactoForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tipoReporte: ['', Validators.required],
      prioridad: ['media', Validators.required],
      resumen: ['', [Validators.required, Validators.minLength(10)]],
      mensaje: ['', [Validators.required, Validators.minLength(20)]],
      pasosReproducir: ['']
    });
  }

  enviar() {
    if (this.contactoForm.valid) {
      this.enviando = true;

      // Preparar los datos para enviar a Mantis
      const datosReporte = {
        nombre: this.contactoForm.value.nombre,
        email: this.contactoForm.value.email,
        tipoReporte: this.contactoForm.value.tipoReporte,
        prioridad: this.contactoForm.value.prioridad,
        resumen: this.contactoForm.value.resumen,
        descripcion: this.contactoForm.value.mensaje,
        pasosReproducir: this.contactoForm.value.pasosReproducir,
        fechaReporte: new Date().toISOString()
      };

      // TODO: Aquí integrarás con la API de Mantis
      // Por ahora simulamos el envío
      console.log('Datos del reporte:', datosReporte);

      // Simular delay de envío
      setTimeout(() => {
        this.enviando = false;
        this.enviado = true;
        this.contactoForm.reset({
          prioridad: 'media' // Mantener el valor por defecto
        });

        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          this.enviado = false;
        }, 5000);
      }, 1500);

      /* 
      // Ejemplo de integración con Mantis (cuando esté listo):
      this.mantisService.crearReporte(datosReporte).subscribe({
        next: (response) => {
          this.enviando = false;
          this.enviado = true;
          this.contactoForm.reset({ prioridad: 'media' });
          console.log('Reporte creado en Mantis:', response);
        },
        error: (error) => {
          this.enviando = false;
          console.error('Error al enviar reporte:', error);
          // Aquí podrías mostrar un mensaje de error al usuario
        }
      });
      */
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.contactoForm.controls).forEach(key => {
        this.contactoForm.get(key)?.markAsTouched();
      });
    }
  }
}