import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header-gerente',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-gerente.component.html',
  styleUrls: ['./header-gerente.component.css']
})
export class HeaderGerenteComponent {
  usuario: any = null;

  constructor(private router: Router, private authService: AuthService) {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        this.usuario = JSON.parse(usuarioStr);
      } catch {
        this.usuario = null;
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
