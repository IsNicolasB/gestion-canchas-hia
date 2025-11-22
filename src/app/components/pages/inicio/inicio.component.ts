import { Component, AfterViewInit, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit {
  private animationStarted = false;
  private countersAnimated = false;
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Verificar si el usuario está autenticado
    this.checkAuthentication();
    
    // Suscribirse a cambios en el estado de autenticación
    this.authService.usuarioObservable().subscribe(() => {
      this.checkAuthentication();
    });
  }

  ngAfterViewInit() {
    this.setupCounterAnimation();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (!this.animationStarted) {
      this.checkIfCountersInView();
    }
  }

  private checkAuthentication() {
    // Usa el método del servicio que ya existe
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  private setupCounterAnimation() {
    // Verificar si los contadores ya están visibles al cargar la página
    setTimeout(() => {
      this.checkIfCountersInView();
    }, 500);
  }

  private checkIfCountersInView() {
    const counterSection = document.querySelector('.counter-item');
    if (!counterSection) return;

    const rect = counterSection.getBoundingClientRect();
    const isInView = (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );

    if (isInView && !this.countersAnimated) {
      this.animateCounters();
      this.countersAnimated = true;
      this.animationStarted = true;
    }
  }

  private animateCounters() {
    const counterElements = document.querySelectorAll('.counter-number');
    const duration = 2000; // Duración total de la animación en ms
    const frameDuration = 1000 / 60; // 60fps
    
    counterElements.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target') || '0');
      const isDecimal = counter.getAttribute('data-target')?.includes('.');
      const startTime = performance.now();
      
      // Inicializar el contador
      counter.textContent = '0';
      if (isDecimal) counter.textContent = '0.0';
      
      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Calcular el valor actual basado en el progreso
        let currentValue = progress * target;
        
        // Asegurarse de no exceder el valor objetivo
        if (currentValue > target) currentValue = target;
        
        // Actualizar el texto del contador
        if (isDecimal) {
          counter.textContent = currentValue.toFixed(1);
        } else {
          counter.textContent = Math.floor(currentValue).toString();
        }
        
        // Continuar la animación si no ha terminado
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Asegurar el valor final exacto
          counter.textContent = isDecimal ? target.toFixed(1) : target.toString();
        }
      };
      
      // Iniciar la animación
      requestAnimationFrame(animate);
    });
  }
}