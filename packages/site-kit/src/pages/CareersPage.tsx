"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, FileUp, Send } from "lucide-react";
import type { SiteConfig } from "../config/types";
import { PageIntro } from "../components/PageIntro";
import { RevealGroup } from "../components/RevealGroup";
import { TurnstileWidget } from "../components/TurnstileWidget";
import {
  createClientRequestId,
  isValidEmail,
  sanitizePhone,
} from "../lib/formValidation";

const fieldClassName =
  "mt-2 min-h-12 min-w-0 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/75 hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/20";

const actionClassName =
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";

const DEMO_JOBS = [
  {
    id: "commercial-demo",
    title: "Asesor/a comercial",
    area: "commercial",
    department: "Comercial",
    location: "Bogotá D.C. · Presencial",
    description:
      "Ejemplo de un perfil orientado a la atención de clientes, el seguimiento de pedidos y el desarrollo de relaciones comerciales.",
  },
  {
    id: "logistics-demo",
    title: "Auxiliar de logística",
    area: "logistics",
    department: "Logística y distribución",
    location: "Cundinamarca · Presencial",
    description:
      "Ejemplo de un perfil de apoyo a la recepción de mercancía, la organización de inventarios y la preparación de despachos.",
  },
  {
    id: "administrative-demo",
    title: "Asistente administrativo/a",
    area: "administrative",
    department: "Administrativa",
    location: "Bogotá D.C. · Presencial",
    description:
      "Ejemplo de un perfil enfocado en la gestión documental, el registro de información y el apoyo a los equipos internos.",
  },
] as const;

const COLOMBIAN_DEPARTMENTS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
  "Bogotá D.C.",
] as const;

/**
 * Careers route with a server-side submission channel and attachment support.
 */
