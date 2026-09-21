import Link from "next/link";
import { ArrowRight, MessageSquareWarning } from "lucide-react";
import type { SiteConfig } from "../config/types";
import { FeatureCard } from "../components/FeatureCard";
import { PageIntro } from "../components/PageIntro";
import { RevealGroup } from "../components/RevealGroup";
import {
  PQRS_REQUEST_TYPES,
  PQRS_SUBMISSION_NOTE,
} from "../config/pqrsFilingContent";

/** PQRS information route with a formal submission channel. */
export function PqrsPage({ site }: { site: SiteConfig }) {
  return (
    <>
      <PageIntro
        copy={{
          ...site.pqrs,
          title: "Peticiones, quejas, reclamos y solicitudes",
        }}
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Tipos de solicitud
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Identifica la categoría de tu mensaje
          </h2>
        </div>

        <RevealGroup
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
        >
          {PQRS_REQUEST_TYPES.map((category) => (
            <FeatureCard key={category.title} feature={category} />
          ))}
        </RevealGroup>

        <RevealGroup className="mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-10">
            <div
              className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary-foreground/10"
              aria-hidden="true"
            />
            <div className="relative flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15">
                <MessageSquareWarning className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  Envía tu solicitud
                </h2>
                <p className="mt-2 leading-relaxed text-primary-foreground/80">
                  Puedes escribirnos como cliente, proveedor u otro interesado.{" "}
                  {PQRS_SUBMISSION_NOTE}
                </p>
                {site.pqrs.filing.enabled && (
                  <Link
                    href="/legal/pqrs/radicacion"
                    className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-foreground px-6 py-3 font-semibold text-primary shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transform-none"
                  >
                    Presentar una PQRS
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </RevealGroup>
      </section>
    </>
  );
}
