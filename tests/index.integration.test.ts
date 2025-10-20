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

  it('debe obtener los detalles de una colonia específica por un ID válido', async () => {
    const idValido = 88724; // ID de Cañada Blanca
    const url = `https://codigos-postales-de-mexico1.p.rapidapi.com/v1/colonia/${idValido}`;
    console.log(`\n  [INTEGRATION TEST] Buscando colonia con ID válido: ${idValido}`);
    console.log(`  [INTEGRATION TEST] URL: ${url}`);
    
    const colonia = await client.getColoniaById(idValido);
    
    // Verificamos que la respuesta sea un objeto y tenga las propiedades esperadas
    expect(colonia).toBeDefined();
    expect(typeof colonia).toBe('object');
    expect(colonia.id).toBe(idValido);
    expect(colonia.nombre).toBe('Cañada Blanca');
    expect(colonia.estado?.nombre).toBe('Nuevo León');
  });

  it('debe obtener una lista de estados con la estructura correcta', async () => {
    const url = `https://codigos-postales-de-mexico1.p.rapidapi.com/v1/estado/`;
    console.log(`\n  [INTEGRATION TEST] Listando todos los estados`);
    console.log(`  [INTEGRATION TEST] URL: ${url}`);
    
    const respuesta = await client.listAllEstados();

    expect(respuesta.content).toBeDefined();
    expect(Array.isArray(respuesta.content)).toBe(true);
    expect(respuesta.content.length).toBeGreaterThan(0);
    const primerEstado = respuesta.content[0];
    expect(primerEstado).toHaveProperty('id');
    expect(primerEstado).toHaveProperty('nombre');
    expect(primerEstado).toHaveProperty('inegiClave');
  });

  it('debe obtener una lista de municipios para un estado específico', async () => {
    const estadoId = 19; // ID de Nuevo León
    const url = `https://codigos-postales-de-mexico1.p.rapidapi.com/v1/municipio/estado/${estadoId}`;
    console.log(`\n  [INTEGRATION TEST] Buscando municipios para el estado ID: ${estadoId}`);
    console.log(`  [INTEGRATION TEST] URL: ${url}`);

    const respuesta = await client.getMunicipiosByEstado({ estadoId });

    expect(respuesta.content).toBeDefined();
    expect(Array.isArray(respuesta.content)).toBe(true);
    expect(respuesta.content.length).toBeGreaterThan(0);
    const primerMunicipio = respuesta.content[0];
    expect(primerMunicipio).toHaveProperty('id');
    expect(primerMunicipio).toHaveProperty('nombre');
  });
});