"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { FileUp, Send } from "lucide-react";
import type { SiteConfig } from "../config/types";
import { RevealGroup } from "../components/RevealGroup";
import { ContactChannels } from "../components/ContactChannels";
import { TurnstileWidget } from "../components/TurnstileWidget";
import {
  createClientRequestId,
  isValidEmail,
  sanitizeDigits,
  sanitizePersonName,
  sanitizePhone,
} from "../lib/formValidation";

type SupplierType = "merchandise" | "services";

const fieldClassName =
  "mt-2 min-h-12 min-w-0 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/75 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20";

const PRODUCT_CATEGORIES = [
  "Alimentos y bebidas",
  "Aseo del hogar",
  "Cuidado personal",
  "Productos institucionales",
  "Licores",
  "Otros",
] as const;

const DISTRIBUTION_SEGMENTS = [
  "Tiendas",
  "Minimercados y supermercados",
  "Mayoristas",
  "Institucional",
  "Bares y licoreras",
  "Otros",
] as const;

function SupplierIntroduction({
  site,
  supplierType,
}: {
  site: SiteConfig;
  supplierType: SupplierType;
}) {
  const isMerchandise = supplierType === "merchandise";

  return (
    <div>
      <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {site.suppliers.eyebrow}
      </span>
      <h1 className="mt-3 text-balance text-4xl font-black tracking-tight text-foreground sm:text-5xl">
        {site.suppliers.title}
      </h1>
      <p className="mt-6 text-lg font-bold text-foreground">
        Quiero ser proveedor de {isMerchandise ? "mercancía" : "servicios"}.
      </p>
      <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        Te damos la bienvenida al formulario de inscripción inicial para hacer
        parte de nuestra comunidad de proveedores de {site.name}.
      </p>
      <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        Al diligenciar este formulario aceptas nuestra política de protección de
        datos personales, disponible en la sección de{" "}
        <Link
          href="/legal/tratamiento-de-datos"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          tratamiento de datos
        </Link>
        .
      </p>
    </div>
  );
}

