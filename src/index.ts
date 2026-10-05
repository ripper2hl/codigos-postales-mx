import { Colonia, Estado, Municipio, PaginatedResponse } from './models';
import { CodigosPostalesApiError } from './errors';

export * from './models';
export * from './errors';

/**
 * Opciones para inicializar el cliente del SDK.
 */
export interface ClientOptions {
  /**
   * Tu clave de API de RapidAPI.
   */
  apiKey: string;
  /**
   * URL base de la API. Normalmente no es necesario cambiarla.
   */
  baseUrl?: string;
  /**
   * Tiempo máximo de espera en milisegundos para las peticiones.
   * Por defecto es 10000 (10 segundos).
   */
  timeout?: number;
}

/**
 * Clase principal del SDK para interactuar con la API de Códigos Postales de México.
 */
export class CodigosPostalesMx {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly headers: Record<string, string>;

  private static readonly DEFAULT_BASE_URL = 'https://codigos-postales-de-mexico1.p.rapidapi.com/v1';
  private static readonly DEFAULT_HOST = 'codigos-postales-de-mexico1.p.rapidapi.com';

  constructor(options: ClientOptions) {
    if (!options.apiKey) {
      throw new Error('La opción "apiKey" es requerida para inicializar el SDK.');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || CodigosPostalesMx.DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? 10000;

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
        headers: this.headers,
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorInfo = await response.json();
          errorMessage = JSON.stringify(errorInfo);
        } catch {
          // Ignore json parse error
        }
        throw new CodigosPostalesApiError(
          `[API Error] ${response.status} ${response.statusText}: ${errorMessage}`,
          response.status,
          url.toString()
        );
      }

      return await response.json() as T;
    } catch (error: any) {
      if (error instanceof CodigosPostalesApiError) {
        throw error;
      }
      if (error?.name === 'TimeoutError') {
        throw new CodigosPostalesApiError(`La petición excedió el tiempo límite de ${this.timeout}ms`, undefined, url.toString());
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new CodigosPostalesApiError(`Falló la solicitud: ${message}`, undefined, url.toString());
    }
  }

  // --- Métodos Públicos ---

  /**
   * Busca colonias por nombre, opcionalmente filtrando por estado o municipio.
   * @param options Opciones de búsqueda (nombre requerido, estadoId y municipioId opcionales).
   * @returns Una promesa que se resuelve con la lista de colonias encontradas.
   */
  public searchColonias(options: { nombre: string; estadoId?: number; municipioId?: number }): Promise<Colonia[]> {
    const { nombre, estadoId, municipioId } = options;
    if (!nombre) {
      return Promise.reject(new Error('El parámetro "nombre" es requerido.'));
    }
    const params = { 'nombre': nombre, 'estado.id': estadoId, 'municipio.id': municipioId };
    return this._request<Colonia[]>('/colonia/search', params);
  }

  /**
   * Obtiene los detalles de una colonia específica por su identificador único.
   * @param coloniaId ID de la colonia.
   * @returns Una promesa que se resuelve con los detalles de la colonia.
   */
  public getColoniaById(coloniaId: number): Promise<Colonia> {
    return this._request<Colonia>(`/colonia/${coloniaId}`);
  }

  /**
   * Lista todas las colonias registradas en México de forma paginada.
   * @param options Opciones de paginación (page, size).
   * @returns Una promesa que se resuelve con la lista paginada de colonias.
   */
  public listAllColonias(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Colonia>> {
    const { page = 0, size = 33 } = options;
    return this._request<PaginatedResponse<Colonia>>('/colonia/', { page, size });
  }

  /**
   * Lista de forma paginada las colonias pertenecientes a un municipio específico.
   * @param options Objeto con el municipioId (requerido) y opciones de paginación (page, size).
   * @returns Una promesa que se resuelve con la lista paginada de colonias.
   */
  public getColoniasByMunicipio(options: { municipioId: number; page?: number; size?: number }): Promise<PaginatedResponse<Colonia>> {
    const { municipioId, page = 0, size = 20 } = options;
    if (!municipioId) {
      return Promise.reject(new Error('El parámetro "municipioId" es requerido.'));
    }
    return this._request<PaginatedResponse<Colonia>>(`/colonia/municipio/${municipioId}`, { page, size });
  }

  /**
   * Lista todas las colonias que comparten un mismo código postal.
   * @param codigoPostal Código postal (5 dígitos).
   * @returns Una promesa que se resuelve con la lista de colonias correspondientes al código postal.
   */
  public getColoniasByCodigoPostal(codigoPostal: string): Promise<Colonia[]> {
    return this._request<Colonia[]>(`/colonia/codigopostal/${codigoPostal}`);
  }

  /**
   * Obtiene una lista paginada de los municipios pertenecientes a un estado específico.
   * @param options Objeto con el estadoId (requerido) y opciones de paginación (page, size).
   * @returns Una promesa que se resuelve con la lista paginada de municipios.
   */
  public getMunicipiosByEstado(options: { estadoId: number; page?: number; size?: number }): Promise<PaginatedResponse<Municipio>> {
    const { estadoId, page = 0, size = 20 } = options;
    if (!estadoId) {
      return Promise.reject(new Error('El parámetro "estadoId" es requerido.'));
    }
    return this._request<PaginatedResponse<Municipio>>(`/municipio/estado/${estadoId}`, { page, size });
  }

  /**
   * Obtiene una lista paginada de todos los estados de México.
   * Corresponde a: GET /v1/estado/
   * @param options Opciones de paginación (page, size).
   * @returns Una promesa que se resuelve con la lista paginada de estados.
   */
  public listAllEstados(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Estado>> {
    // Usaremos un tamaño de página por defecto de 32 (el número de estados en México)
    const { page = 0, size = 32 } = options;
    return this._request<PaginatedResponse<Estado>>('/estado/', { page, size });
  }
}