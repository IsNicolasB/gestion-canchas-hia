import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pago } from '../models/pago.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  private apiUrl = `${environment.apiUrl}/pagos`; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getPagos() {
    return this.http.get(this.apiUrl);
  }

  getPagoById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPago(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  createPagoMercadoPago(data: any) {
    return this.http.post(`${this.apiUrl}/mercadopago`, data);
  }

  updatePago(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deletePago(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerPagosPorCliente(clienteId: string): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }
}
