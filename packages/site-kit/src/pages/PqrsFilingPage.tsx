"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileUp,
  Info,
  Paperclip,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  PQRS_ATTACHMENT_RULES,
  PQRS_DOCUMENT_TYPES,
  PQRS_RESPONSE_TERMS_NOTE,
  PQRS_RELATIONSHIPS,
  PQRS_REQUEST_TYPES,
  PQRS_SUBMISSION_NOTE,
} from "../config/pqrsFilingContent";
import type { SiteConfig } from "../config/types";
import { TurnstileWidget } from "../components/TurnstileWidget";
import { cn } from "../lib/cn";
import {
  createClientRequestId,
  isValidEmail,
  sanitizeDigits,
  sanitizePersonName,
  sanitizePhone,
  validatePqrsFields,
} from "../lib/formValidation";

type TipoSolicitante = "natural" | "juridica";

interface FilingFormState {
  relacion: string;
  causal: string;
  tipoSolicitud: string;
  tipoSolicitante: TipoSolicitante;
  // Solicitante persona natural.
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  // Solicitante persona jurídica.
  razonSocial: string;
  nit: string;
  repNombres: string;
  repApellidos: string;
  repTipoDocumento: string;
  repNumeroDocumento: string;
  // Contacto y contenido.
  email: string;
  emailConfirm: string;
  telefono: string;
  asunto: string;
  hechos: string;
  aceptaTratamiento: boolean;
  aceptaRespuestaCorreo: boolean;
  aceptaVeracidad: boolean;
}

function createInitialState(tipoSolicitud: string): FilingFormState {
  return {
    tipoSolicitud,
    relacion: "",
    causal: "",
    tipoSolicitante: "natural",
    nombres: "",
    apellidos: "",
    tipoDocumento: PQRS_DOCUMENT_TYPES[0],
    numeroDocumento: "",
    razonSocial: "",
    nit: "",
    repNombres: "",
    repApellidos: "",
    repTipoDocumento: PQRS_DOCUMENT_TYPES[0],
    repNumeroDocumento: "",
    email: "",
    emailConfirm: "",
    telefono: "",
    asunto: "",
    hechos: "",
    aceptaTratamiento: false,
    aceptaRespuestaCorreo: false,
    aceptaVeracidad: false,
  };
}

