// src/models.ts

export interface Estado {
  id: number;
  nombre: string;
  inegiClave?: string; 
}

export interface Municipio {
  id: number;
  nombre: string;
}

export interface CodigoPostal {
  id: number;
  nombre: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
}

export interface ZonaTipo {
  id: number;
  nombre: string;
}

export interface AsentamientoTipo {
  id: number;
  nombre: string;
  sepomexClave?: string;
}

export interface InegiClaveCiudad {
  id: number;
  nombre: string;
}

export interface InegiClaveMunicipio {
  id: number;
  nombre: string;
}

export interface Colonia {
  id: number;
  nombre: string;
  estado?: Estado;
  municipio?: Municipio;
  codigoPostal?: CodigoPostal;
  ciudad?: Ciudad;
  zonaTipo?: ZonaTipo;
  asentamientoTipo?: AsentamientoTipo;
  inegiClaveCiudad?: InegiClaveCiudad;
  inegiClaveMunicipio?: InegiClaveMunicipio;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}