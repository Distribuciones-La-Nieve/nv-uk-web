import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { SiteConfig } from "../config/types";
import { getCareerJob } from "../config/careersContent";
import {
  PQRS_REQUEST_TYPES as PQRS_TYPES,
  PQRS_ATTACHMENT_RULES,
} from "../config/pqrsFilingContent";
import { validatePqrsFields } from "../lib/formValidation";
import {
  FormDatabaseError,
  markNotificationStatus,
  persistFormSubmission,
  type FormKind,
  type PersistedFormSubmission,
  type StoredFormAttachment,
} from "./database";

export type FormSiteId = SiteConfig["id"];

type ResendAttachment = {
  filename: string;
  content: string;
  content_id?: string;
  content_type?: string;
};

type PreparedAttachment = ResendAttachment & {
  buffer: Buffer;
  contentType: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT_LENGTH = 5000;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const MAX_MULTIPART_BYTES = 27 * 1024 * 1024;
const ALLOWED_RESUME_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);
const ALLOWED_SUPPLIER_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
]);
const ALLOWED_PQRS_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
]);
const PQRS_REQUEST_TYPES = new Set<string>(
  PQRS_TYPES.map((type) => type.title)
);
const PQRS_APPLICANT_TYPES = new Set(["natural", "juridica"]);
const PQRS_DOCUMENT_TYPES = new Set([
  "Cédula de ciudadanía",
  "Cédula de extranjería",
  "Pasaporte",
  "Permiso especial de permanencia",
  "Otro",
]);
const SUPPLIER_TYPES = new Set(["merchandise", "services"]);
const SUPPLIER_PRODUCT_CATEGORIES = new Set([
  "Alimentos y bebidas",
  "Aseo del hogar",
  "Cuidado personal",
  "Productos institucionales",
  "Licores",
  "Otros",
]);
const SUPPLIER_DISTRIBUTION_SEGMENTS = new Set([
  "Tiendas",
  "Minimercados y supermercados",
  "Mayoristas",
  "Institucional",
  "Bares y licoreras",
  "Otros",
]);
const YES_NO_OPTIONS = new Set(["Sí", "No"]);
const CAREERS_STORED_FIELDS = [
  "name",
  "email",
  "phone",
  "city",
  "area",
  "profile",
  "vacancyId",
  "vacancyTitle",
  "data-policy-acceptance",
] as const;
const SUPPLIERS_STORED_FIELDS = [
  "supplierType",
  "companyName",
  "nit",
  "contactName",
  "phone",
  "email",
  "productCategory",
  "brands",
  "productTypes",
  "marketPresence",
  "isCompetitor",
  "distributionSegment",
  "servicesDescription",
  "companyLocation",
  "websiteUrl",
  "data-policy-acceptance",
] as const;
const PQRS_STORED_FIELDS = [
  "tipoSolicitud",
  "relacion",
  "causal",
  "asunto",
  "hechos",
  "tipoSolicitante",
  "nombres",
  "apellidos",
  "tipoDocumento",
  "numeroDocumento",
  "razonSocial",
  "nit",
  "repNombres",
  "repApellidos",
  "repTipoDocumento",
  "repNumeroDocumento",
  "email",
  "emailConfirm",
  "telefono",
  "aceptaTratamiento",
  "aceptaRespuestaCorreo",
  "aceptaVeracidad",
] as const;
const PERSON_NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]*$/u;
const DIGITS_PATTERN = /^\d+$/;

const FILE_SIGNATURES: Record<
  string,
  { contentType: string; matches: (buffer: Buffer) => boolean }
> = {
  ".pdf": {
    contentType: "application/pdf",
    matches: (buffer) => buffer.subarray(0, 5).toString("ascii") === "%PDF-",
  },
  ".png": {
    contentType: "image/png",
    matches: (buffer) =>
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  ".jpg": {
    contentType: "image/jpeg",
    matches: (buffer) =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  ".jpeg": {
    contentType: "image/jpeg",
    matches: (buffer) =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  ".doc": {
    contentType: "application/msword",
    matches: matchesOleDocument,
  },
  ".ppt": {
    contentType: "application/vnd.ms-powerpoint",
    matches: matchesOleDocument,
  },
  ".docx": {
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    matches: (buffer) => matchesZipDocument(buffer, "word/"),
  },
  ".pptx": {
    contentType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    matches: (buffer) => matchesZipDocument(buffer, "ppt/"),
  },
};

const FORM_KIND_LABELS: Record<FormKind, string> = {
  careers: "postulación laboral",
  pqrs: "solicitud PQRS",
  suppliers: "registro de proveedor",
};

class FormRequestError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "FormRequestError";
    this.status = status;
  }
}

function matchesOleDocument(buffer: Buffer) {
  return buffer
    .subarray(0, 8)
    .equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
}

function matchesZipDocument(buffer: Buffer, requiredDirectory: string) {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    [0x03, 0x05, 0x07].includes(buffer[2] ?? -1) &&
    [0x04, 0x06, 0x08].includes(buffer[3] ?? -1) &&
    buffer.includes(Buffer.from(requiredDirectory, "ascii"))
  );
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function text(value: FormDataEntryValue | string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function assertSafeFormRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("multipart/form-data;")) {
    throw new FormRequestError("El formato de la solicitud no es válido.", 415);
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const bytes = Number(contentLength);
    if (!Number.isSafeInteger(bytes) || bytes < 0) {
      throw new FormRequestError("El tamaño de la solicitud no es válido.");
    }
    if (bytes > MAX_MULTIPART_BYTES) {
      throw new FormRequestError(
        "La solicitud supera el tamaño máximo permitido.",
        413
      );
    }
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new FormRequestError(
      "El origen de la solicitud no está permitido.",
      403
    );
  }
}

