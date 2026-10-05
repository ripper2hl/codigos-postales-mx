import { Colonia, Estado, Municipio, CodigoPostal, Ciudad, ZonaTipo, AsentamientoTipo, InegiClaveCiudad, InegiClaveMunicipio, PaginatedResponse } from './models';
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

  // --- COLONIA ---

  public searchColonias(options: { nombre: string; estadoId?: number; municipioId?: number }): Promise<Colonia[]> {
    const { nombre, estadoId, municipioId } = options;
    if (!nombre) return Promise.reject(new Error('El parámetro "nombre" es requerido.'));
    const params = { 'nombre': nombre, 'estado.id': estadoId, 'municipio.id': municipioId };
    return this._request<Colonia[]>('/colonia/search', params);
  }

  public getColoniaById(coloniaId: number): Promise<Colonia> {
    return this._request<Colonia>(`/colonia/${coloniaId}`);
  }

  public listAllColonias(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Colonia>> {
    const { page = 0, size = 33 } = options;
    return this._request<PaginatedResponse<Colonia>>('/colonia/', { page, size });
  }

  public getColoniasByMunicipio(options: { municipioId: number; page?: number; size?: number }): Promise<PaginatedResponse<Colonia>> {
    const { municipioId, page = 0, size = 20 } = options;
    if (!municipioId) return Promise.reject(new Error('El parámetro "municipioId" es requerido.'));
    return this._request<PaginatedResponse<Colonia>>(`/colonia/municipio/${municipioId}`, { page, size });
  }

  public getColoniasByCodigoPostal(codigoPostal: string): Promise<Colonia[]> {
    return this._request<Colonia[]>(`/colonia/codigopostal/${codigoPostal}`);
  }

  // --- ESTADO ---

  public getEstadoById(estadoId: number): Promise<Estado> {
    return this._request<Estado>(`/estado/${estadoId}`);
  }

  public listAllEstados(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Estado>> {
    const { page = 0, size = 32 } = options;
    return this._request<PaginatedResponse<Estado>>('/estado/', { page, size });
  }

  public getEstadoByName(nombre: string): Promise<Estado[]> {
    return this._request<Estado[]>(`/estado/name/${encodeURIComponent(nombre)}`);
  }

  // --- MUNICIPIO ---

  public getMunicipioById(municipioId: number): Promise<Municipio> {
    return this._request<Municipio>(`/municipio/${municipioId}`);
  }

  public listAllMunicipios(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Municipio>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<Municipio>>('/municipio/', { page, size });
  }

  public getMunicipiosByEstado(options: { estadoId: number; page?: number; size?: number }): Promise<PaginatedResponse<Municipio>> {
    const { estadoId, page = 0, size = 20 } = options;
    if (!estadoId) return Promise.reject(new Error('El parámetro "estadoId" es requerido.'));
    return this._request<PaginatedResponse<Municipio>>(`/municipio/estado/${estadoId}`, { page, size });
  }

  public getMunicipioByName(nombre: string): Promise<Municipio[]> {
    return this._request<Municipio[]>(`/municipio/name/${encodeURIComponent(nombre)}`);
  }

  // --- CODIGO POSTAL ---

  public getCodigoPostalById(id: number): Promise<CodigoPostal> {
    return this._request<CodigoPostal>(`/codigopostal/${id}`);
  }

  public listAllCodigosPostales(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<CodigoPostal>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<CodigoPostal>>('/codigopostal/', { page, size });
  }

  public getCodigoPostalByName(nombre: string): Promise<CodigoPostal[]> {
    return this._request<CodigoPostal[]>(`/codigopostal/name/${encodeURIComponent(nombre)}`);
  }

  // --- CIUDAD ---

  public getCiudadById(id: number): Promise<Ciudad> {
    return this._request<Ciudad>(`/ciudad/${id}`);
  }

  public listAllCiudades(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Ciudad>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<Ciudad>>('/ciudad/', { page, size });
  }

  public getCiudadByName(nombre: string): Promise<Ciudad[]> {
    return this._request<Ciudad[]>(`/ciudad/name/${encodeURIComponent(nombre)}`);
  }

  // --- ZONA TIPO ---

  public getZonaTipoById(id: number): Promise<ZonaTipo> {
    return this._request<ZonaTipo>(`/zonatipo/${id}`);
  }

  public listAllZonasTipo(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<ZonaTipo>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<ZonaTipo>>('/zonatipo/', { page, size });
  }

  public getZonaTipoByName(nombre: string): Promise<ZonaTipo[]> {
    return this._request<ZonaTipo[]>(`/zonatipo/name/${encodeURIComponent(nombre)}`);
  }

  // --- ASENTAMIENTO TIPO ---

  public getAsentamientoTipoById(id: number): Promise<AsentamientoTipo> {
    return this._request<AsentamientoTipo>(`/asentamientotipo/${id}`);
  }

  public listAllAsentamientosTipo(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<AsentamientoTipo>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<AsentamientoTipo>>('/asentamientotipo/', { page, size });
  }

  public getAsentamientoTipoByName(nombre: string): Promise<AsentamientoTipo[]> {
    return this._request<AsentamientoTipo[]>(`/asentamientotipo/name/${encodeURIComponent(nombre)}`);
  }

  // --- INEGI CLAVE CIUDAD ---

  public getInegiClaveCiudadById(id: number): Promise<InegiClaveCiudad> {
    return this._request<InegiClaveCiudad>(`/inegiclaveciudad/${id}`);
  }

  public listAllInegiClavesCiudad(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<InegiClaveCiudad>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<InegiClaveCiudad>>('/inegiclaveciudad/', { page, size });
  }

  public getInegiClaveCiudadByName(nombre: string): Promise<InegiClaveCiudad[]> {
    return this._request<InegiClaveCiudad[]>(`/inegiclaveciudad/name/${encodeURIComponent(nombre)}`);
  }

  // --- INEGI CLAVE MUNICIPIO ---

  public getInegiClaveMunicipioById(id: number): Promise<InegiClaveMunicipio> {
    return this._request<InegiClaveMunicipio>(`/inegiclavemunicipio/${id}`);
  }

  public listAllInegiClavesMunicipio(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<InegiClaveMunicipio>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<InegiClaveMunicipio>>('/inegiclavemunicipio/', { page, size });
  }

  public getInegiClaveMunicipioByName(nombre: string): Promise<InegiClaveMunicipio[]> {
    return this._request<InegiClaveMunicipio[]>(`/inegiclavemunicipio/name/${encodeURIComponent(nombre)}`);
  }
}
