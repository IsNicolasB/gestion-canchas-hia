import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CanchasService {

  private apiUrl = `${environment.apiUrl}/canchas`; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getCanchas() {
    return this.http.get(this.apiUrl);
  }

  getCanchaById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCancha(data: any, token?: string) {
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, data, { headers });
  }

  updateCancha(id: string, data: any, token?: string) {
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers });
  }

  deleteCancha(id: string, token?: string) {
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}