function formFields(form: FormData, allowedKeys: readonly string[]) {
  const fields: Record<string, string> = {};
  for (const key of allowedKeys) {
    const value = form.get(key);
    if (typeof value !== "string") continue;
    fields[key] = value.trim();
  }
  return fields;
}

function required(value: string, label: string, max = MAX_TEXT_LENGTH) {
  if (!value) throw new FormRequestError(`El campo ${label} es obligatorio.`);
  if (value.length > max)
    throw new FormRequestError(`El campo ${label} supera el límite permitido.`);
  return value;
}

function validEmail(value: string, label = "correo electrónico") {
  if (!EMAIL_PATTERN.test(value)) {
    throw new FormRequestError(`El ${label} no es válido.`);
  }
  return value;
}

function validChoice(
  value: string,
  values: ReadonlySet<string>,
  label: string
) {
  if (!values.has(value)) {
    throw new FormRequestError(`El campo ${label} no tiene una opción válida.`);
  }
  return value;
}

function validDigits(value: string, label: string, max = 30) {
  const normalized = required(value, label, max);
  if (!DIGITS_PATTERN.test(normalized)) {
    throw new FormRequestError(
      `El campo ${label} solo puede contener números.`
    );
  }
  return normalized;
}

function validPersonName(value: string, label: string) {
  const normalized = required(value, label, 120);
  if (!PERSON_NAME_PATTERN.test(normalized)) {
    throw new FormRequestError(
      `El campo ${label} solo puede contener letras, espacios, apóstrofes, puntos o guiones.`
    );
  }
  return normalized;
}

function validWebUrl(value: string, label: string) {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error();
    }
    return value;
  } catch {
    throw new FormRequestError(`El campo ${label} no contiene una URL válida.`);
  }
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character
  );
}

type EmailField = readonly [label: string, value: string];

type EmailSection = {
  title: string;
  fields?: readonly EmailField[];
  content?: string;
};

function getEmailBrand(site: FormSiteId) {
  return site === "la-nieve"
    ? {
        name: "Distribuciones La Nieve",
        color: "#27348a",
        logoFile: "logo-white-v2.png",
      }
    : { name: "Unimarka", color: "#bd202d", logoFile: "logo-white.png" };
}

function getLogoPath(site: FormSiteId) {
  const { logoFile } = getEmailBrand(site);
  const logoPath = path.join(process.cwd(), "public", "brand", logoFile);
  return existsSync(logoPath) ? logoPath : undefined;
}

function getLogoAttachment(site: FormSiteId): ResendAttachment | undefined {
  const logoPath = getLogoPath(site);
  if (!logoPath) return undefined;

  return {
    filename: getEmailBrand(site).logoFile,
    content: readFileSync(logoPath).toString("base64"),
    content_id: "company-logo",
    content_type: "image/png",
  };
}

