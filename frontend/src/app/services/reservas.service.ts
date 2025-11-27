import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {



  private apiUrl = `${environment.apiUrl}/reservas`; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getReservas(page: number = 1, limit: number = 10) {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getReservaById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getReservasPorClienteYFecha(nombreCliente: string, fecha?: string) {
    let params = new HttpParams().set('nombre', nombreCliente);
    
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }
  createReserva(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateReserva(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteReserva(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerReservasPorCliente(clienteId: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }
}
