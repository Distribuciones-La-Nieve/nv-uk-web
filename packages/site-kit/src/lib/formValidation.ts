import {
  PQRS_DOCUMENT_TYPES,
  PQRS_RELATIONSHIPS,
  PQRS_REQUEST_TYPES,
} from "../config/pqrsFilingContent";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePqrsFields(form: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const value = (key: string) =>
    typeof form[key] === "string" ? form[key].trim() : "";
  const required = (key: string, max: number, pattern?: RegExp) => {
    const v = value(key);
    if (!v || v.length > max || (pattern && !pattern.test(v)))
      errors[key] =
        `Revisa este campo: es obligatorio, admite hasta ${max} caracteres y debe tener un formato válido.`;
  };
  const choice = (key: string, options: readonly string[]) => {
    if (!options.includes(value(key)))
      errors[key] = "Selecciona una opción válida.";
  };
  choice(
    "tipoSolicitud",
    PQRS_REQUEST_TYPES.map((type) => type.title)
  );
  choice("relacion", PQRS_RELATIONSHIPS);
  choice("tipoSolicitante", ["natural", "juridica"]);
  required("asunto", 150);
  required("causal", 200);
  required("hechos", 4000);
  required("email", 254, EMAIL_PATTERN);
  required("emailConfirm", 254, EMAIL_PATTERN);
  if (value("email") !== value("emailConfirm"))
    errors.emailConfirm = "Los correos electrónicos no coinciden.";
  if (value("telefono")) required("telefono", 15, /^\d+$/);
  const identity = (prefix: string) => {
    required(`${prefix}Nombres`, 120, /^[\p{L}][\p{L}\s.'-]*$/u);
    required(`${prefix}Apellidos`, 120, /^[\p{L}][\p{L}\s.'-]*$/u);
    choice(`${prefix}TipoDocumento`, PQRS_DOCUMENT_TYPES);
    required(`${prefix}NumeroDocumento`, 30, /^\d+$/);
  };
  const applicant = value("tipoSolicitante");
  if (applicant === "natural") {
    required("nombres", 120, /^[\p{L}][\p{L}\s.'-]*$/u);
    required("apellidos", 120, /^[\p{L}][\p{L}\s.'-]*$/u);
    choice("tipoDocumento", PQRS_DOCUMENT_TYPES);
    required("numeroDocumento", 30, /^\d+$/);
  } else {
    required("razonSocial", 5000);
    required("nit", 30, /^\d+$/);
    if (applicant === "juridica") identity("rep");
  }
  for (const key of [
    "aceptaTratamiento",
    "aceptaRespuestaCorreo",
    "aceptaVeracidad",
  ]) {
    if (form[key] !== true && form[key] !== "true")
      errors[key] = "Debes aceptar esta declaración.";
  }
  return errors;
}

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function createClientRequestId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function sanitizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function sanitizePersonName(value: string) {
  return value.replace(/[^\p{L}\s.'-]/gu, "");
}