/** Registration form for merchandise and service suppliers. */
export function SuppliersPage({ site }: { site: SiteConfig }) {
  const [supplierType, setSupplierType] = useState<SupplierType>("merchandise");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const clientRequestIdRef = useRef<string | null>(null);

  function selectSupplierType(nextType: SupplierType) {
    setSupplierType(nextType);
    setSubmitStatus("idle");
    setSubmitMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formElement = event.currentTarget;
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const form = new FormData(formElement);
      form.set("supplierType", supplierType);
      const clientRequestId =
        clientRequestIdRef.current ?? createClientRequestId();
      clientRequestIdRef.current = clientRequestId;
      form.set("clientRequestId", clientRequestId);
      const response = await fetch("/api/forms/suppliers", {
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
          result?.error || "No fue posible enviar el registro de proveedor."
        );
      }

      formElement.reset();
      clientRequestIdRef.current = null;
      setSubmitStatus("success");
      setSubmitMessage(
        result?.trackingNumber
          ? result.notificationSent === false
            ? `Tu registro quedó radicado con el número ${result.trackingNumber}. La confirmación por correo está pendiente.`
            : `Tu registro quedó radicado con el número ${result.trackingNumber}. Te enviamos la confirmación por correo.`
          : "Recibimos tu registro. Nuestro equipo revisará la información enviada."
      );
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "No fue posible enviar el registro. Intenta de nuevo."
      );
    } finally {
      setTurnstileResetSignal((current) => current + 1);
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-background px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-36 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.22fr)] lg:gap-14 xl:gap-20">
        <RevealGroup>
          <SupplierIntroduction site={site} supplierType={supplierType} />
          <ContactChannels site={site} />
        </RevealGroup>

        <RevealGroup>
          <form
            onSubmit={handleSubmit}
            aria-labelledby="suppliers-form-title"
            aria-describedby="suppliers-form-status"
            className="relative min-w-0 rounded-3xl border border-primary/20 bg-primary/10 p-5 shadow-card sm:p-8 lg:p-10"
          >
            <h2 id="suppliers-form-title" className="sr-only">
              Registro de proveedores
            </h2>

            <div
              className="grid gap-3 sm:grid-cols-2"
              role="tablist"
              aria-label="Tipo de proveedor"
            >
              <button
                type="button"
                role="tab"
                aria-selected={supplierType === "merchandise"}
                aria-controls="supplier-fields"
                onClick={() => selectSupplierType("merchandise")}
                className={
                  "min-h-12 rounded-full px-5 text-sm font-bold transition-[background-color,color,transform,box-shadow] hover:-translate-y-0.5 motion-reduce:transform-none " +
                  (supplierType === "merchandise"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background/90 text-foreground hover:bg-background")
                }
              >
                Proveedor de mercancía
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={supplierType === "services"}
                aria-controls="supplier-fields"
                onClick={() => selectSupplierType("services")}
                className={
                  "min-h-12 rounded-full px-5 text-sm font-bold transition-[background-color,color,transform,box-shadow] hover:-translate-y-0.5 motion-reduce:transform-none " +
                  (supplierType === "services"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background/90 text-foreground hover:bg-background")
                }
              >
                Proveedor de servicios
              </button>
            </div>

            <input type="hidden" name="supplierType" value={supplierType} />

            <div
              id="supplier-fields"
              role="tabpanel"
              className="mt-7 grid gap-5 sm:grid-cols-2"
            >
              <label className="text-sm font-semibold text-foreground sm:col-span-2">
                Razón social
                <input
                  className={fieldClassName}
                  type="text"
                  name="companyName"
                  autoComplete="organization"
                  placeholder="Razón social"
                  maxLength={160}
                  required
                />
              </label>

              <label className="text-sm font-semibold text-foreground sm:col-span-2">
                NIT
                <input
                  className={fieldClassName}
                  type="text"
                  name="nit"
                  inputMode="numeric"
                  placeholder="NIT"
                  pattern="[0-9]+"
                  maxLength={15}
                  required
                  onChange={(event) => {
                    event.currentTarget.value = sanitizeDigits(
                      event.currentTarget.value
                    );
                  }}
                />
              </label>

              <label className="text-sm font-semibold text-foreground sm:col-span-2">
                Nombre del contacto
                <input
                  className={fieldClassName}
                  type="text"
                  name="contactName"
                  autoComplete="name"
                  placeholder="Nombre completo"
                  maxLength={120}
                  required
                  onChange={(event) => {
                    event.currentTarget.value = sanitizePersonName(
                      event.currentTarget.value
                    );
                  }}
                />
              </label>

              <label className="text-sm font-semibold text-foreground">
                Teléfono
                <input
                  className={fieldClassName}
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="numeric"
                  placeholder="Teléfono"
                  pattern="[0-9]+"
                  maxLength={15}
                  required
                  onChange={(event) => {
                    event.currentTarget.value = sanitizePhone(
                      event.currentTarget.value
                    );
                  }}
                />
              </label>

              <label className="text-sm font-semibold text-foreground">
                Correo electrónico
                <input
                  className={fieldClassName}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="nombre@empresa.com"
                  maxLength={254}
                  required
                  onChange={(event) =>
                    event.currentTarget.setCustomValidity(
                      isValidEmail(event.currentTarget.value)
                        ? ""
                        : "Ingresa un correo electrónico válido."
                    )
                  }
                />
              </label>

              {supplierType === "merchandise" ? (
                <>
                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    ¿Qué categoría de productos ofrece?
                    <select
                      className={fieldClassName}
                      name="productCategory"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Selecciona una categoría
                      </option>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    ¿Cuáles son las marcas que ofrece?
                    <input
                      className={fieldClassName}
                      type="text"
                      name="brands"
                      placeholder="Indica las marcas que representa"
                      maxLength={500}
                      required
                    />
                  </label>

                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    ¿Qué tipo de productos ofrece?
                    <textarea
                      className={`${fieldClassName} min-h-28 resize-y`}
                      name="productTypes"
                      placeholder="Describe brevemente los productos"
                      maxLength={1000}
                      required
                    />
                  </label>

                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    ¿Tiene o ha tenido presencia en el mercado colombiano?
                    <select
                      className={fieldClassName}
                      name="marketPresence"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </label>

                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    ¿Es competencia de alguna de las marcas representadas por{" "}
                    {site.name}?
                    <select
                      className={fieldClassName}
                      name="isCompetitor"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </label>

                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    ¿A qué segmento comercial desea que se realice la
                    distribución?
                    <select
                      className={fieldClassName}
                      name="distributionSegment"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Selecciona un segmento
                      </option>
                      {DISTRIBUTION_SEGMENTS.map((segment) => (
                        <option key={segment} value={segment}>
                          {segment}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    Describa los servicios ofrecidos por su compañía
                    <textarea
                      className={`${fieldClassName} min-h-32 resize-y`}
                      name="servicesDescription"
                      placeholder="Describe los servicios ofrecidos"
                      maxLength={2000}
                      required
                    />
                  </label>

                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    Ubicación de su compañía
                    <textarea
                      className={`${fieldClassName} min-h-28 resize-y`}
                      name="companyLocation"
                      placeholder="Ciudad de la oficina principal y ciudades donde presta el servicio"
                      maxLength={500}
                      required
                    />
                  </label>

                  <label className="text-sm font-semibold text-foreground sm:col-span-2">
                    Página web
                    <input
                      className={fieldClassName}
                      type="url"
                      name="websiteUrl"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://www.empresa.com"
                      maxLength={300}
                    />
                  </label>
                </>
              )}

              <label className="text-sm font-semibold text-foreground sm:col-span-2">
                Portafolio o propuesta comercial
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  Archivo opcional en PDF, DOC, DOCX, PPT o PPTX. Máximo 10 MB.
                </span>
                <span className="mt-2 flex min-h-12 items-center gap-3 rounded-xl border border-dashed border-primary/35 bg-background px-4 py-3">
                  <FileUp
                    className="h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <input
                    className="min-w-0 flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary"
                    type="file"
                    name="portfolio"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm leading-relaxed text-foreground sm:col-span-2">
                <input
                  type="checkbox"
                  name="data-policy-acceptance"
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  required
                />
                <span>
                  Acepto el tratamiento de mis datos personales conforme a la{" "}
                  <Link
                    href="/legal/tratamiento-de-datos"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    política de tratamiento de datos
                  </Link>
                  .
                </span>
              </label>
            </div>

            <TurnstileWidget
              action="suppliers"
              resetSignal={turnstileResetSignal}
            />

            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            />

            <div
              id="suppliers-form-status"
              className={
                "mt-5 leading-relaxed " +
                (submitStatus === "error"
                  ? "text-sm font-semibold text-destructive"
                  : submitStatus === "success"
                    ? "text-base font-semibold text-primary sm:text-lg"
                    : "text-xs text-muted-foreground")
              }
              aria-live="polite"
            >
              <p>
                {submitMessage ||
                  "Completa los campos para enviar el registro de tu empresa."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-[filter,transform] hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-65 motion-reduce:transform-none"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Enviando…" : "Enviar registro"}
            </button>
          </form>
        </RevealGroup>
      </div>
    </section>
  );
}
