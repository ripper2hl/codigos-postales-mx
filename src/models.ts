// Define la estructura de los objetos que devuelve el API

export interface Estado {
  id: number;
  nombre: string;
}

export interface Municipio {
  id: number;
  nombre: string;
}

export interface CodigoPostal {
  id: number;
  nombre: string;
}

export interface Colonia {
  id: number;
  nombre: string;
  estado?: Estado;
  municipio?: Municipio;
  codigoPostal?: CodigoPostal;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}