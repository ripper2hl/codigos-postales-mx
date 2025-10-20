import { CodigosPostalesMx } from '../src/index';

const apiKey = process.env.RAPIDAPI_KEY;
const describeIfApiKey = apiKey ? describe : describe.skip;

describeIfApiKey('CodigosPostalesMx SDK - Pruebas de Integración (API Real)', () => {
  let client: CodigosPostalesMx;

  jest.setTimeout(20000);

  beforeAll(() => {
    client = new CodigosPostalesMx({ apiKey: apiKey! });
  });

  it('debe obtener una respuesta válida para un código postal real', async () => {
    const cp = '66604';
    const url = `https://codigos-postales-de-mexico1.p.rapidapi.com/v1/colonia/codigopostal/${cp}`;
    console.log(`\n  [INTEGRATION TEST] Buscando colonias para el CP: ${cp}`);
    console.log(`  [INTEGRATION TEST] URL: ${url}`);
    
    const colonias = await client.getColoniasByCodigoPostal(cp);

    expect(Array.isArray(colonias)).toBe(true);
    expect(colonias.length).toBeGreaterThan(0);
    expect(colonias[0]).toHaveProperty('id');
  });

  it('debe devolver un error del API para una colonia que no existe', async () => {
    const idInexistente = 99999999;
    const url = `https://codigos-postales-de-mexico1.p.rapidapi.com/v1/colonia/${idInexistente}`;
    console.log(`\n  [INTEGRATION TEST] Buscando colonia con ID inexistente: ${idInexistente}`);
    console.log(`  [INTEGRATION TEST] URL: ${url}`);
    
    // Usamos una expresión regular para probar el error 500
    await expect(client.getColoniaById(idInexistente)).rejects.toThrow(
      /\[API Error\] 500 Internal Server Error/
    );
  });
});