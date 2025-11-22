import { Component, NgModule, AfterViewInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare const google: any;
declare const grecaptcha: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule]
})
export class LoginComponent implements AfterViewInit {
  googleClientId = '989381766185-qqun9sbv6qk03guuar3n1inlps1cegbn.apps.googleusercontent.com';
  captchaResuelta = false;
  captchaToken: string = '';
  siteKey: string = '6LehQHorAAAAAFk3eaHitiEeI80JFjnf-s2OsCN9';

  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }
  
  ngAfterViewInit(): void {
    // Cargar el script de Google si no está cargado
    if (!document.getElementById('google-signin-script')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-signin-script';
      script.onload = () => this.renderGoogleButton();
      document.body.appendChild(script);
    } else {
      this.renderGoogleButton();
    }

    // Cargar reCAPTCHA
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
        grecaptcha.render('recaptcha-container', {
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

  renderGoogleButton() {
    if ((window as any).google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response)
      });
      google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: 300 }
      );
    }
  }

  handleGoogleCredential(response: any) {
    const credential = response.credential;
    this.authService.loginConGoogle(credential).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const usuario = {
            nombre: res.nombre,
            apellido: res.apellido,
            correo: res.correo,
            tipo: res.tipo,
            userid: res.userid,
            token: res.token
          };
          localStorage.setItem('usuario', JSON.stringify(usuario));
          this.authService.setUsuario(usuario);
          this.router.navigate(['/']);
        } else {
          alert('No se pudo iniciar sesión con Google');
        }
      },
      error: () => alert('Error en el login con Google')
    });
  }

  login() {
    if (this.loginForm.invalid || !this.captchaResuelta) {
      this.loginForm.markAllAsTouched();
      if (!this.captchaResuelta) {
        alert('Por favor, resuelve el captcha');
      }
      return;
    }
    const { correo, contrasena } = this.loginForm.value;
    this.authService.login(correo, contrasena, this.captchaToken).subscribe({
      next: (res) => {
        console.log('Respuesta del login:', res);
        if (res.status === 1) {
          const usuario = {
            nombre: res.nombre,
            apellido: res.apellido,
            correo: res.correo,
            telefono: res.telefono,
            tipo: res.tipo,
            userid: res.userid
          };
          localStorage.setItem('usuario', JSON.stringify(usuario));
          this.authService.setUsuario(usuario);
          this.router.navigate(['/']);
        } else {
          alert('Credenciales incorrectas');
        }
      },
      error: () => alert('Error en el login')
    });
  }

  get correo() { return this.loginForm.get('correo'); }
  get contrasena() { return this.loginForm.get('contrasena'); }
}
