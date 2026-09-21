/**
 * Shared, brand-neutral configuration for the formal PQRS filing form.
 * Brand-specific data (legal name, contact email, data-policy route) stays in
 * each `site.config.ts` and is read directly from `SiteConfig` by the page.
 */

export const PQRS_RELATIONSHIPS = ["Cliente", "Proveedor", "Otro"] as const;

// Guidance, not an approved Customer Service cause catalog.
export const PQRS_REQUEST_TYPES = [
  {
    title: "Petición",
    icon: "file-text",
    description: "Pide información u orientación relacionada con la empresa.",
    narrative:
      "Indica qué información necesitas y los antecedentes de tu petición.",
  },
  {
    title: "Queja",
    icon: "megaphone",
    description: "Cuéntanos una inconformidad con la atención recibida.",
    narrative:
      "Relata qué ocurrió en la atención, cuándo y por qué presentas la queja.",
  },
  {
    title: "Reclamo",
    icon: "shield",
    description: "Pide revisar una inconformidad con productos o servicios.",
    narrative:
      "Describe el producto o servicio, la inconformidad y la solución que esperas. Incluye la referencia del pedido o factura si la conoces.",
  },
  {
    title: "Solicitud",
    icon: "handshake",
    description: "Solicita una gestión o un trámite de la empresa.",
    narrative:
      "Describe la gestión que necesitas y las circunstancias que permiten atenderla.",
  },
] as const;

export const PQRS_SUBMISSION_NOTE =
  "Al enviar tu PQRS se guarda un expediente y se genera un número de radicado. Recibirás la confirmación en el correo registrado.";

export const PQRS_DOCUMENT_TYPES = [
  "Cédula de ciudadanía",
  "Cédula de extranjería",
  "Pasaporte",
  "Permiso especial de permanencia",
  "Otro",
] as const;

/**
 * Shared limits for email attachments.
 */
export const PQRS_ATTACHMENT_RULES = {
  acceptedExtensions: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
  acceptAttribute:
    ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png",
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxTotalSizeBytes: 25 * 1024 * 1024,
  maxFiles: 5,
} as const;

/**
 * General, non-binding legal reference terms. Explicitly framed as pending
 * legal review before publication, per docs/progress.md.
 */
export const PQRS_RESPONSE_TERMS_NOTE =
  "Como referencia general y no vinculante: peticiones generales, 15 días hábiles; solicitudes de información o de documentos, 10 días hábiles; consultas, 30 días hábiles. Pueden existir términos especiales según la naturaleza de la solicitud. Estos plazos no constituyen un compromiso contractual; se aplicarán los términos legalmente correspondientes una vez validados por la empresa y su asesoría jurídica.";
