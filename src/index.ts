import { Colonia, Estado, Municipio, PaginatedResponse } from './models';

/**
 * Opciones para inicializar el cliente del SDK.
 */
interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Clase principal del SDK para interactuar con la API de Códigos Postales de México.
 */
export class CodigosPostalesMx {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  private static readonly DEFAULT_BASE_URL = 'https://codigos-postales-de-mexico1.p.rapidapi.com/v1';
  private static readonly DEFAULT_HOST = 'codigos-postales-de-mexico1.p.rapidapi.com';

  constructor(options: ClientOptions) {
    if (!options.apiKey) {
      throw new Error('La opción "apiKey" es requerida para inicializar el SDK.');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || CodigosPostalesMx.DEFAULT_BASE_URL;

    this.headers = {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': CodigosPostalesMx.DEFAULT_HOST
    };
  }

  /**
   * Método privado para realizar solicitudes a la API.
   */
  private async _request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({ message: 'No se pudo obtener más información del error.' }));
        throw new Error(`[API Error] ${response.status} ${response.statusText}: ${JSON.stringify(errorInfo)}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[CodigosPostalesMx-SDK] Falló la solicitud: ${error.message}`);
      }
      throw error;
    }
  }

  // --- Métodos Públicos ---

  public searchColonias(options: { nombre: string; estadoId?: number; municipioId?: number }): Promise<Colonia[]> {
    const { nombre, estadoId, municipioId } = options;
    if (!nombre) {
      return Promise.reject(new Error('El parámetro "nombre" es requerido.'));
    }
    const params = { 'nombre': nombre, 'estado.id': estadoId, 'municipio.id': municipioId };
    return this._request<Colonia[]>('/colonia/search', params);
  }

  public getColoniaById(coloniaId: number): Promise<Colonia> {
    return this._request<Colonia>(`/colonia/${coloniaId}`);
  }

  public listAllColonias(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Colonia>> {
    const { page = 0, size = 33 } = options;
    return this._request<PaginatedResponse<Colonia>>('/colonia', { page, size });
  }

  public getColoniasByMunicipio(options: { municipioId: number; page?: number; size?: number }): Promise<PaginatedResponse<Colonia>> {
    const { municipioId, page = 0, size = 20 } = options;
    if (!municipioId) {
      return Promise.reject(new Error('El parámetro "municipioId" es requerido.'));
    }
    return this._request<PaginatedResponse<Colonia>>(`/colonia/municipio/${municipioId}`, { page, size });
  }

  public getColoniasByCodigoPostal(codigoPostal: string): Promise<Colonia[]> {
    return this._request<Colonia[]>(`/colonia/codigopostal/${codigoPostal}`);
  }

  public getMunicipiosByEstado(options: { estadoId: number; page?: number; size?: number }): Promise<PaginatedResponse<Municipio>> {
    const { estadoId, page = 0, size = 20 } = options;
    if (!estadoId) {
      return Promise.reject(new Error('El parámetro "estadoId" es requerido.'));
    }
    return this._request<PaginatedResponse<Municipio>>(`/municipio/estado/${estadoId}`, { page, size });
  }

  // --- NUEVO MÉTODO AÑADIDO ---
  /**
   * Obtiene una lista paginada de todos los estados de México.
   * Corresponde a: GET /v1/estado/
   * @param options Opciones de paginación (page, size).
   * @returns Una promesa que se resuelve con la lista paginada de estados.
   */
  public listAllEstados(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Estado>> {
    // El OpenAPI indica que el endpoint es /v1/estado/
    // Usaremos un tamaño de página por defecto de 32 (el número de estados en México)
    const { page = 0, size = 32 } = options;
    return this._request<PaginatedResponse<Estado>>('/estado/', { page, size });
  }
}