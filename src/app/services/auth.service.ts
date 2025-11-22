import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private apiClienteUrl = `${environment.apiUrl}/clientes`
  private usuarioSubject = new BehaviorSubject<any>(this.getUsuario());

  constructor(private http: HttpClient) {}

  // Registro tradicional
  registrar(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, usuario);
  }

  // Login tradicional
  login(correo: string, contraseña: string, captchaToken?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contraseña, captchaToken });
  }

  // Login con Google
  loginConGoogle(credential: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/google`, { credential });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuario');
  }

  getUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  usuarioObservable(): Observable<any> {
    return this.usuarioSubject.asObservable();
  }

  setUsuario(usuario: any) {
    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('usuario');
    }
    this.usuarioSubject.next(usuario);
  }

  logout(): void {
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }

  cambiarPassword(id: string, actual: string, nueva: string) {
    return this.http.put(`${this.apiClienteUrl}/${id}/cambiar-password`, { actual, nueva });
  }
}
