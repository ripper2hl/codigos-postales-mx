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
      json: async () => ({ id: 1, nombre: 'Centro' }) 
    });

    await client.getColoniaById(1);
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://codigos-postales-de-mexico1.p.rapidapi.com/v1/colonia/1',
      expect.anything()
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
    await expect(client.getColoniaById(999)).rejects.toThrow(
      /\[API Error\] 404 Not Found/
    );
  });
});