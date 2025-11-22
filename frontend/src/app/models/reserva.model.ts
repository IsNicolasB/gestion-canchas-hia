import { Pago } from "./pago.model";

export interface Cancha {
  _id: string;
  nombre: string;
  dimensiones: string;
  estado: string;
  imagen: string;
  precioPorHora: number;
  tipo: string;
  ubicacion: string;
  __v?: number;
}

export interface Reserva {
  _id?: string;
  horariosReservados?: string[]; // Array de ObjectId de Horario
  cancha?: Cancha; // Puede ser ObjectId o un objeto Cancha
  cliente?: string; // Puede ser ObjectId o un objeto Cliente
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  pago?: Pago; // Puede ser ObjectId o un objeto Pago
} 