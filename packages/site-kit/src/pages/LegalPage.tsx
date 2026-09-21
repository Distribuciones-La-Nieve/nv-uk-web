import Link from "next/link";
import { ArrowRight, FileText, MessageSquareText } from "lucide-react";
import type { SiteConfig } from "../config/types";
import { PageIntro } from "../components/PageIntro";
import { RevealGroup } from "../components/RevealGroup";

/**
 * Legal hub linking to the separate data-treatment and PQRS routes.
 */
export function LegalPage({ site }: { site: SiteConfig }) {
  const destinations = [
    {
      href: "/legal/tratamiento-de-datos",
      title: site.dataPolicy.title,
      description: site.dataPolicy.description,
      icon: FileText,
    },
    {
      href: "/legal/pqrs",
      title: site.pqrs.title,
      description: site.pqrs.description,
      icon: MessageSquareText,
    },
  ];

  return (
    <>
      <PageIntro copy={site.legal} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <RevealGroup className="grid gap-6 md:grid-cols-2" stagger={0.1}>
          {destinations.map((destination) => (
            <Link
              key={destination.href}
              href={destination.href}
              className="group rounded-3xl border border-border bg-card p-8 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-card"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <destination.icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-2xl font-bold tracking-tight">
                {destination.title}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {destination.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Consultar página
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