function renderEmailFields(fields: readonly EmailField[]) {
  const visibleFields = fields.filter(([, value]) => value.trim());
  if (visibleFields.length === 0) return "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${visibleFields
    .map(
      ([label, value]) =>
        `<tr><td style="padding:9px 0;border-bottom:1px solid #e5e7eb;vertical-align:top;width:38%;color:#64748b;font-size:13px;line-height:20px">${escapeHtml(label)}</td><td style="padding:9px 0 9px 16px;border-bottom:1px solid #e5e7eb;vertical-align:top;color:#172033;font-size:14px;line-height:21px;white-space:pre-line;word-break:break-word">${escapeHtml(value)}</td></tr>`
    )
    .join("")}</table>`;
}

function renderEmailSection(section: EmailSection) {
  const content = section.content
    ? `<div style="margin-top:12px;padding:16px 18px;border-radius:10px;background:#f8fafc;color:#172033;font-size:15px;line-height:24px;white-space:pre-line;word-break:break-word">${escapeHtml(section.content)}</div>`
    : "";
  const fields = section.fields?.length
    ? `<div style="margin-top:10px">${renderEmailFields(section.fields)}</div>`
    : "";

  return `<tr><td style="padding:0 32px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;border-collapse:separate"><tr><td style="padding:18px 20px"><h2 style="margin:0;color:#172033;font-size:16px;line-height:22px;font-weight:700">${escapeHtml(section.title)}</h2>${fields}${content}</td></tr></table></td></tr>`;
}

function renderEmail(options: {
  site: FormSiteId;
  eyebrow: string;
  title: string;
  intro: string;
  summaryLabel: string;
  summary: string;
  sections: readonly EmailSection[];
  footerNote: string;
}) {
  const brand = getEmailBrand(options.site);
  const logo = getLogoPath(options.site)
    ? `<img src="cid:company-logo" alt="${escapeHtml(brand.name)}" width="190" style="display:block;width:190px;max-width:100%;height:auto;margin:0 0 17px">`
    : "";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f1f5f9"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;border-collapse:separate;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#ffffff"><tr><td style="padding:26px 32px;background:${brand.color};color:#ffffff">${logo}<p style="margin:0;font-size:14px;line-height:20px;font-weight:700;letter-spacing:.04em">${escapeHtml(brand.name)}</p><p style="margin:5px 0 0;font-size:12px;line-height:18px;opacity:.88">Comunicación recibida desde el sitio web</p></td></tr><tr><td style="padding:30px 32px 18px"><p style="margin:0;color:${brand.color};font-size:12px;line-height:18px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${escapeHtml(options.eyebrow)}</p><h1 style="margin:8px 0 0;color:#172033;font-size:25px;line-height:33px;font-weight:700">${escapeHtml(options.title)}</h1><p style="margin:12px 0 0;color:#475569;font-size:15px;line-height:23px">${escapeHtml(options.intro)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-collapse:separate;border-left:4px solid ${brand.color};background:#f8fafc"><tr><td style="padding:13px 16px"><p style="margin:0;color:#64748b;font-size:11px;line-height:16px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(options.summaryLabel)}</p><p style="margin:4px 0 0;color:#172033;font-size:16px;line-height:22px;font-weight:700">${escapeHtml(options.summary)}</p></td></tr></table></td></tr>${options.sections.map(renderEmailSection).join("")}<tr><td style="padding:4px 32px 28px"><p style="margin:0;padding-top:18px;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;line-height:19px">${escapeHtml(options.footerNote)}</p></td></tr></table></td></tr></table></body></html>`;
}

function renderConfirmationEmail(options: {
  site: FormSiteId;
  kind: FormKind;
  trackingNumber: string;
  subject: string;
}) {
  return renderEmail({
    site: options.site,
    eyebrow: "Confirmacion de recepcion",
    title: "Tu solicitud fue recibida",
    intro: `Conserva este numero para referenciar tu ${FORM_KIND_LABELS[options.kind]}.`,
    summaryLabel: "Numero de radicado",
    summary: options.trackingNumber,
    sections: [
      {
        title: "Datos de recepcion",
        fields: [
          ["Tipo de tramite", FORM_KIND_LABELS[options.kind]],
          ["Asunto o referencia", options.subject],
          ["Numero de radicado", options.trackingNumber],
        ],
      },
    ],
    footerNote:
      "Este mensaje confirma la recepcion de la solicitud. La respuesta y los tiempos aplicables seran gestionados por el equipo responsable.",
  });
}

function getRecipient(kind: FormKind, site: FormSiteId) {
  const siteKey = site === "la-nieve" ? "LA_NIEVE" : "UNIMARKA";
  const kindKey = kind.toUpperCase();
  const variableName = `RESEND_${kindKey}_TO_${siteKey}`;
  const configuredRecipient = process.env[variableName]?.trim();
  const recipient =
    configuredRecipient ||
    (process.env.NODE_ENV === "production"
      ? ""
      : process.env.RESEND_TEST_RECIPIENT?.trim());

  if (!recipient || !EMAIL_PATTERN.test(recipient)) {
    console.error(
      `Destinatario de formularios no configurado: ${variableName}.`
    );
    throw new FormRequestError(
      "El canal de notificación no está configurado.",
      503
    );
  }
  return recipient;
}

