import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FAQComponent implements OnInit {
  activeCategory: string = 'general';

  ngOnInit(): void {
    // Inicializar con la categoría general activa
    this.showCategory('general');
  }

  showCategory(category: string): void {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.category-section');
    sections.forEach(section => {
      section.classList.remove('active');
    });

    // Remover clase active de todas las pestañas
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
      tab.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(category);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Activar la pestaña seleccionada
    const targetTab = document.querySelector(`[data-category="${category}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    this.activeCategory = category;
  }

  contactSupport(): void {
    // Aquí puedes implementar la lógica para contactar soporte
    // Por ejemplo, abrir un modal, redirigir a una página de contacto, etc.
    alert('Función de contacto con soporte. Implementar a Futuro');
  }
}
