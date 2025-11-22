import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./components/layout/footer/footer.component";
import { HeaderGerenteComponent } from "./components/layout/headers/header-gerente/header-gerente.component";
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/layout/headers/header-cliente/header.component';
import { AuthService } from './services/auth.service';
import { Usuario } from './models/usuario.model';
import { Observable } from 'rxjs';
import { HeaderPublicoComponent } from './components/layout/headers/header-publico/header-publico.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderGerenteComponent, HeaderComponent, CommonModule, HeaderComponent, HeaderPublicoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'football';
  usuario$: Observable<Usuario | null>;

  constructor(public authService: AuthService) {
    this.usuario$ = this.authService.usuarioObservable();
    this.usuario$.subscribe(usuario => {
      console.log('Usuario emitido:', usuario);
    });
  }

  getTipoUsuario(): string | null {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) return null;
    try {
      console.log("usuario", JSON.parse(usuario));
      return JSON.parse(usuario).tipo;
    } catch {
      return null;
    }
  }
}
