import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientesService } from '../../../services/clientes.service';
import { CommonModule } from '@angular/common';

declare const grecaptcha: any;

@Component({
  selector: 'app-registrar-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './registrar-cliente.component.html',
  styleUrl: './registrar-cliente.component.css'
})
export class RegistrarClienteComponent implements AfterViewInit {
  registroForm: FormGroup;
  enviado = false;
  errorMsg = '';
  exito = false;
  mostrarPassword = false;
  mostrarConfirmPassword = false;
  captchaResuelta = false;
  captchaToken: string = '';
  siteKey: string = '6LehQHorAAAAAFk3eaHitiEeI80JFjnf-s2OsCN9';

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContraseña: ['', Validators.required],
      terminos: [false, Validators.requiredTrue],
      newsletter: [false]
    }, { validators: this.passwordsMatchValidator });
  }

  ngAfterViewInit(): void {
    this.cargarRecaptcha();
  }

  cargarRecaptcha() {
    if (!document.getElementById('recaptcha-script')) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.id = 'recaptcha-script';
      script.onload = () => this.renderRecaptcha();
      document.body.appendChild(script);
    } else {
      this.renderRecaptcha();
    }
  }

  renderRecaptcha() {
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.ready(() => {
        grecaptcha.render('recaptcha-container-registro', {
          sitekey: this.siteKey,
          callback: (token: string) => this.onCaptchaResolved(token)
        });
      });
    }
  }

  onCaptchaResolved(token: string) {
    this.captchaResuelta = !!token;
    this.captchaToken = token || '';
  }

  passwordsMatchValidator(form: FormGroup) {
    return form.get('contraseña')?.value === form.get('confirmarContraseña')?.value
      ? null : { mismatch: true };
  }

  registrar() {
    this.enviado = true;
    this.errorMsg = '';
    this.exito = false;
    if (this.registroForm.invalid || !this.captchaResuelta) {
      if (!this.captchaResuelta) {
        this.errorMsg = 'Por favor, resuelve el captcha';
      }
      return;
    }
    const { nombre, apellido, telefono, correo, contraseña, newsletter } = this.registroForm.value;
    const nuevoCliente = {
      nombre,
      apellido,
      telefono,
      correo,
      contraseña,
      newsletter,
      captchaToken: this.captchaToken
    };
    this.clientesService.createCliente(nuevoCliente).subscribe({
      next: () => {
        this.exito = true;
        
        // Enviar evento a Google Analytics
        console.log('Intentando enviar evento a Google Analytics...');
        console.log('gtag disponible:', typeof (window as any).gtag);
        
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('event', 'sign_up', {
            method: 'Email',
            event_category: 'engagement',
            event_label: 'Registro Cliente'
          });
          console.log('Evento sign_up enviado a Google Analytics');
        } else {
          console.warn('Google Analytics (gtag) no está disponible');
        }
        
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error al registrar. Intenta nuevamente.';
      }
    });
  }
}