function getSender(site: FormSiteId) {
  const email = process.env.RESEND_FROM_EMAIL?.trim();
  if (
    process.env.NODE_ENV === "production" &&
    (!email || !EMAIL_PATTERN.test(email))
  ) {
    console.error(
      "Remitente de formularios no configurado: RESEND_FROM_EMAIL."
    );
    throw new FormRequestError(
      "El canal de notificación no está configurado.",
      503
    );
  }
  const name =
    process.env.RESEND_FROM_NAME?.trim() ||
    (site === "la-nieve" ? "Distribuciones La Nieve" : "Unimarka");
  return `${name} <${email || "onboarding@resend.dev"}>`;
}

async function fileToAttachment(file: File, allowedExtensions: Set<string>) {
  if (!file.name || file.size === 0) {
    throw new FormRequestError("El archivo adjunto está vacío o no es válido.");
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new FormRequestError(
      `El archivo ${file.name} supera el tamaño máximo de 10 MB.`
    );
  }
  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new FormRequestError(
      `El formato del archivo ${file.name} no está permitido.`
    );
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const signature = FILE_SIGNATURES[extension];
  if (!signature?.matches(buffer)) {
    throw new FormRequestError(
      `El contenido del archivo ${file.name} no corresponde al formato indicado.`
    );
  }
  const filename = path
    .basename(file.name)
    .replace(/[\r\n"]/g, "_")
    .slice(0, 180);
  return {
    filename,
    content: buffer.toString("base64"),
    content_type: signature.contentType,
    contentType: signature.contentType,
    buffer,
  } satisfies PreparedAttachment;
}

async function sendWithResend(options: {
  site: FormSiteId;
  kind: FormKind;
  subject: string;
  to?: string;
  replyTo?: string;
  html: string;
  attachments?: readonly ResendAttachment[];
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("Resend no está configurado: falta RESEND_API_KEY.");
    throw new FormRequestError(
      "El servicio de envío no está configurado.",
      503
    );
  }

  const payload: Record<string, unknown> = {
    from: getSender(options.site),
    to: [options.to || getRecipient(options.kind, options.site)],
    subject: options.subject,
    html: options.html,
  };
  if (options.replyTo) payload.reply_to = options.replyTo;
  const logoAttachment = getLogoAttachment(options.site);
  const attachments = [
    ...(logoAttachment ? [logoAttachment] : []),
    ...(options.attachments ?? []).map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      ...(attachment.content_id ? { content_id: attachment.content_id } : {}),
      ...(attachment.content_type
        ? { content_type: attachment.content_type }
        : {}),
    })),
  ];
  if (attachments.length) payload.attachments = attachments;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Resend rechazó el envío",
      response.status,
      errorText.slice(0, 500)
    );
    throw new FormRequestError(
      "No fue posible enviar la solicitud. Intenta de nuevo.",
      502
    );
  }
}

function notificationError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No fue posible enviar la notificacion.";
}

async function safelyMarkNotification(
  submissionId: number,
  channel: "internal" | "confirmation",
  status: "sent" | "failed",
  errorMessage?: string
) {
  try {
    await markNotificationStatus(submissionId, channel, status, errorMessage);
  } catch (error) {
    console.error("No fue posible actualizar el estado de la notificacion", {
      submissionId,
      channel,
      error: notificationError(error),
    });
  }
}

async function notifySubmission(options: {
  submission: PersistedFormSubmission;
  site: FormSiteId;
  kind: FormKind;
  email: string;
  subject: string;
  internalSubject: string;
  internalHtml: string;
  attachments?: readonly ResendAttachment[];
}) {
  let internalNotificationSent =
    options.submission.notificationStatus === "sent";
  let confirmationSent = options.submission.confirmationStatus === "sent";

  if (!internalNotificationSent) {
    try {
      await sendWithResend({
        site: options.site,
        kind: options.kind,
        subject: `[${options.submission.trackingNumber}] ${options.internalSubject}`,
        replyTo: options.email,
        attachments: options.attachments,
        html: options.internalHtml,
      });
      internalNotificationSent = true;
      await safelyMarkNotification(options.submission.id, "internal", "sent");
    } catch (error) {
      await safelyMarkNotification(
        options.submission.id,
        "internal",
        "failed",
        notificationError(error)
      );
      console.error("No fue posible enviar la notificacion interna", {
        trackingNumber: options.submission.trackingNumber,
        error: notificationError(error),
      });
    }
  }

  if (!confirmationSent) {
    try {
      await sendWithResend({
        site: options.site,
        kind: options.kind,
        to: options.email,
        subject: `[${options.submission.trackingNumber}] Confirmacion de recepcion`,
        html: renderConfirmationEmail({
          site: options.site,
          kind: options.kind,
          trackingNumber: options.submission.trackingNumber,
          subject: options.subject,
        }),
      });
      confirmationSent = true;
      await safelyMarkNotification(
        options.submission.id,
        "confirmation",
        "sent"
      );
    } catch (error) {
      await safelyMarkNotification(
        options.submission.id,
        "confirmation",
        "failed",
        notificationError(error)
      );
      console.error("No fue posible enviar la confirmacion al solicitante", {
        trackingNumber: options.submission.trackingNumber,
        error: notificationError(error),
      });
    }
  }

  return { internalNotificationSent, confirmationSent };
}

