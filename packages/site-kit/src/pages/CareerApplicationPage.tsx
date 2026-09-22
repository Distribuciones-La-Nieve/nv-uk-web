"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  FileUp,
  MapPin,
  Send,
} from "lucide-react";
import type { CareerJob } from "../config/careersContent";
import type { SiteConfig } from "../config/types";
import { TurnstileWidget } from "../components/TurnstileWidget";
import {
  createClientRequestId,
  isValidEmail,
  sanitizePhone,
} from "../lib/formValidation";

const fieldClassName =
  "mt-2 min-h-12 min-w-0 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/75 hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/20";

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

export function CareerApplicationPage({
  site,
  job,
}: {
  site: SiteConfig;
  job?: CareerJob;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const clientRequestIdRef = useRef<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

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
      clientRequestIdRef.current = null;
      setSubmitStatus("success");
      setSubmitMessage(
        result.trackingNumber
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
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
      <Link
        href="/trabaja-con-nosotros"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a las vacantes
      </Link>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
        {job ? (
          <aside className="self-start overflow-hidden rounded-3xl border border-border bg-primary/5 lg:sticky lg:top-28">
            <div className="p-6 sm:p-8">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                Vacante seleccionada
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                {job.title}
              </h1>
              <p className="mt-4 flex items-start gap-2 font-semibold text-muted-foreground">
                <Building2
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {site.legalName} · {job.department}
              </p>
              <p className="mt-3 flex items-start gap-2 text-muted-foreground">
                <MapPin
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {job.city} · {job.workMode}
              </p>
              <dl className="mt-7 grid gap-4 border-t border-border pt-6 text-sm">
                <div>
                  <dt className="font-bold text-foreground">
                    Tipo de contrato
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{job.contract}</dd>
                </div>
                <div>
                  <dt className="font-bold text-foreground">Jornada</dt>
                  <dd className="mt-1 text-muted-foreground">{job.schedule}</dd>
                </div>
                <div>
                  <dt className="font-bold text-foreground">Experiencia</dt>
                  <dd className="mt-1 text-muted-foreground">
                    {job.experience}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        ) : (
          <figure className="relative self-start overflow-hidden rounded-3xl border border-border bg-muted shadow-card">
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
        )}

        <form
          onSubmit={handleSubmit}
          className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8 lg:p-10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-primary">
            {job ? "Postulación" : "Perfil laboral"}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">
            {job ? "Completa tu perfil" : "Queremos conocerte"}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {job
              ? `Tu hoja de vida quedará asociada a la vacante ${job.title}.`
              : "Tu hoja de vida será enviada al equipo de selección para futuras oportunidades."}
          </p>

          {job && (
            <>
              <input type="hidden" name="vacancyId" value={job.id} />
              <input type="hidden" name="vacancyTitle" value={job.title} />
              <input type="hidden" name="area" value={job.area} />
            </>
          )}

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

            {!job && (
              <label className="text-sm font-semibold text-card-foreground sm:col-span-2">
                Cargo o área de interés
                <select
                  className={fieldClassName}
                  name="area"
                  defaultValue=""
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
            )}

            <label className="text-sm font-semibold text-card-foreground sm:col-span-2">
              Perfil o experiencia
              <textarea
                className={fieldClassName + " min-h-36 resize-y"}
                name="profile"
                placeholder={
                  job
                    ? "Describe brevemente tu experiencia relacionada con esta vacante"
                    : "Describe brevemente tu experiencia e intereses"
                }
                required
              />
            </label>

            <div className="sm:col-span-2">
              <label
                htmlFor="vacancy-resume"
                className="text-sm font-semibold text-card-foreground"
              >
                Hoja de vida
              </label>
              <input
                id="vacancy-resume"
                className={
                  fieldClassName +
                  " min-h-14 cursor-pointer p-2 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-primary-foreground"
                }
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                aria-describedby="vacancy-file-help"
                required
              />
              <p
                id="vacancy-file-help"
                className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
              >
                <FileUp
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                Formatos: PDF, DOC o DOCX.
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
            <input
              id="vacancy-data-policy"
              className="mt-1 h-5 w-5 shrink-0 accent-primary"
              type="checkbox"
              name="data-policy-acceptance"
              required
            />
            <span>
              <label htmlFor="vacancy-data-policy">
                He leído la información sobre el tratamiento de datos personales
                y acepto su aplicación a mi postulación.
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
              "mt-5 text-sm leading-relaxed " +
              (submitStatus === "error"
                ? "text-destructive"
                : submitStatus === "success"
                  ? "font-semibold text-primary"
                  : "text-muted-foreground")
            }
            aria-live="polite"
          >
            {submitMessage ||
              (job
                ? `Adjunta tu hoja de vida para postularte a ${job.title}.`
                : "Adjunta tu hoja de vida para que podamos revisar tu perfil.")}
          </p>

          <TurnstileWidget
            action="careers"
            resetSignal={turnstileResetSignal}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-[filter,transform] hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-65 sm:w-auto"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {isSubmitting
              ? "Enviando…"
              : job
                ? "Enviar postulación"
                : "Enviar currículum"}
          </button>
        </form>
      </div>
    </main>
  );
}
