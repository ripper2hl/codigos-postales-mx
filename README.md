# Códigos Postales Mx 🇲🇽

Un SDK de TypeScript/JavaScript simple y ligero para interactuar con la **API de Códigos Postales de México**.

Este paquete te permite integrar fácilmente la información de códigos postales, colonias, municipios y estados de México en tus proyectos, tanto en el backend (Node.js) como en el frontend.



---

## ✨ Características

* **Moderno:** Escrito en TypeScript y compatible con `async/await`.
* **Totalmente Tipado:** Autocompletado y seguridad de tipos desde el primer momento.
* **Universal:** Funciona tanto en Node.js como en el navegador.
* **Ligero:** Sin dependencias de producción.
* **Cobertura Completa:** Implementa los endpoints más importantes del API.
* **Probado:** Alta cobertura de pruebas unitarias y de integración.

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

Importa la clase e inicializa el cliente con tu API Key. Se recomienda usar variables de entorno para mantener segura tu clave.

```javascript
// Usando ES Modules (import)
import { CodigosPostalesMx } from 'codigos-postales-mx';

// Usando CommonJS (require)
// const { CodigosPostalesMx } = require('codigos-postales-mx');

const cliente = new CodigosPostalesMx({
  apiKey: process.env.RAPIDAPI_KEY // Tu clave de RapidAPI
});

// Ejemplo: Obtener los detalles de una colonia por su ID
async function obtenerColonia() {
  try {
    const idColonia = 88724; // ID de "Cañada Blanca"
    const colonia = await cliente.getColoniaById(idColonia);
    
    console.log('¡Colonia encontrada!', colonia);
  } catch (error) {
    console.error('Ocurrió un error:', error.message);
  }
}

obtenerColonia();
```

---

## 📖 Documentación del API

Todos los métodos devuelven una `Promise`.

| Método | Parámetros | Retorna | Descripción |
| :--- | :--- | :--- | :--- |
| `getColoniaById` | `coloniaId: number` | `Promise<Colonia>` | Obtiene los detalles de una colonia por su ID. |
| `getColoniasByCodigoPostal` | `codigoPostal: string` | `Promise<Colonia[]>` | Lista las colonias asociadas a un código postal. |
| `searchColonias` | `{ nombre, estadoId?, municipioId? }` | `Promise<Colonia[]>` | Busca colonias por nombre, con filtros opcionales. |
| `listAllColonias` | `{ page?, size? }` | `Promise<PaginatedResponse<Colonia>>` | Lista todas las colonias de forma paginada. |
| `getColoniasByMunicipio` | `{ municipioId, page?, size? }` | `Promise<PaginatedResponse<Colonia>>` | Lista las colonias de un municipio de forma paginada. |
| `listAllEstados` | `{ page?, size? }` | `Promise<PaginatedResponse<Estado>>` | Lista todos los estados de México de forma paginada. |
| `getMunicipiosByEstado` | `{ estadoId, page?, size? }` | `Promise<PaginatedResponse<Municipio>>` | Lista los municipios de un estado de forma paginada. |

---

## 🛡️ Manejo de Errores

Si el API devuelve un error, el método del SDK rechazará la promesa. Utiliza un bloque `try...catch` para manejar estos casos.

```javascript
async function probarError() {
  try {
    // Este ID es inválido y causará un error
    await cliente.getColoniaById(99999999);
  } catch (error) {
    // El error contendrá el código de estado y el mensaje del API
    console.error(error.message); 
  }
}

probarError();
```

---

## 📜 Licencia

Publicado bajo la [Licencia LGPL v3](https://www.gnu.org/licenses/lgpl-3.0). Las modificaciones a este SDK deben permanecer bajo esta misma licencia, pero puedes usarlo en tus proyectos (abiertos o cerrados) sin restricciones.