/**
 * Verifies Turnstile on the server. In development, an absent secret keeps
 * local form work convenient; in production it is treated as a configuration
 * error so the public endpoints cannot silently run without anti-bot checks.
 */
async function verifyTurnstile(
  request: Request,
  token: string,
  expectedAction: "careers" | "suppliers" | "pqrs"
) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new FormRequestError(
        "El servicio de verificación no está configurado.",
        503
      );
    }
    return;
  }

  if (!token) {
    throw new FormRequestError(
      "Completa la verificación de seguridad antes de enviar el formulario."
    );
  }

  const remoteIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  let response: Response;
  try {
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch (error) {
    console.error("Turnstile no respondió", error);
    throw new FormRequestError(
      "No fue posible validar la seguridad del formulario. Intenta de nuevo.",
      503
    );
  }

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    action?: string;
    hostname?: string;
  } | null;
  const expectedHostname = new URL(
    process.env.NEXT_PUBLIC_SITE_URL || request.url
  ).hostname;
  if (
    !response.ok ||
    !result?.success ||
    result.action !== expectedAction ||
    result.hostname !== expectedHostname
  ) {
    throw new FormRequestError(
      "La verificación de seguridad expiró o no es válida. Intenta de nuevo."
    );
  }
}

export async function handleCareersRequest(request: Request, site: FormSiteId) {
  try {
    assertSafeFormRequest(request);
    const form = await request.formData();
    if (text(form.get("website"))) return jsonResponse({ ok: true });
    await verifyTurnstile(request, text(form.get("turnstileToken")), "careers");

    const name = required(text(form.get("name")), "nombre");
    const email = validEmail(
      required(text(form.get("email")), "correo electrónico")
    );
    const phone = required(
      text(form.get("phone")).replace(/\D/g, ""),
      "teléfono"
    );
    const city = required(text(form.get("city")), "ciudad");
    const vacancyId = text(form.get("vacancyId"));
    const vacancy = vacancyId ? getCareerJob(vacancyId) : undefined;
    if (vacancyId && !vacancy) {
      throw new FormRequestError("La vacante seleccionada no es válida.");
    }
    const area = vacancy
      ? vacancy.department
      : required(text(form.get("area")), "área de interés", 100);
    if (vacancy) {
      form.set("vacancyTitle", vacancy.title);
      form.set("area", vacancy.area);
    }
    const profile = required(text(form.get("profile")), "perfil");
    const accepted = text(form.get("data-policy-acceptance"));
    if (accepted !== "on" && accepted !== "true") {
      throw new FormRequestError(
        "Debes aceptar el tratamiento de datos personales."
      );
    }

    const resume = form.get("resume");
    if (!(resume instanceof File)) {
      throw new FormRequestError("Adjunta tu hoja de vida.");
    }
    const attachment = await fileToAttachment(
      resume,
      ALLOWED_RESUME_EXTENSIONS
    );

    const subject = `${name} — ${vacancy?.title ?? area}`;
    const vacancySections: EmailSection[] = vacancy
      ? [
          {
            title: "Vacante seleccionada",
            fields: [
              ["Código de vacante", vacancy.id],
              ["Cargo", vacancy.title],
              ["Área", vacancy.department],
              ["Ubicación", `${vacancy.city} · ${vacancy.workMode}`],
            ],
          },
        ]
      : [];
    const submission = await persistFormSubmission({
      site,
      kind: "careers",
      clientRequestId: text(form.get("clientRequestId")),
      contactEmail: email,
      subject,
      data: formFields(form, CAREERS_STORED_FIELDS),
      attachments: [
        {
          filename: attachment.filename,
          contentType: attachment.contentType,
          content: attachment.buffer,
        } satisfies StoredFormAttachment,
      ],
    });
    const notification = await notifySubmission({
      submission,
      site,
      kind: "careers",
      email,
      subject,
      internalSubject: `[Trabaja con nosotros] ${subject}`,
      attachments: [attachment],
      internalHtml: renderEmail({
        site,
        eyebrow: "Trabaja con nosotros",
        title: `${name} envió su perfil laboral`,
        intro: `Se recibió una nueva postulación para el equipo de ${getEmailBrand(site).name}.`,
        summaryLabel: "Número de radicado",
        summary: submission.trackingNumber,
        sections: [
          ...vacancySections,
          {
            title: "Datos de la persona postulante",
            fields: [
              ["Número de radicado", submission.trackingNumber],
              ["Nombre", name],
              ["Correo electrónico", email],
              ["Teléfono", phone],
              ["Ciudad", city],
            ],
          },
          { title: "Perfil o experiencia", content: profile },
        ],
        footerNote: `La hoja de vida de ${name} se encuentra adjunta a este correo para su revisión.`,
      }),
    });

    return jsonResponse({
      ok: true,
      trackingNumber: submission.trackingNumber,
      notificationSent:
        notification.internalNotificationSent && notification.confirmationSent,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function handleSuppliersRequest(
  request: Request,
  site: FormSiteId
) {
  try {
    assertSafeFormRequest(request);
    const form = await request.formData();
    if (text(form.get("website"))) return jsonResponse({ ok: true });
    await verifyTurnstile(
      request,
      text(form.get("turnstileToken")),
      "suppliers"
    );

    const supplierType = validChoice(
      required(text(form.get("supplierType")), "tipo de proveedor", 40),
      SUPPLIER_TYPES,
      "tipo de proveedor"
    );
    const companyName = required(
      text(form.get("companyName")),
      "razón social",
      160
    );
    const nit = validDigits(text(form.get("nit")), "NIT", 15);
    const contactName = validPersonName(
      text(form.get("contactName")),
      "nombre del contacto"
    );
    const phone = validDigits(text(form.get("phone")), "teléfono", 15);
    const email = validEmail(
      required(text(form.get("email")), "correo electrónico", 254)
    );

    const accepted = text(form.get("data-policy-acceptance"));
    if (accepted !== "on" && accepted !== "true") {
      throw new FormRequestError(
        "Debes aceptar el tratamiento de datos personales."
      );
    }

    let detailSection: EmailSection;
    let supplierTypeLabel: string;

    if (supplierType === "merchandise") {
      supplierTypeLabel = "Proveedor de mercancía";
      const productCategory = validChoice(
        required(
          text(form.get("productCategory")),
          "categoría de productos",
          100
        ),
        SUPPLIER_PRODUCT_CATEGORIES,
        "categoría de productos"
      );
      const brands = required(
        text(form.get("brands")),
        "marcas ofrecidas",
        500
      );
      const productTypes = required(
        text(form.get("productTypes")),
        "tipo de productos",
        1000
      );
      const marketPresence = validChoice(
        required(
          text(form.get("marketPresence")),
          "presencia en el mercado colombiano",
          10
        ),
        YES_NO_OPTIONS,
        "presencia en el mercado colombiano"
      );
      const isCompetitor = validChoice(
        required(text(form.get("isCompetitor")), "competencia de marcas", 10),
        YES_NO_OPTIONS,
        "competencia de marcas"
      );
      const distributionSegment = validChoice(
        required(
          text(form.get("distributionSegment")),
          "segmento comercial",
          100
        ),
        SUPPLIER_DISTRIBUTION_SEGMENTS,
        "segmento comercial"
      );

      detailSection = {
        title: "Oferta comercial",
        fields: [
          ["Categoría", productCategory],
          ["Marcas ofrecidas", brands],
          ["Presencia en Colombia", marketPresence],
          ["Competencia de marcas representadas", isCompetitor],
          ["Segmento de distribución", distributionSegment],
        ],
        content: productTypes,
      };
    } else {
      supplierTypeLabel = "Proveedor de servicios";
      const servicesDescription = required(
        text(form.get("servicesDescription")),
        "descripción de servicios",
        2000
      );
      const companyLocation = required(
        text(form.get("companyLocation")),
        "ubicación de la compañía",
        500
      );
      const websiteUrl = validWebUrl(
        text(form.get("websiteUrl")),
        "página web"
      );

      detailSection = {
        title: "Servicios ofrecidos",
        fields: [
          ["Ubicación y cobertura", companyLocation],
          ["Página web", websiteUrl],
        ],
        content: servicesDescription,
      };
    }

    const portfolio = form.get("portfolio");
    const attachments =
      portfolio instanceof File && portfolio.size > 0
        ? [await fileToAttachment(portfolio, ALLOWED_SUPPLIER_EXTENSIONS)]
        : [];

    const subject = `${supplierTypeLabel} — ${companyName}`;
    const submission = await persistFormSubmission({
      site,
      kind: "suppliers",
      clientRequestId: text(form.get("clientRequestId")),
      contactEmail: email,
      subject,
      data: formFields(form, SUPPLIERS_STORED_FIELDS),
      attachments: attachments.map(
        (attachment) =>
          ({
            filename: attachment.filename,
            contentType: attachment.contentType,
            content: attachment.buffer,
          }) satisfies StoredFormAttachment
      ),
    });
    const notification = await notifySubmission({
      submission,
      site,
      kind: "suppliers",
      email,
      subject,
      internalSubject: `[Proveedores] ${subject}`,
      attachments,
      internalHtml: renderEmail({
        site,
        eyebrow: "Nuevo registro de proveedor",
        title: `${companyName} envió su información comercial`,
        intro: `Se recibió un nuevo registro de proveedor desde el sitio web de ${getEmailBrand(site).name}.`,
        summaryLabel: "Número de radicado",
        summary: submission.trackingNumber,
        sections: [
          {
            title: "Información de la empresa",
            fields: [
              ["Número de radicado", submission.trackingNumber],
              ["Razón social", companyName],
              ["NIT", nit],
              ["Nombre del contacto", contactName],
              ["Correo electrónico", email],
              ["Teléfono", phone],
            ],
          },
          detailSection,
          {
            title: "Portafolio o propuesta comercial",
            content:
              attachments.length > 0
                ? `Se adjuntó el archivo ${attachments[0]?.filename}.`
                : "No se adjuntó ningún archivo.",
          },
        ],
        footerNote:
          "La empresa aceptó el tratamiento de datos personales al enviar este registro. Puedes responder directamente a este correo para contactar a la persona registrada.",
      }),
    });

    return jsonResponse({
      ok: true,
      trackingNumber: submission.trackingNumber,
      notificationSent:
        notification.internalNotificationSent && notification.confirmationSent,
    });
  } catch (error) {
    return handleError(error);
  }
}

function formValue(form: FormData, key: string) {
  return text(form.get(key));
}

export async function handlePqrsRequest(request: Request, site: FormSiteId) {
  try {
    assertSafeFormRequest(request);
    const form = await request.formData();
    if (formValue(form, "website")) return jsonResponse({ ok: true });
    await verifyTurnstile(request, formValue(form, "turnstileToken"), "pqrs");

    const errors = validatePqrsFields(Object.fromEntries(form));
    if (Object.keys(errors).length) {
      return jsonResponse(
        { ok: false, error: Object.values(errors)[0], errors },
        400
      );
    }
    // Exclude inactive identity branches from the email, even on crafted requests.
    const applicant = formValue(form, "tipoSolicitante");
    const natural = applicant === "natural";
    for (const key of [
      "nombres",
      "apellidos",
      "tipoDocumento",
      "numeroDocumento",
      "razonSocial",
      "nit",
      "repNombres",
      "repApellidos",
      "repTipoDocumento",
      "repNumeroDocumento",
    ]) {
      const active = key.startsWith("rep")
        ? applicant === "juridica"
        : ["razonSocial", "nit"].includes(key)
          ? !natural
          : natural;
      if (!active) form.delete(key);
    }

    const email = validEmail(
      required(formValue(form, "email"), "correo electrónico")
    );
    const emailConfirm = validEmail(
      required(
        formValue(form, "emailConfirm"),
        "confirmación del correo electrónico"
      )
    );
    if (email !== emailConfirm) {
      throw new FormRequestError("Los correos electrónicos no coinciden.");
    }

    const tipoSolicitante = validChoice(
      required(formValue(form, "tipoSolicitante"), "tipo de solicitante", 40),
      PQRS_APPLICANT_TYPES,
      "tipo de solicitante"
    );
    const tipoSolicitud = validChoice(
      required(formValue(form, "tipoSolicitud"), "tipo de solicitud", 100),
      PQRS_REQUEST_TYPES,
      "tipo de solicitud"
    );
    const asunto = required(formValue(form, "asunto"), "asunto", 150);
    const relacion = formValue(form, "relacion");
    const causal = formValue(form, "causal");
    const hechos = required(
      formValue(form, "hechos"),
      "hechos y razones",
      4000
    );

    if (tipoSolicitante === "natural") {
      validPersonName(formValue(form, "nombres"), "nombres");
      validPersonName(formValue(form, "apellidos"), "apellidos");
      validChoice(
        formValue(form, "tipoDocumento"),
        PQRS_DOCUMENT_TYPES,
        "tipo de documento"
      );
      validDigits(formValue(form, "numeroDocumento"), "número de documento");
    } else if (tipoSolicitante === "juridica") {
      required(formValue(form, "razonSocial"), "razón social");
      validDigits(formValue(form, "nit"), "NIT");
      validPersonName(
        formValue(form, "repNombres"),
        "nombres del representante"
      );
      validPersonName(
        formValue(form, "repApellidos"),
        "apellidos del representante"
      );
      validChoice(
        formValue(form, "repTipoDocumento"),
        PQRS_DOCUMENT_TYPES,
        "tipo de documento del representante"
      );
      validDigits(
        formValue(form, "repNumeroDocumento"),
        "documento del representante"
      );
    }

    const telefono = formValue(form, "telefono");
    if (telefono) validDigits(telefono, "teléfono");

    for (const [key, label] of [
      ["aceptaTratamiento", "tratamiento de datos personales"],
      ["aceptaRespuestaCorreo", "respuesta por correo electrónico"],
      ["aceptaVeracidad", "declaración de veracidad"],
    ] as const) {
      if (formValue(form, key) !== "true") {
        throw new FormRequestError(`Debes aceptar la ${label}.`);
      }
    }

    const files = form
      .getAll("attachments")
      .filter((value): value is File => value instanceof File);
    if (files.length > PQRS_ATTACHMENT_RULES.maxFiles) {
      throw new FormRequestError(
        `Solo puedes adjuntar hasta ${PQRS_ATTACHMENT_RULES.maxFiles} anexos.`
      );
    }
    const totalBytes = files.reduce((total, file) => total + file.size, 0);
    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
      throw new FormRequestError("El tamaño total de los anexos supera 25 MB.");
    }
    const attachments = await Promise.all(
      files.map((file) => fileToAttachment(file, ALLOWED_PQRS_EXTENSIONS))
    );
    const attachmentNames = files.length
      ? files.map((file) => file.name).join(", ")
      : "No se adjuntaron documentos";
    const representedPerson = !natural
      ? formValue(form, "razonSocial")
      : `${formValue(form, "nombres")} ${formValue(form, "apellidos")}`.trim();

    const subject = `${tipoSolicitud} — ${asunto}`;
    const submission = await persistFormSubmission({
      site,
      kind: "pqrs",
      clientRequestId: formValue(form, "clientRequestId"),
      contactEmail: email,
      subject,
      data: formFields(form, PQRS_STORED_FIELDS),
      attachments: attachments.map(
        (attachment) =>
          ({
            filename: attachment.filename,
            contentType: attachment.contentType,
            content: attachment.buffer,
          }) satisfies StoredFormAttachment
      ),
    });
    const notification = await notifySubmission({
      submission,
      site,
      kind: "pqrs",
      email,
      subject,
      internalSubject: `[PQRS] ${subject}`,
      attachments,
      internalHtml: renderEmail({
        site,
        eyebrow: "Nueva solicitud PQRS",
        title: `${tipoSolicitud} recibida`,
        intro: `Se recibió una solicitud formal dirigida a ${getEmailBrand(site).name}.`,
        summaryLabel: "Número de radicado",
        summary: submission.trackingNumber,
        sections: [
          {
            title: "Resumen de la solicitud",
            fields: [
              ["Número de radicado", submission.trackingNumber],
              ["Tipo de solicitud", tipoSolicitud],
              ["Relación con la empresa", relacion],
              ["Requerimiento explicado", causal],
              ["Estado del canal", "Expediente persistido en la base de datos"],
              ["Tipo de solicitante", tipoSolicitante],
            ],
          },
          {
            title: "Datos del solicitante",
            fields: [
              ["Solicitante", representedPerson],
              ["Tipo de documento", formValue(form, "tipoDocumento")],
              ["Número de documento", formValue(form, "numeroDocumento")],
              ["Razón social", formValue(form, "razonSocial")],
              ["NIT", formValue(form, "nit")],
              [
                "Tipo de documento del representante",
                formValue(form, "repTipoDocumento"),
              ],
              [
                "Representante",
                `${formValue(form, "repNombres")} ${formValue(form, "repApellidos")}`.trim(),
              ],
              [
                "Documento del representante",
                formValue(form, "repNumeroDocumento"),
              ],
            ],
          },
          { title: "Hechos y razones", content: hechos },
          {
            title: "Datos para la respuesta",
            fields: [
              ["Correo electrónico", email],
              ["Teléfono", formValue(form, "telefono")],
            ],
          },
          { title: "Documentos anexos", content: attachmentNames },
        ],
        footerNote:
          "La persona solicitante aceptó el tratamiento de datos personales, la respuesta por correo electrónico y la declaración de veracidad.",
      }),
    });

    return jsonResponse({
      ok: true,
      trackingNumber: submission.trackingNumber,
      notificationSent:
        notification.internalNotificationSent && notification.confirmationSent,
    });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof FormRequestError) {
    return jsonResponse({ ok: false, error: error.message }, error.status);
  }
  if (error instanceof FormDatabaseError) {
    return jsonResponse(
      {
        ok: false,
        error:
          "El canal de recepción no está disponible en este momento. Intenta de nuevo más tarde.",
      },
      503
    );
  }
  console.error("Error inesperado procesando un formulario", error);
  return jsonResponse(
    {
      ok: false,
      error: "No fue posible procesar la solicitud. Intenta de nuevo.",
    },
    500
  );
}
