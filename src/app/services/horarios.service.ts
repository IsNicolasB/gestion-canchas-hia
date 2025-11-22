import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  private apiUrl = `${environment.apiUrl}/horarios`; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getHorarios() {
    return this.http.get(this.apiUrl);
  }

  getHorarioById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createHorario(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateHorario(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteHorario(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getHorariosReservados(canchaId: string, fecha: string) {
    // Suponiendo que tienes un endpoint así:
    return this.http.get(`${this.apiUrl}/filtrar?canchaId=${canchaId}&fecha=${fecha}`);
  }
}