function maskDocument(value: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  if (trimmed.length <= 4) {
    return `${"•".repeat(Math.max(trimmed.length - 1, 0))}${trimmed.slice(-1)}`;
  }
  return `${trimmed.slice(0, 2)}${"•".repeat(trimmed.length - 4)}${trimmed.slice(-2)}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const fieldClassName =
  "mt-2 min-h-12 min-w-0 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/75 hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/20";

const errorFieldClassName = "border-destructive focus:border-destructive";

const NUMERIC_FORM_FIELDS = new Set([
  "numeroDocumento",
  "repNumeroDocumento",
  "nit",
  "telefono",
]);

const PERSON_NAME_FORM_FIELDS = new Set([
  "nombres",
  "apellidos",
  "repNombres",
  "repApellidos",
]);

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-destructive"
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/**
 * Formal, independent PQRS filing form. Not linked from any navigation
 * surface — reachable only via the button on the informational PQRS page or
 * by its direct URL. Validation and review happen in the browser before the
 * reviewed request is sent to the server-side filing endpoint.
 */
export function PqrsFilingPage({ site }: { site: SiteConfig }) {
  const requestTypes = useMemo(
    () => PQRS_REQUEST_TYPES.map((category) => category.title as string),
    []
  );
  const [form, setForm] = useState<FilingFormState>(() =>
    createInitialState(requestTypes[0] ?? "")
  );
  useEffect(() => {
    const tipo = new URLSearchParams(window.location.search).get("tipo");
    if (!tipo || !requestTypes.includes(tipo)) return;
    const frame = requestAnimationFrame(() => {
      setForm((current) => ({ ...current, tipoSolicitud: tipo, causal: "" }));
    });
    return () => cancelAnimationFrame(frame);
  }, [requestTypes]);

  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const clientRequestIdRef = useRef<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const reviewRef = useRef<HTMLDivElement | null>(null);

  function update<K extends keyof FilingFormState>(
    key: K,
    value: FilingFormState[K]
  ) {
    setShowReview(false);
    let nextValue = value;
    if (typeof value === "string") {
      const fieldName = String(key);
      if (NUMERIC_FORM_FIELDS.has(fieldName)) {
        nextValue = sanitizeDigits(value) as FilingFormState[K];
      } else if (PERSON_NAME_FORM_FIELDS.has(fieldName)) {
        nextValue = sanitizePersonName(value) as FilingFormState[K];
      }
    }
    setForm((current) => ({
      ...current,
      [key]: nextValue,
      ...(key === "tipoSolicitud" ? { causal: "" } : {}),
    }));
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const combined = [...attachments];
    let error: string | null = null;

    for (const file of incoming) {
      const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      if (
        !PQRS_ATTACHMENT_RULES.acceptedExtensions.includes(
          extension as (typeof PQRS_ATTACHMENT_RULES.acceptedExtensions)[number]
        )
      ) {
        error = `Formato no permitido: ${file.name}. Usa ${PQRS_ATTACHMENT_RULES.acceptedExtensions.join(", ")}.`;
        continue;
      }
      if (file.size > PQRS_ATTACHMENT_RULES.maxFileSizeBytes) {
        error = `${file.name} supera el tamaño máximo por archivo (${formatBytes(PQRS_ATTACHMENT_RULES.maxFileSizeBytes)}).`;
        continue;
      }
      if (combined.length >= PQRS_ATTACHMENT_RULES.maxFiles) {
        error = `Solo puedes adjuntar hasta ${PQRS_ATTACHMENT_RULES.maxFiles} archivos.`;
        break;
      }
      const totalSize =
        combined.reduce((sum, f) => sum + f.size, 0) + file.size;
      if (totalSize > PQRS_ATTACHMENT_RULES.maxTotalSizeBytes) {
        error = `El total de anexos supera ${formatBytes(PQRS_ATTACHMENT_RULES.maxTotalSizeBytes)}.`;
        continue;
      }
      combined.push(file);
    }

    setAttachments(combined);
    setAttachmentError(error);
  }

  function removeAttachment(index: number) {
    setAttachments((current) => current.filter((_, i) => i !== index));
    setAttachmentError(null);
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    const files = attachments;
    const invalidFile = files.find(
      (file) =>
        !file.size ||
        file.size > PQRS_ATTACHMENT_RULES.maxFileSizeBytes ||
        !(
          PQRS_ATTACHMENT_RULES.acceptedExtensions as readonly string[]
        ).includes(`.${file.name.split(".").pop()?.toLowerCase()}`)
    );
    const fileError = invalidFile
      ? `Revisa el formato y tamaño del archivo ${invalidFile.name}.`
      : files.reduce((sum, file) => sum + file.size, 0) >
          PQRS_ATTACHMENT_RULES.maxTotalSizeBytes
        ? "El total de anexos supera 25 MB."
        : null;
    setAttachmentError(fileError);
    if (fileError) next.attachments = fileError;

    if (!form.tipoSolicitud)
      next.tipoSolicitud = "Selecciona un tipo de solicitud.";

    if (form.tipoSolicitante === "natural") {
      if (!form.nombres.trim()) next.nombres = "Ingresa tus nombres.";
      if (!form.apellidos.trim()) next.apellidos = "Ingresa tus apellidos.";
      if (!form.numeroDocumento.trim())
        next.numeroDocumento = "Ingresa tu número de documento.";
    }

    if (form.tipoSolicitante === "juridica") {
      if (!form.razonSocial.trim())
        next.razonSocial = "Ingresa la razón social.";
      if (!form.nit.trim()) next.nit = "Ingresa el NIT.";
      if (!form.repNombres.trim())
        next.repNombres = "Ingresa los nombres del representante.";
      if (!form.repApellidos.trim())
        next.repApellidos = "Ingresa los apellidos del representante.";
      if (!form.repNumeroDocumento.trim())
        next.repNumeroDocumento = "Ingresa el documento del representante.";
    }

    if (!form.email.trim()) {
      next.email = "Ingresa un correo electrónico.";
    } else if (!isValidEmail(form.email)) {
      next.email = "El correo electrónico no es válido.";
    }
    if (!form.emailConfirm.trim()) {
      next.emailConfirm = "Confirma tu correo electrónico.";
    } else if (form.emailConfirm.trim() !== form.email.trim()) {
      next.emailConfirm = "Los correos electrónicos no coinciden.";
    }

    if (!form.asunto.trim()) next.asunto = "Escribe un asunto.";
    if (!form.hechos.trim())
      next.hechos = "Describe los hechos y razones de tu solicitud.";

    if (!form.aceptaTratamiento)
      next.aceptaTratamiento =
        "Debes autorizar el tratamiento de datos personales.";
    if (!form.aceptaRespuestaCorreo)
      next.aceptaRespuestaCorreo =
        "Debes aceptar recibir la respuesta por correo electrónico.";
    if (!form.aceptaVeracidad)
      next.aceptaVeracidad = "Debes declarar que la información es veraz.";

    return { ...next, ...validatePqrsFields({ ...form }) };
  }

  function focusFirstError(nextErrors: Record<string, string>) {
    const firstKey = Object.keys(nextErrors)[0];
    if (!firstKey) return;
    const node = fieldRefs.current[firstKey];
    node?.focus();
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleReview(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setShowReview(false);
      focusFirstError(nextErrors);
      return;
    }

    setShowReview(true);
    requestAnimationFrame(() => {
      reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleSend() {
    if (isSubmitting || submissionStatus === "success") return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setShowReview(false);
      focusFirstError(nextErrors);
      return;
    }
    setIsSubmitting(true);
    setSubmissionStatus("idle");
    setSubmissionMessage("");

    try {
      const body = new FormData();
      body.append(
        "turnstileToken",
        reviewRef.current?.querySelector<HTMLInputElement>(
          'input[name="turnstileToken"]'
        )?.value ?? ""
      );
      for (const [key, value] of Object.entries(form)) {
        body.append(key, String(value));
      }
      const clientRequestId =
        clientRequestIdRef.current ?? createClientRequestId();
      clientRequestIdRef.current = clientRequestId;
      body.append("clientRequestId", clientRequestId);
      for (const file of attachments) body.append("attachments", file);
      const response = await fetch("/api/forms/pqrs", {
        method: "POST",
        body,
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        trackingNumber?: string;
        notificationSent?: boolean;
      } | null;
      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "No fue posible radicar la solicitud."
        );
      }

      setSubmissionStatus("success");
      setSubmissionMessage(
        result?.trackingNumber
          ? result.notificationSent === false
            ? `Tu PQRS quedó radicada con el número ${result.trackingNumber}. La confirmación por correo está pendiente.`
            : `Tu PQRS quedó radicada con el número ${result.trackingNumber}. Te enviamos la confirmación por correo.`
          : "Tu PQRS fue recibida y quedó guardada para gestión."
      );
    } catch (error) {
      setSubmissionStatus("error");
      setSubmissionMessage(
        error instanceof Error
          ? error.message
          : "No fue posible radicar la solicitud. Intenta de nuevo."
      );
    } finally {
      setTurnstileResetSignal((current) => current + 1);
      setIsSubmitting(false);
    }
  }

  const solicitanteResumen = useMemo(() => {
    if (form.tipoSolicitante === "juridica") {
      return `${form.razonSocial || "—"} (NIT ${maskDocument(form.nit)}) · Representante: ${form.repNombres} ${form.repApellidos}`.trim();
    }
    return `${form.nombres} ${form.apellidos}`.trim();
  }, [form]);

  const documentoResumen =
    form.tipoSolicitante === "juridica"
      ? maskDocument(form.repNumeroDocumento)
      : maskDocument(form.numeroDocumento);

  const asuntoCounterId = useId();
  const hechosCounterId = useId();
  const requestContent =
    PQRS_REQUEST_TYPES.find((type) => type.title === form.tipoSolicitud) ??
    PQRS_REQUEST_TYPES[0];

  return (
    <>
      <header className="relative overflow-hidden border-b border-border bg-muted/30 pb-14 pt-32 sm:pb-16 sm:pt-36">
        <div
          className="mesh-gradient absolute inset-0 opacity-80"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/legal/pqrs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver a la página informativa de PQRS
          </Link>

          <span className="mt-6 block text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            PQRS
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Envío de PQRS
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Presenta tu petición, queja, reclamo o solicitud
          </p>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dirigido a</p>
              <p className="text-lg font-bold text-card-foreground">
                {site.legalName}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              La respuesta se enviará exclusivamente por correo electrónico.
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <p className="mb-8 text-sm text-muted-foreground">
          {PQRS_SUBMISSION_NOTE}
        </p>
        <form onSubmit={handleReview} noValidate className="space-y-8">
          {/* A. Tipo de solicitud */}
          <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <legend className="px-1 text-lg font-bold text-card-foreground">
              Tipo de solicitud
            </legend>
            <label className="mt-4 block text-sm font-semibold text-card-foreground">
              Selecciona una opción
              <select
                ref={(el) => {
                  fieldRefs.current.tipoSolicitud = el;
                }}
                className={cn(
                  fieldClassName,
                  errors.tipoSolicitud && errorFieldClassName
                )}
                value={form.tipoSolicitud}
                onChange={(event) =>
                  update("tipoSolicitud", event.target.value)
                }
                aria-invalid={Boolean(errors.tipoSolicitud)}
                aria-describedby={
                  errors.tipoSolicitud ? "tipoSolicitud-error" : undefined
                }
              >
                {requestTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <FieldError
              id="tipoSolicitud-error"
              message={errors.tipoSolicitud}
            />
            <label className="mt-4 block text-sm font-semibold text-card-foreground">
              Relación con la empresa
              <select
                className={fieldClassName}
                value={form.relacion}
                onChange={(e) => update("relacion", e.target.value)}
                ref={(el) => {
                  fieldRefs.current.relacion = el;
                }}
                aria-invalid={Boolean(errors.relacion)}
                aria-describedby="relacion-error"
              >
                <option value="">Selecciona una opción</option>
                {PQRS_RELATIONSHIPS.map((relationship) => (
                  <option key={relationship}>{relationship}</option>
                ))}
              </select>
              <FieldError id="relacion-error" message={errors.relacion} />
            </label>
          </fieldset>

          {/* B. Tipo de solicitante y datos condicionales */}
          <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <legend className="px-1 text-lg font-bold text-card-foreground">
              Tipo de solicitante
            </legend>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "natural", label: "Persona natural" },
                  { value: "juridica", label: "Persona jurídica" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors",
                    form.tipoSolicitante === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40"
                  )}
                >
                  <input
                    type="radio"
                    name="tipoSolicitante"
                    value={option.value}
                    checked={form.tipoSolicitante === option.value}
                    onChange={() => update("tipoSolicitante", option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {form.tipoSolicitante === "natural" && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-card-foreground">
                  Nombres
                  <input
                    ref={(el) => {
                      fieldRefs.current.nombres = el;
                    }}
                    className={cn(
                      fieldClassName,
                      errors.nombres && errorFieldClassName
                    )}
                    type="text"
                    value={form.nombres}
                    onChange={(e) => update("nombres", e.target.value)}
                    aria-invalid={Boolean(errors.nombres)}
                  />
                  <FieldError id="nombres-error" message={errors.nombres} />
                </label>
                <label className="text-sm font-semibold text-card-foreground">
                  Apellidos
                  <input
                    ref={(el) => {
                      fieldRefs.current.apellidos = el;
                    }}
                    className={cn(
                      fieldClassName,
                      errors.apellidos && errorFieldClassName
                    )}
                    type="text"
                    value={form.apellidos}
                    onChange={(e) => update("apellidos", e.target.value)}
                    aria-invalid={Boolean(errors.apellidos)}
                  />
                  <FieldError id="apellidos-error" message={errors.apellidos} />
                </label>
                <label className="text-sm font-semibold text-card-foreground">
                  Tipo de documento
                  <select
                    className={fieldClassName}
                    value={form.tipoDocumento}
                    onChange={(e) => update("tipoDocumento", e.target.value)}
                  >
                    {PQRS_DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-card-foreground">
                  Número de documento
                  <input
                    ref={(el) => {
                      fieldRefs.current.numeroDocumento = el;
                    }}
                    className={cn(
                      fieldClassName,
                      errors.numeroDocumento && errorFieldClassName
                    )}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={30}
                    value={form.numeroDocumento}
                    onChange={(e) => update("numeroDocumento", e.target.value)}
                    aria-invalid={Boolean(errors.numeroDocumento)}
                  />
                  <FieldError
                    id="numeroDocumento-error"
                    message={errors.numeroDocumento}
                  />
                </label>
              </div>
            )}

            {form.tipoSolicitante === "juridica" && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-card-foreground">
                  Razón social
                  <input
                    ref={(el) => {
                      fieldRefs.current.razonSocial = el;
                    }}
                    className={cn(
                      fieldClassName,
                      errors.razonSocial && errorFieldClassName
                    )}
                    type="text"
                    value={form.razonSocial}
                    onChange={(e) => update("razonSocial", e.target.value)}
                    aria-invalid={Boolean(errors.razonSocial)}
                  />
                  <FieldError
                    id="razonSocial-error"
                    message={errors.razonSocial}
                  />
                </label>
                <label className="text-sm font-semibold text-card-foreground">
                  NIT
                  <input
                    ref={(el) => {
                      fieldRefs.current.nit = el;
                    }}
                    className={cn(
                      fieldClassName,
                      errors.nit && errorFieldClassName
                    )}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={30}
                    value={form.nit}
                    onChange={(e) => update("nit", e.target.value)}
                    aria-invalid={Boolean(errors.nit)}
                  />
                  <FieldError id="nit-error" message={errors.nit} />
                </label>
                <label className="text-sm font-semibold text-card-foreground">
                  Nombres del representante
                  <input
                    ref={(el) => {
                      fieldRefs.current.repNombres = el;
                    }}
                    className={cn(
                      fieldClassName,
                      errors.repNombres && errorFieldClassName
                    )}
                    type="text"
                    value={form.repNombres}
                    onChange={(e) => update("repNombres", e.target.value)}
                    aria-invalid={Boolean(errors.repNombres)}
                  />
                  <FieldError
                    id="repNombres-error"
                    message={errors.repNombres}
                  />
                </label>
                <label className="text-sm font-semibold text-card-foreground">
                  Apellidos del representante
                  <input
                    ref={(el) => {
                      fieldRefs.current.repApellidos = el;
                    }}
                    className={cn(
                      fieldClassName,
                      errors.repApellidos && errorFieldClassName
                    )}
                    type="text"
                    value={form.repApellidos}
                    onChange={(e) => update("repApellidos", e.target.value)}
                    aria-invalid={Boolean(errors.repApellidos)}
                  />
                  <FieldError
                    id="repApellidos-error"
                    message={errors.repApellidos}
                  />
                </label>
                <label className="text-sm font-semibold text-card-foreground">
                  Tipo de documento del representante
                  <select
                    className={fieldClassName}
                    value={form.repTipoDocumento}
                    onChange={(e) => update("repTipoDocumento", e.target.value)}
                  >
                    {PQRS_DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-card-foreground">
                  Número de documento del representante
                  <input
                    ref={(el) => {
                      fieldRefs.current.repNumeroDocumento = el;
                    }}
                    className={cn(
                      fieldClassName,
                      errors.repNumeroDocumento && errorFieldClassName
                    )}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={30}
                    value={form.repNumeroDocumento}
                    onChange={(e) =>
                      update("repNumeroDocumento", e.target.value)
                    }
                    aria-invalid={Boolean(errors.repNumeroDocumento)}
                  />
                  <FieldError
                    id="repNumeroDocumento-error"
                    message={errors.repNumeroDocumento}
                  />
                </label>
              </div>
            )}
          </fieldset>

          {/* C. Datos de contacto */}
          <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <legend className="px-1 text-lg font-bold text-card-foreground">
              Datos de contacto
            </legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-card-foreground">
                Correo electrónico
                <input
                  ref={(el) => {
                    fieldRefs.current.email = el;
                  }}
                  className={cn(
                    fieldClassName,
                    errors.email && errorFieldClassName
                  )}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="Ingresa un correo electrónico válido"
                  aria-invalid={Boolean(errors.email)}
                />
                <FieldError id="email-error" message={errors.email} />
              </label>
              <label className="text-sm font-semibold text-card-foreground">
                Confirmar correo electrónico
                <input
                  ref={(el) => {
                    fieldRefs.current.emailConfirm = el;
                  }}
                  className={cn(
                    fieldClassName,
                    errors.emailConfirm && errorFieldClassName
                  )}
                  type="email"
                  inputMode="email"
                  value={form.emailConfirm}
                  onChange={(e) => update("emailConfirm", e.target.value)}
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="Ingresa un correo electrónico válido"
                  aria-invalid={Boolean(errors.emailConfirm)}
                />
                <FieldError
                  id="emailConfirm-error"
                  message={errors.emailConfirm}
                />
              </label>
              <label className="text-sm font-semibold text-card-foreground sm:col-span-2">
                Número telefónico (opcional, dato complementario)
                <input
                  ref={(el) => {
                    fieldRefs.current.telefono = el;
                  }}
                  className={fieldClassName}
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  value={form.telefono}
                  onChange={(e) =>
                    update("telefono", sanitizePhone(e.target.value))
                  }
                />
                <FieldError id="telefono-error" message={errors.telefono} />
              </label>
            </div>
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              Medio de respuesta: correo electrónico
            </p>
          </fieldset>

          {/* E. Contenido de la solicitud */}
          <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <legend className="px-1 text-lg font-bold text-card-foreground">
              Contenido de la solicitud
            </legend>

            <label className="mt-4 block text-sm font-semibold text-card-foreground">
              Asunto
              <input
                ref={(el) => {
                  fieldRefs.current.asunto = el;
                }}
                className={cn(
                  fieldClassName,
                  errors.asunto && errorFieldClassName
                )}
                type="text"
                maxLength={150}
                value={form.asunto}
                onChange={(e) => update("asunto", e.target.value)}
                aria-invalid={Boolean(errors.asunto)}
                aria-describedby={asuntoCounterId}
              />
              <span
                id={asuntoCounterId}
                className="mt-1 block text-right text-xs text-muted-foreground"
              >
                {form.asunto.length}/150
              </span>
              <FieldError id="asunto-error" message={errors.asunto} />
            </label>

            <label className="mt-4 block text-sm font-semibold text-card-foreground">
              Explique su requerimiento
              <input
                ref={(el) => {
                  fieldRefs.current.causal = el;
                }}
                className={cn(
                  fieldClassName,
                  errors.causal && errorFieldClassName
                )}
                maxLength={200}
                value={form.causal}
                onChange={(e) => update("causal", e.target.value)}
                aria-invalid={Boolean(errors.causal)}
                aria-describedby="causal-help causal-error"
              />
              <span
                id="causal-help"
                className="mt-2 block text-xs text-muted-foreground"
              >
                Describe brevemente el requerimiento en tus palabras.
              </span>
              <FieldError id="causal-error" message={errors.causal} />
            </label>

            <label className="mt-4 block text-sm font-semibold text-card-foreground">
              Hechos y razones
              <textarea
                ref={(el) => {
                  fieldRefs.current.hechos = el;
                }}
                className={cn(
                  fieldClassName,
                  "min-h-40 resize-y",
                  errors.hechos && errorFieldClassName
                )}
                maxLength={4000}
                placeholder={requestContent.narrative}
                value={form.hechos}
                onChange={(e) => update("hechos", e.target.value)}
                aria-invalid={Boolean(errors.hechos)}
                aria-describedby={hechosCounterId}
              />
              <span
                id={hechosCounterId}
                className="mt-1 block text-right text-xs text-muted-foreground"
              >
                {form.hechos.length}/4000
              </span>
              <FieldError id="hechos-error" message={errors.hechos} />
            </label>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {requestContent.narrative} Describe los hechos de forma clara,
              cronológica y evita incluir información sensible que no sea
              necesaria para resolver la solicitud.
            </p>
          </fieldset>

          {/* F. Documentos anexos */}
          <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <legend className="px-1 text-lg font-bold text-card-foreground">
              Documentos anexos
            </legend>

            <label
              className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface p-6 text-center transition-colors hover:border-primary/40"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesSelected(e.dataTransfer.files);
              }}
            >
              <FileUp className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground">
                Arrastra tus archivos aquí o haz clic para seleccionarlos
              </span>
              <span className="text-xs text-muted-foreground">
                {PQRS_ATTACHMENT_RULES.acceptedExtensions.join(", ")} · máx.{" "}
                {formatBytes(PQRS_ATTACHMENT_RULES.maxFileSizeBytes)} por
                archivo · hasta {PQRS_ATTACHMENT_RULES.maxFiles} archivos
              </span>
              <input
                type="file"
                multiple
                accept={PQRS_ATTACHMENT_RULES.acceptAttribute}
                className="sr-only"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </label>

            {attachmentError && (
              <p
                role="alert"
                className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-destructive"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {attachmentError}
              </p>
            )}

            {attachments.length > 0 && (
              <ul className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Paperclip
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium text-foreground">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      aria-label={`Quitar ${file.name}`}
                      className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          {/* Términos generales (referencia, pendiente de revisión jurídica) */}
          <aside className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-surface p-5 text-sm leading-relaxed text-muted-foreground">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p>{PQRS_RESPONSE_TERMS_NOTE}</p>
          </aside>

          {/* G. Autorizaciones y declaraciones */}
          <fieldset className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <legend className="px-1 text-lg font-bold text-card-foreground">
              Autorizaciones y declaraciones
            </legend>

            <div className="mt-4 space-y-4">
              <label
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
                  errors.aceptaTratamiento
                    ? "border-destructive"
                    : "border-border"
                )}
              >
                <input
                  ref={(el) => {
                    fieldRefs.current.aceptaTratamiento = el;
                  }}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-primary"
                  checked={form.aceptaTratamiento}
                  onChange={(e) =>
                    update("aceptaTratamiento", e.target.checked)
                  }
                  aria-invalid={Boolean(errors.aceptaTratamiento)}
                />
                <span>
                  Autorizo de manera previa, expresa e informada el tratamiento
                  de mis datos personales por parte de {site.legalName} para la
                  recepción, gestión, respuesta y seguimiento de esta solicitud,
                  de acuerdo con la{" "}
                  <Link
                    href="/legal/tratamiento-de-datos"
                    className="font-semibold text-primary underline decoration-primary/40 hover:text-primary/80"
                  >
                    Política de Tratamiento de Datos Personales
                  </Link>
                  , que declaro haber leído. Esta autorización no cubre
                  finalidades comerciales adicionales.
                  <FieldError
                    id="aceptaTratamiento-error"
                    message={errors.aceptaTratamiento}
                  />
                </span>
              </label>

              <label
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
                  errors.aceptaRespuestaCorreo
                    ? "border-destructive"
                    : "border-border"
                )}
              >
                <input
                  ref={(el) => {
                    fieldRefs.current.aceptaRespuestaCorreo = el;
                  }}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-primary"
                  checked={form.aceptaRespuestaCorreo}
                  onChange={(e) =>
                    update("aceptaRespuestaCorreo", e.target.checked)
                  }
                  aria-invalid={Boolean(errors.aceptaRespuestaCorreo)}
                />
                <span>
                  Acepto recibir requerimientos, comunicaciones y respuesta
                  exclusivamente en el correo electrónico registrado.
                  <FieldError
                    id="aceptaRespuestaCorreo-error"
                    message={errors.aceptaRespuestaCorreo}
                  />
                </span>
              </label>

              <label
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
                  errors.aceptaVeracidad
                    ? "border-destructive"
                    : "border-border"
                )}
              >
                <input
                  ref={(el) => {
                    fieldRefs.current.aceptaVeracidad = el;
                  }}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-primary"
                  checked={form.aceptaVeracidad}
                  onChange={(e) => update("aceptaVeracidad", e.target.checked)}
                  aria-invalid={Boolean(errors.aceptaVeracidad)}
                />
                <span>
                  Declaro que la información suministrada es clara y veraz, y
                  que los documentos anexados corresponden a la solicitud
                  presentada.
                  <FieldError
                    id="aceptaVeracidad-error"
                    message={errors.aceptaVeracidad}
                  />
                </span>
              </label>
            </div>
          </fieldset>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-6 py-3 font-semibold text-primary-foreground transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none"
            >
              Revisar antes de enviar
            </button>
          </div>
        </form>

        {/* Revisión final */}
        {showReview && (
          <div
            ref={reviewRef}
            className="mt-10 scroll-mt-28 rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-card sm:p-8"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2
                className="h-6 w-6 text-primary"
                aria-hidden="true"
              />
              <h2 className="text-xl font-bold text-foreground">
                Revisa tu solicitud antes de enviarla
              </h2>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Tipo de solicitud
                </dt>
                <dd className="mt-1 text-foreground">{form.tipoSolicitud}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Solicitante
                </dt>
                <dd className="mt-1 text-foreground">{solicitanteResumen}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Documento
                </dt>
                <dd className="mt-1 text-foreground">{documentoResumen}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Correo de respuesta
                </dt>
                <dd className="mt-1 text-foreground">{form.email}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Asunto
                </dt>
                <dd className="mt-1 text-foreground">{form.asunto}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Relación y requerimiento
                </dt>
                <dd className="mt-1 whitespace-pre-line text-foreground">
                  {form.relacion}: {form.causal}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Hechos y razones
                </dt>
                <dd className="mt-1 whitespace-pre-line text-foreground">
                  {form.hechos}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Documentos anexos
                </dt>
                <dd className="mt-1 text-foreground">
                  {attachments.length > 0
                    ? attachments.map((f) => f.name).join(", ")
                    : "Ninguno"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Autorizaciones aceptadas
                </dt>
                <dd className="mt-1 text-foreground">
                  Tratamiento de datos, respuesta por correo electrónico y
                  declaración de veracidad.
                </dd>
              </div>
            </dl>

            <TurnstileWidget resetSignal={turnstileResetSignal} />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Corregir información
              </button>
              <button
                type="button"
                disabled={
                  !site.pqrs.filing.backendAvailable ||
                  isSubmitting ||
                  submissionStatus === "success"
                }
                onClick={handleSend}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-[filter,transform] hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {isSubmitting
                  ? "Enviando…"
                  : submissionStatus === "success"
                    ? "Solicitud enviada"
                    : "Enviar solicitud"}
              </button>
            </div>

            <p
              className={cn(
                "mt-4 flex items-start gap-2 text-sm leading-relaxed",
                submissionStatus === "error"
                  ? "text-destructive"
                  : submissionStatus === "success"
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
              aria-live="polite"
            >
              <ShieldAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {submissionMessage ||
                "La información se enviará de forma segura al correo de atención de la empresa."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