export function CareersPage({ site }: { site: SiteConfig }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<
    (typeof DEMO_JOBS)[number] | null
  >(null);
  const [area, setArea] = useState("");
  const formTitleRef = useRef<HTMLHeadingElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const clientRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isFormOpen) formTitleRef.current?.focus();
  }, [isFormOpen, selectedJob]);

  function openApplication(job: (typeof DEMO_JOBS)[number] | null) {
    setSelectedJob(job);
    if (job) setArea(job.area);
    setSubmitStatus("idle");
    setSubmitMessage("");
    setIsFormOpen(true);
    if (isFormOpen) formTitleRef.current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || selectedJob) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const clientRequestId =
        clientRequestIdRef.current ?? createClientRequestId();
      clientRequestIdRef.current = clientRequestId;
      form.set("clientRequestId", clientRequestId);
      const response = await fetch("/api/forms/careers", {
        method: "POST",
        body: form,
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        trackingNumber?: string;
        notificationSent?: boolean;
      } | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "No fue posible enviar la postulación."
        );
      }

      formElement.reset();
      setArea("");
      clientRequestIdRef.current = null;
      setSubmitStatus("success");
      setSubmitMessage(
        result?.trackingNumber
          ? result.notificationSent === false
            ? `Tu postulación quedó radicada con el número ${result.trackingNumber}. La confirmación por correo está pendiente.`
            : `Tu postulación quedó radicada con el número ${result.trackingNumber}. Te enviamos la confirmación por correo.`
          : "Recibimos tu postulación. El equipo de selección la revisará."
      );
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "No fue posible enviar la postulación. Intenta de nuevo."
      );
    } finally {
      setTurnstileResetSignal((current) => current + 1);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageIntro copy={site.careers} />

      <section
        aria-labelledby="careers-board-title"
        className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Nuestro equipo
        </p>
        <h2
          id="careers-board-title"
          className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Bolsa de trabajo
        </h2>
        <div className="mt-6 rounded-2xl border border-border bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-bold text-foreground">
            Demostración: no son vacantes reales.
          </p>
          <p className="mt-1">
            Estas ofertas contienen datos ficticios para mostrar cómo funciona
            la bolsa de trabajo. No hay procesos de selección abiertos asociados
            a estas tarjetas. Puedes enviar tu perfil por el canal real de envío
            de currículum.
          </p>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {DEMO_JOBS.map((job) => (
            <li
              key={job.id}
              className="flex min-w-0 flex-col rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
            >
              <span className="self-start rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                Oferta ficticia · Demostración
              </span>
              <p className="mt-6 text-sm font-semibold text-primary">
                {job.department}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-card-foreground">
                {job.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {job.location}
              </p>
              <p className="mb-6 mt-4 text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </p>
              <button
                type="button"
                className={actionClassName + " mt-auto w-full"}
                disabled={isSubmitting}
                aria-controls="careers-application"
                aria-expanded={isFormOpen && selectedJob?.id === job.id}
                aria-label={`Explorar ejemplo: ${job.title}`}
                onClick={() => openApplication(job)}
              >
                Explorar ejemplo
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold">
              Tu talento también tiene espacio aquí
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Este es nuestro canal real para recibir tu currículum. Compártenos
              tu experiencia para futuras oportunidades, sin vincularte a una
              oferta de demostración.
            </p>
          </div>
          <button
            type="button"
            className={actionClassName + " w-full shrink-0 lg:w-auto"}
            disabled={isSubmitting}
            aria-controls="careers-application"
            aria-expanded={isFormOpen && !selectedJob}
            onClick={() => openApplication(null)}
          >
            Danos tu currículum
          </button>
        </div>
      </section>

      <section
        id="careers-application"
        aria-labelledby={isFormOpen ? "careers-form-title" : undefined}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      >
        {isFormOpen && (
          <RevealGroup className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14 xl:gap-20">
            <div className="space-y-6">
              <figure className="relative overflow-hidden rounded-3xl border border-border bg-muted shadow-card">
                <Image
                  src={site.careers.image.src}
                  alt={site.careers.image.alt}
                  width={site.careers.image.width}
                  height={site.careers.image.height}
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </figure>
            </div>

            <form
              onSubmit={handleSubmit}
              aria-labelledby="careers-form-title"
              className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8 lg:p-10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2
                id="careers-form-title"
                ref={formTitleRef}
                tabIndex={-1}
                className="mt-6 scroll-mt-32 rounded-sm text-3xl font-bold tracking-tight text-card-foreground focus:outline-none"
              >
                Perfil laboral
              </h2>

              <div
                className="mt-5 rounded-2xl border border-border bg-muted p-4 text-sm leading-relaxed"
                aria-live="polite"
              >
                <p className="font-bold">
                  {selectedJob
                    ? `Demostración: ${selectedJob.title}`
                    : "Danos tu currículum"}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {selectedJob
                    ? "Esta oferta es ficticia y no admite postulaciones. Preseleccionamos su área para explorar el formulario; no se enviarán datos en este modo."
                    : "Tu currículum se enviará al equipo de selección para futuras oportunidades, sin asociarlo a una vacante específica."}
                </p>
                {selectedJob && (
                  <button
                    type="button"
                    className="mt-3 min-h-11 cursor-pointer rounded px-1 font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => openApplication(null)}
                  >
                    Cambiar a envío de currículum
                  </button>
                )}
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-card-foreground">
                  Nombre completo
                  <input
                    className={fieldClassName}
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    required
                  />
                </label>

                <label className="text-sm font-semibold text-card-foreground">
                  Correo electrónico
                  <input
                    className={fieldClassName}
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="nombre@correo.com"
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    title="Ingresa un correo electrónico válido"
                    onChange={(event) =>
                      event.currentTarget.setCustomValidity(
                        isValidEmail(event.currentTarget.value)
                          ? ""
                          : "Ingresa un correo electrónico válido."
                      )
                    }
                  />
                </label>

                <label className="text-sm font-semibold text-card-foreground">
                  Número telefónico
                  <input
                    className={fieldClassName}
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    inputMode="numeric"
                    placeholder="Número de contacto"
                    required
                    pattern="[0-9]+"
                    onChange={(event) => {
                      event.currentTarget.value = sanitizePhone(
                        event.currentTarget.value
                      );
                    }}
                  />
                </label>

                <label className="text-sm font-semibold text-card-foreground">
                  Departamento o ciudad de residencia
                  <select
                    className={fieldClassName}
                    name="city"
                    autoComplete="address-level1"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Selecciona una opción
                    </option>
                    {COLOMBIAN_DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                    <option value="Otro / exterior">Otro / exterior</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-card-foreground sm:col-span-2">
                  Cargo o área de interés
                  <select
                    className={fieldClassName}
                    name="area"
                    value={area}
                    onChange={(event) => setArea(event.currentTarget.value)}
                    required
                  >
                    <option value="" disabled>
                      Selecciona una opción
                    </option>
                    <option value="commercial">Comercial</option>
                    <option value="logistics">Logística y distribución</option>
                    <option value="administrative">Administrativa</option>
                    <option value="other">Otra área</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-card-foreground sm:col-span-2">
                  Perfil o experiencia
                  <textarea
                    className={fieldClassName + " min-h-36 resize-y"}
                    name="profile"
                    placeholder="Describe brevemente tu experiencia e intereses"
                    required
                  />
                </label>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="careers-cv"
                    className="text-sm font-semibold text-card-foreground"
                  >
                    Hoja de vida
                  </label>
                  <input
                    id="careers-cv"
                    className={
                      fieldClassName +
                      " min-h-14 cursor-pointer p-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-primary-foreground"
                    }
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    aria-describedby="careers-file-help"
                    required
                  />
                  <p
                    id="careers-file-help"
                    className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                  >
                    <FileUp
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>Formatos: PDF, DOC o DOCX.</span>
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
                <input
                  id="careers-data-policy"
                  className="mt-1 h-5 w-5 shrink-0 accent-primary"
                  type="checkbox"
                  name="data-policy-acceptance"
                  required
                />
                <span>
                  <label htmlFor="careers-data-policy">
                    He leído la información disponible sobre el tratamiento de
                    datos personales y acepto su aplicación a mi postulación.
                  </label>{" "}
                  <Link
                    href="/legal/tratamiento-de-datos"
                    className="font-semibold text-primary underline decoration-primary/40 transition-colors hover:text-primary/80"
                  >
                    Consultar tratamiento de datos
                  </Link>
                  .
                </span>
              </div>

              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-px w-px overflow-hidden"
              />

              <p
                className={
                  "mt-5 text-xs leading-relaxed " +
                  (submitStatus === "error"
                    ? "text-destructive"
                    : submitStatus === "success"
                      ? "text-primary"
                      : "text-muted-foreground")
                }
                aria-live="polite"
              >
                {submitMessage ||
                  "Adjunta tu hoja de vida para que podamos revisar tu perfil."}
              </p>

              {!selectedJob && (
                <TurnstileWidget resetSignal={turnstileResetSignal} />
              )}

              <button
                type="submit"
                disabled={isSubmitting || !!selectedJob}
                className="mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-[filter,transform] hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-65 sm:w-auto"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {selectedJob
                  ? "Envío no disponible en demostración"
                  : isSubmitting
                    ? "Enviando…"
                    : "Enviar postulación"}
              </button>
            </form>
          </RevealGroup>
        )}
      </section>
    </>
  );
}
