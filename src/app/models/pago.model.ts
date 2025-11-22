export interface Pago {
  _id?: string;
  importeTotal: number;
  importePendiente: number;
  estado: string;
  mp_preference_id?: string;
  external_reference?: string;
  cancha?: string; // Puede ser ObjectId o un objeto Cancha
  cliente?: string; // Puede ser ObjectId o un objeto Cliente
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  createdAt?: string;
  updatedAt?: string;
} 