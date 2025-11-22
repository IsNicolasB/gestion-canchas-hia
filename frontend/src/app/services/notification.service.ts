import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  showSuccess(message: string): void {
    // Por ahora usamos alert, pero podrías implementar un sistema de notificaciones más elegante
    alert(`✅ ${message}`);
  }

  showError(message: string): void {
    alert(`❌ ${message}`);
  }

  showWarning(message: string): void {
    alert(`⚠️ ${message}`);
  }

  showInfo(message: string): void {
    alert(`ℹ️ ${message}`);
  }
} 