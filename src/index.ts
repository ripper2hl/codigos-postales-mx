import {
  Colonia,
  Estado,
  Municipio,
  CodigoPostal,
  Ciudad,
  ZonaTipo,
  AsentamientoTipo,
  InegiClaveCiudad,
  InegiClaveMunicipio,
  PaginatedResponse,
} from './models';
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
      'X-RapidAPI-Host': CodigosPostalesMx.DEFAULT_HOST,
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
        signal: AbortSignal.timeout(this.timeout),
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
          url.toString(),
        );
      }

      return (await response.json()) as T;
    } catch (error: any) {
      if (error instanceof CodigosPostalesApiError) {
        throw error;
      }
      if (error?.name === 'TimeoutError') {
        throw new CodigosPostalesApiError(
          `La petición excedió el tiempo límite de ${this.timeout}ms`,
          undefined,
          url.toString(),
        );
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new CodigosPostalesApiError(`Falló la solicitud: ${message}`, undefined, url.toString());
    }
  }

  // --- COLONIA ---

  /**
   * Busca colonias por nombre, con filtros opcionales.
   * @param options Objeto con el nombre (requerido) y los IDs de estado y municipio (opcionales).
   * @returns Lista de colonias que coinciden con la búsqueda.
   */
  public searchColonias(options: { nombre: string; estadoId?: number; municipioId?: number }): Promise<Colonia[]> {
    const { nombre, estadoId, municipioId } = options;
    if (!nombre) return Promise.reject(new Error('El parámetro "nombre" es requerido.'));
    const params = { nombre: nombre, 'estado.id': estadoId, 'municipio.id': municipioId };
    return this._request<Colonia[]>('/colonia/search', params);
  }

  /**
   * Obtiene los detalles de una colonia específica por su ID.
   * @param coloniaId ID único de la colonia.
   * @returns Detalles de la colonia.
   */
  public getColoniaById(coloniaId: number): Promise<Colonia> {
    return this._request<Colonia>(`/colonia/${coloniaId}`);
  }

  /**
   * Obtiene una lista paginada de todas las colonias registradas.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada con la lista de colonias.
   */
  public listAllColonias(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Colonia>> {
    const { page = 0, size = 33 } = options;
    return this._request<PaginatedResponse<Colonia>>('/colonia/', { page, size });
  }

  /**
   * Obtiene una lista paginada de las colonias que pertenecen a un municipio específico.
   * @param options Objeto con el municipioId (requerido) y opciones de paginación.
   * @returns Respuesta paginada con la lista de colonias.
   */
  public getColoniasByMunicipio(options: {
    municipioId: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Colonia>> {
    const { municipioId, page = 0, size = 20 } = options;
    if (!municipioId) return Promise.reject(new Error('El parámetro "municipioId" es requerido.'));
    return this._request<PaginatedResponse<Colonia>>(`/colonia/municipio/${municipioId}`, { page, size });
  }

  /**
   * Obtiene la lista de colonias asociadas a un código postal específico.
   * @param codigoPostal Código postal de 5 dígitos.
   * @returns Lista de colonias asociadas al código postal.
   */
  public getColoniasByCodigoPostal(codigoPostal: string): Promise<Colonia[]> {
    return this._request<Colonia[]>(`/colonia/codigopostal/${codigoPostal}`);
  }

  // --- ESTADO ---

  /**
   * Obtiene los detalles de un estado por su ID.
   * @param estadoId ID único del estado.
   * @returns Detalles del estado.
   */
  public getEstadoById(estadoId: number): Promise<Estado> {
    return this._request<Estado>(`/estado/${estadoId}`);
  }

  /**
   * Obtiene una lista paginada de todos los estados.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada con la lista de estados.
   */
  public listAllEstados(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Estado>> {
    const { page = 0, size = 32 } = options;
    return this._request<PaginatedResponse<Estado>>('/estado/', { page, size });
  }

  /**
   * Busca estados que coincidan con el nombre especificado.
   * @param nombre Nombre del estado a buscar.
   * @returns Lista de estados encontrados.
   */
  public getEstadoByName(nombre: string): Promise<Estado[]> {
    return this._request<Estado[]>(`/estado/name/${encodeURIComponent(nombre)}`);
  }

  // --- MUNICIPIO ---

  /**
   * Obtiene los detalles de un municipio por su ID.
   * @param municipioId ID único del municipio.
   * @returns Detalles del municipio.
   */
  public getMunicipioById(municipioId: number): Promise<Municipio> {
    return this._request<Municipio>(`/municipio/${municipioId}`);
  }

  /**
   * Obtiene una lista paginada de todos los municipios.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada con la lista de municipios.
   */
  public listAllMunicipios(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Municipio>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<Municipio>>('/municipio/', { page, size });
  }

  /**
   * Obtiene una lista paginada de los municipios pertenecientes a un estado específico.
   * @param options Objeto con el estadoId (requerido) y opciones de paginación.
   * @returns Respuesta paginada con la lista de municipios.
   */
  public getMunicipiosByEstado(options: {
    estadoId: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Municipio>> {
    const { estadoId, page = 0, size = 20 } = options;
    if (!estadoId) return Promise.reject(new Error('El parámetro "estadoId" es requerido.'));
    return this._request<PaginatedResponse<Municipio>>(`/municipio/estado/${estadoId}`, { page, size });
  }

  /**
   * Busca municipios que coincidan con el nombre especificado.
   * @param nombre Nombre del municipio a buscar.
   * @returns Lista de municipios encontrados.
   */
  public getMunicipioByName(nombre: string): Promise<Municipio[]> {
    return this._request<Municipio[]>(`/municipio/name/${encodeURIComponent(nombre)}`);
  }

  // --- CODIGO POSTAL ---

  /**
   * Obtiene los detalles de un código postal por su ID interno.
   * @param id ID interno del código postal.
   * @returns Detalles del código postal.
   */
  public getCodigoPostalById(id: number): Promise<CodigoPostal> {
    return this._request<CodigoPostal>(`/codigopostal/${id}`);
  }

  /**
   * Obtiene una lista paginada de todos los códigos postales.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada.
   */
  public listAllCodigosPostales(
    options: { page?: number; size?: number } = {},
  ): Promise<PaginatedResponse<CodigoPostal>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<CodigoPostal>>('/codigopostal/', { page, size });
  }

  /**
   * Busca códigos postales que coincidan con la cadena especificada.
   * @param nombre Cadena del código postal a buscar.
   * @returns Lista de códigos postales encontrados.
   */
  public getCodigoPostalByName(nombre: string): Promise<CodigoPostal[]> {
    return this._request<CodigoPostal[]>(`/codigopostal/name/${encodeURIComponent(nombre)}`);
  }

  // --- CIUDAD ---

  /**
   * Obtiene los detalles de una ciudad por su ID.
   * @param id ID único de la ciudad.
   * @returns Detalles de la ciudad.
   */
  public getCiudadById(id: number): Promise<Ciudad> {
    return this._request<Ciudad>(`/ciudad/${id}`);
  }

  /**
   * Obtiene una lista paginada de todas las ciudades.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada con la lista de ciudades.
   */
  public listAllCiudades(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Ciudad>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<Ciudad>>('/ciudad/', { page, size });
  }

  /**
   * Busca ciudades que coincidan con el nombre especificado.
   * @param nombre Nombre de la ciudad a buscar.
   * @returns Lista de ciudades encontradas.
   */
  public getCiudadByName(nombre: string): Promise<Ciudad[]> {
    return this._request<Ciudad[]>(`/ciudad/name/${encodeURIComponent(nombre)}`);
  }

  // --- ZONA TIPO ---

  /**
   * Obtiene los detalles de un tipo de zona por su ID.
   * @param id ID único del tipo de zona.
   * @returns Detalles de la zona.
   */
  public getZonaTipoById(id: number): Promise<ZonaTipo> {
    return this._request<ZonaTipo>(`/zonatipo/${id}`);
  }

  /**
   * Obtiene una lista paginada de todos los tipos de zonas.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada.
   */
  public listAllZonasTipo(options: { page?: number; size?: number } = {}): Promise<PaginatedResponse<ZonaTipo>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<ZonaTipo>>('/zonatipo/', { page, size });
  }

  /**
   * Busca tipos de zonas que coincidan con el nombre especificado.
   * @param nombre Nombre a buscar.
   * @returns Lista de tipos de zona.
   */
  public getZonaTipoByName(nombre: string): Promise<ZonaTipo[]> {
    return this._request<ZonaTipo[]>(`/zonatipo/name/${encodeURIComponent(nombre)}`);
  }

  // --- ASENTAMIENTO TIPO ---

  /**
   * Obtiene los detalles de un tipo de asentamiento por su ID.
   * @param id ID único del tipo de asentamiento.
   * @returns Detalles del tipo de asentamiento.
   */
  public getAsentamientoTipoById(id: number): Promise<AsentamientoTipo> {
    return this._request<AsentamientoTipo>(`/asentamientotipo/${id}`);
  }

  /**
   * Obtiene una lista paginada de todos los tipos de asentamientos.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada.
   */
  public listAllAsentamientosTipo(
    options: { page?: number; size?: number } = {},
  ): Promise<PaginatedResponse<AsentamientoTipo>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<AsentamientoTipo>>('/asentamientotipo/', { page, size });
  }

  /**
   * Busca tipos de asentamiento que coincidan con el nombre especificado.
   * @param nombre Nombre a buscar.
   * @returns Lista de tipos de asentamiento.
   */
  public getAsentamientoTipoByName(nombre: string): Promise<AsentamientoTipo[]> {
    return this._request<AsentamientoTipo[]>(`/asentamientotipo/name/${encodeURIComponent(nombre)}`);
  }

  // --- INEGI CLAVE CIUDAD ---

  /**
   * Obtiene los detalles de una clave INEGI de ciudad por su ID.
   * @param id ID único.
   * @returns Detalles.
   */
  public getInegiClaveCiudadById(id: number): Promise<InegiClaveCiudad> {
    return this._request<InegiClaveCiudad>(`/inegiclaveciudad/${id}`);
  }

  /**
   * Obtiene una lista paginada de las claves INEGI de ciudad.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada.
   */
  public listAllInegiClavesCiudad(
    options: { page?: number; size?: number } = {},
  ): Promise<PaginatedResponse<InegiClaveCiudad>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<InegiClaveCiudad>>('/inegiclaveciudad/', { page, size });
  }

  /**
   * Busca claves INEGI de ciudad por nombre.
   * @param nombre Nombre a buscar.
   * @returns Lista.
   */
  public getInegiClaveCiudadByName(nombre: string): Promise<InegiClaveCiudad[]> {
    return this._request<InegiClaveCiudad[]>(`/inegiclaveciudad/name/${encodeURIComponent(nombre)}`);
  }

  // --- INEGI CLAVE MUNICIPIO ---

  /**
   * Obtiene los detalles de una clave INEGI de municipio por su ID.
   * @param id ID único.
   * @returns Detalles.
   */
  public getInegiClaveMunicipioById(id: number): Promise<InegiClaveMunicipio> {
    return this._request<InegiClaveMunicipio>(`/inegiclavemunicipio/${id}`);
  }

  /**
   * Obtiene una lista paginada de las claves INEGI de municipio.
   * @param options Opciones de paginación (page, size).
   * @returns Respuesta paginada.
   */
  public listAllInegiClavesMunicipio(
    options: { page?: number; size?: number } = {},
  ): Promise<PaginatedResponse<InegiClaveMunicipio>> {
    const { page = 0, size = 50 } = options;
    return this._request<PaginatedResponse<InegiClaveMunicipio>>('/inegiclavemunicipio/', { page, size });
  }

  /**
   * Busca claves INEGI de municipio por nombre.
   * @param nombre Nombre a buscar.
   * @returns Lista.
   */
  public getInegiClaveMunicipioByName(nombre: string): Promise<InegiClaveMunicipio[]> {
    return this._request<InegiClaveMunicipio[]>(`/inegiclavemunicipio/name/${encodeURIComponent(nombre)}`);
  }
}
