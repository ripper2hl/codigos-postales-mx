/**
 * Error personalizado para fallos en las peticiones a la API de Códigos Postales.
 */
export class CodigosPostalesApiError extends Error {
  public readonly statusCode?: number;
  public readonly url?: string;

  constructor(message: string, statusCode?: number, url?: string) {
    super(message);
    this.name = 'CodigosPostalesApiError';
    this.statusCode = statusCode;
    this.url = url;

    // Mantiene el stack trace correcto en V8 (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CodigosPostalesApiError);
    }
  }
}
