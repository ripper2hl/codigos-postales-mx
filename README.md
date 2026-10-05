# Códigos Postales Mx 🇲🇽

![npm](https://img.shields.io/npm/v/codigos-postales-mx)
![license](https://img.shields.io/npm/l/codigos-postales-mx)
![typescript](https://img.shields.io/badge/TypeScript-Ready-blue)

Un SDK de TypeScript/JavaScript simple, robusto y ligero para interactuar con la **API de Códigos Postales de México** alojada en RapidAPI.

Este paquete te permite integrar fácilmente la información de códigos postales, colonias, municipios, estados y más datos geográficos de México en tus proyectos, tanto en el backend (Node.js) como en el frontend.

---

## ✨ Características

* **Moderno:** Escrito en TypeScript y compatible nativamente con `async/await`.
* **Totalmente Tipado:** Autocompletado y seguridad de tipos en todos los métodos y respuestas.
* **Universal:** Funciona tanto en Node.js (CommonJS y ESM) como en el navegador.
* **Cobertura Completa:** Soporta **todas** las entidades expuestas por la API (Estados, Municipios, Colonias, Códigos Postales, Ciudades, Zonas, etc.).
* **Resiliente:** Manejo de errores detallado y soporte integrado para `timeouts` de conexión.
* **Cero Dependencias:** No contamina tu `node_modules` en producción.

---

## 🚀 Instalación

```bash
npm install codigos-postales-mx
```

---

## ⚙️ Uso Básico

### 1. Obtén tu API Key

Para usar este SDK, necesitas una clave de API. Suscríbete al plan gratuito (500,000 peticiones/mes) en el siguiente enlace:

➡️ **[Obtener API Key en RapidAPI](https://rapidapi.com/risabeatbox/api/codigos-postales-de-mexico1)**

### 2. Inicializa el Cliente

Se recomienda usar variables de entorno para mantener segura tu clave.

```typescript
// Usando ES Modules (import)
import { CodigosPostalesMx } from 'codigos-postales-mx';

// Usando CommonJS (require)
// const { CodigosPostalesMx } = require('codigos-postales-mx');

const cliente = new CodigosPostalesMx({
  apiKey: process.env.RAPIDAPI_KEY, // Requerido: Tu clave de RapidAPI
  timeout: 10000 // Opcional: Tiempo máximo de espera en ms (default 10000)
});

// Ejemplo rápido:
async function main() {
  try {
    const colonia = await cliente.getColoniaById(88724);
    console.log(`Colonia encontrada: ${colonia.nombre}, en ${colonia.estado?.nombre}`);
  } catch (error) {
    console.error(error);
  }
}

main();
```

---

## 📖 Entidades Soportadas y Métodos

El SDK expone métodos para interactuar con las siguientes entidades geográficas:

* `Colonia`
* `Estado`
* `Municipio`
* `CodigoPostal`
* `Ciudad`
* `ZonaTipo`
* `AsentamientoTipo`
* `InegiClaveCiudad` e `InegiClaveMunicipio`

Para **todas** las entidades tienes a tu disposición los siguientes 3 métodos base:

| Patrón de Método | Parámetros | Retorna | Descripción |
| :--- | :--- | :--- | :--- |
| `get{Entidad}ById` | `id: number` | `Promise<T>` | Obtiene los detalles exactos de una entidad por su ID. |
| `get{Entidad}ByName` | `nombre: string` | `Promise<T[]>` | Busca entidades que coincidan exactamente con el nombre. |
| `listAll{Entidades}` | `{ page?, size? }` | `Promise<PaginatedResponse<T>>` | Obtiene una lista paginada de todas las entidades registradas. |

*(Donde `{Entidad}` se reemplaza por el nombre de la entidad en CamelCase. Por ejemplo: `getEstadoById`, `listAllMunicipios`, `getCodigoPostalByName`, etc.)*

### Búsquedas Específicas Cruzadas

Adicional a los métodos base CRUD, el SDK expone métodos específicos muy útiles para cruzar o filtrar datos entre colonias y municipios:

| Método | Parámetros | Retorna | Descripción |
| :--- | :--- | :--- | :--- |
| `getColoniasByCodigoPostal` | `codigoPostal: string` | `Promise<Colonia[]>` | Lista las colonias asociadas a un código postal de 5 dígitos (Ej: "66604"). |
| `searchColonias` | `{ nombre, estadoId?, municipioId? }` | `Promise<Colonia[]>` | Busca colonias por nombre con filtros opcionales de estado o municipio. |
| `getColoniasByMunicipio` | `{ municipioId, page?, size? }` | `Promise<PaginatedResponse<Colonia>>` | Lista las colonias de un municipio dado, de forma paginada. |
| `getMunicipiosByEstado` | `{ estadoId, page?, size? }` | `Promise<PaginatedResponse<Municipio>>` | Lista los municipios de un estado dado, de forma paginada. |

---

## 🛡️ Manejo de Errores

El SDK provee una clase de error especializada `CodigosPostalesApiError` que hereda de la clase estándar `Error`. Esta clase te permite identificar rápidamente si el error se debió a un código HTTP (como un `404 Not Found`) o si excedió el tiempo de respuesta configurado (Timeout).

```javascript
import { CodigosPostalesApiError } from 'codigos-postales-mx';

async function probarError() {
  try {
    // Este ID es inválido y causará un error (404)
    await cliente.getColoniaById(99999999);
  } catch (error) {
    if (error instanceof CodigosPostalesApiError) {
      console.error(`Status HTTP: ${error.statusCode}`); // Ejemplo: 404
      console.error(`URL que falló: ${error.url}`);
      console.error(`Mensaje: ${error.message}`); 
    } else {
      console.error('Error de red o interno desconocido:', error);
    }
  }
}

probarError();
```

---

## 📜 Licencia

Publicado bajo la [Licencia LGPL v3](https://www.gnu.org/licenses/lgpl-3.0). Las modificaciones a este SDK deben permanecer bajo esta misma licencia, pero puedes usar el paquete compilado en tus proyectos (abiertos o cerrados) sin restricciones.