import { CodigosPostalesMx } from '../src/index';

// Hacemos un mock global de la función fetch para este archivo de pruebas.
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('CodigosPostalesMx SDK - Pruebas Unitarias (Mock)', () => {
  let client: CodigosPostalesMx;

  beforeEach(() => {
    // Limpiamos el mock antes de cada prueba
    mockFetch.mockClear();
    client = new CodigosPostalesMx({ apiKey: 'test-api-key' });
  });

  it('debe lanzar un error si no se proporciona una apiKey', () => {
    // @ts-ignore
    expect(() => new CodigosPostalesMx({})).toThrow('La opción "apiKey" es requerida para inicializar el SDK.');
  });

  it('debe llamar a fetch con la URL y cabeceras correctas', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, nombre: 'Centro' }),
    });

    await client.getColoniaById(1);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://codigos-postales-de-mexico1.p.rapidapi.com/v1/colonia/1',
      expect.anything(),
    );
  });

  it('debe manejar errores del API correctamente', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'No encontrado' }),
    });

    // Usamos una expresión regular para una prueba más robusta
    await expect(client.getColoniaById(999)).rejects.toThrow(/\[API Error\] 404 Not Found/);
  });

  it('debe manejar errores genéricos de red', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));
    await expect(client.getColoniaById(999)).rejects.toThrow(/Falló la solicitud: Network Error/);
  });

  it('debe manejar errores del API cuando no devuelve un JSON válido', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(client.getColoniaById(999)).rejects.toThrow(/\[API Error\] 502 Bad Gateway: Bad Gateway/);
  });

  it('debe lanzar error si no se manda el municipioId en getColoniasByMunicipio', async () => {
    // @ts-ignore
    await expect(client.getColoniasByMunicipio({})).rejects.toThrow('El parámetro "municipioId" es requerido.');
  });

  it('debe lanzar error si no se manda el estadoId en getMunicipiosByEstado', async () => {
    // @ts-ignore
    await expect(client.getMunicipiosByEstado({})).rejects.toThrow('El parámetro "estadoId" es requerido.');
  });

  it('debe lanzar error si no se manda el nombre en searchColonias', async () => {
    // @ts-ignore
    await expect(client.searchColonias({})).rejects.toThrow('El parámetro "nombre" es requerido.');
  });

  it('debe llamar a las rutas correctas para todos los métodos getById', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    await client.getEstadoById(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/estado/1'), expect.anything());

    await client.getMunicipioById(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/municipio/1'), expect.anything());

    await client.getCodigoPostalById(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/codigopostal/1'), expect.anything());

    await client.getCiudadById(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/ciudad/1'), expect.anything());

    await client.getZonaTipoById(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/zonatipo/1'), expect.anything());

    await client.getAsentamientoTipoById(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/asentamientotipo/1'), expect.anything());

    await client.getInegiClaveCiudadById(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/inegiclaveciudad/1'), expect.anything());

    await client.getInegiClaveMunicipioById(1);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/inegiclavemunicipio/1'), expect.anything());
  });

  it('debe llamar a las rutas correctas para todos los métodos getByName', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
    const n = 'Test';

    await client.getEstadoByName(n);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/estado/name/${n}`), expect.anything());

    await client.getMunicipioByName(n);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/municipio/name/${n}`), expect.anything());

    await client.getCodigoPostalByName(n);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/codigopostal/name/${n}`), expect.anything());

    await client.getCiudadByName(n);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/ciudad/name/${n}`), expect.anything());

    await client.getZonaTipoByName(n);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/zonatipo/name/${n}`), expect.anything());

    await client.getAsentamientoTipoByName(n);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/asentamientotipo/name/${n}`), expect.anything());

    await client.getInegiClaveCiudadByName(n);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/inegiclaveciudad/name/${n}`), expect.anything());

    await client.getInegiClaveMunicipioByName(n);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/inegiclavemunicipio/name/${n}`),
      expect.anything(),
    );
  });

  it('debe llamar a las rutas correctas para todos los métodos listAll', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ content: [] }) });

    await client.listAllColonias({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/colonia/?page=1&size=10'), expect.anything());

    await client.listAllEstados({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/estado/?page=1&size=10'), expect.anything());

    await client.listAllMunicipios({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/municipio/?page=1&size=10'), expect.anything());

    await client.listAllCodigosPostales({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/codigopostal/?page=1&size=10'), expect.anything());

    await client.listAllCiudades({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/ciudad/?page=1&size=10'), expect.anything());

    await client.listAllZonasTipo({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/zonatipo/?page=1&size=10'), expect.anything());

    await client.listAllAsentamientosTipo({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/asentamientotipo/?page=1&size=10'),
      expect.anything(),
    );

    await client.listAllInegiClavesCiudad({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/inegiclaveciudad/?page=1&size=10'),
      expect.anything(),
    );

    await client.listAllInegiClavesMunicipio({ page: 1, size: 10 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/inegiclavemunicipio/?page=1&size=10'),
      expect.anything(),
    );
  });
});
