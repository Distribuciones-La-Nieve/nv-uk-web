"use client";

import Image from "next/image";
import type { SiteConfig } from "../config/types";
import { useRevealAnimation } from "../hooks/useRevealAnimation";
import { SiteIcon } from "./SiteIcon";
import { WarehouseMap } from "./WarehouseMap";

export function Stats({ site }: { site: SiteConfig }) {
  const figureRef = useRevealAnimation<HTMLDivElement>({ type: "fadeLeft" });
  const contentRef = useRevealAnimation<HTMLDivElement>({ type: "fadeUp" });

  const mapCharacter =
    site.id === "unimarka"
      ? {
          src: "/images/personajes-final-07.png",
          alt: "Personaje de Unimarka presentando el mapa de bodegas",
          width: 1081,
          height: 1081,
        }
      : {
          src: "/images/personajes-final-03.png",
          alt: "Personaje de Distribuciones La Nieve presentando el mapa de bodegas",
          width: 1080,
          height: 1080,
        };
  const coverage = site.stats.groups
    .flatMap((group) => group.figures)
    .find((figure) => figure.value.endsWith("%"));
  const departments = site.stats.groups
    .flatMap((group) => group.figures)
    .find((figure) => figure.unit === "departamentos");

  return (
    <section
      id="cobertura"
      aria-labelledby="home-stats-title"
      className="scroll-mt-24 border-y border-border bg-surface py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-brand-primary/10 bg-white shadow-card sm:rounded-[2.5rem]">
          <div
            className="pointer-events-none absolute -right-48 -top-64 h-[58rem] w-[58rem] rounded-full border-[7rem] border-brand-secondary/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-72 right-10 h-[44rem] w-[44rem] rounded-full border-[6rem] border-brand-primary/5"
            aria-hidden="true"
          />

          <div className="relative grid gap-8 px-6 pb-12 pt-10 sm:px-10 sm:pt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6 lg:px-14 lg:pb-12 lg:pt-16">
            <div ref={contentRef} className="relative z-10 min-w-0 lg:pt-6">
              <h2
                id="home-stats-title"
                className="max-w-lg text-4xl font-extrabold leading-[1.08] tracking-tight text-brand-ink sm:text-5xl lg:text-[3.35rem]"
              >
                {site.stats.title}
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-brand-ink/70 sm:text-lg">
                Una presencia que conecta regiones y nos acerca a nuestros
                clientes.
              </p>

              <dl className="mt-9 grid grid-cols-2 gap-3 sm:gap-4">
                {departments && (
                  <div className="flex min-w-0 flex-col rounded-[1.5rem] border border-brand-primary/5 bg-[#f1f7ff] p-4 sm:p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
                      <SiteIcon name="map-pin" className="h-6 w-6" />
                    </span>
                    <dt className="order-2 mt-2 text-sm leading-snug text-brand-ink/75 sm:text-base">
                      Departamentos de Colombia con presencia
                    </dt>
                    <dd className="order-1 mt-5 text-4xl font-extrabold leading-none tracking-tight text-brand-ink tabular-nums sm:text-[2.75rem]">
                      {departments.value}
                    </dd>
                  </div>
                )}
                {coverage && (
                  <div className="flex min-w-0 flex-col rounded-[1.5rem] border border-brand-primary/5 bg-[#f1f7ff] p-4 sm:p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/25 text-brand-primary">
                      <SiteIcon name="trending-up" className="h-6 w-6" />
                    </span>
                    <dt className="order-2 mt-2 text-sm leading-snug text-brand-ink/75 sm:text-base">
                      De los departamentos de Colombia
                    </dt>
                    <dd className="order-1 mt-5 text-3xl font-extrabold leading-none tracking-tight text-brand-ink tabular-nums sm:text-[2.75rem]">
                      {coverage.value.replace(".", ",")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div ref={figureRef} className="relative min-w-0">
              <div className="relative mx-auto max-w-[610px]">
                <div className="relative z-10 ml-auto w-full max-w-[420px]">
                  <WarehouseMap site={site.id} />
                </div>
                <div className="pointer-events-none absolute bottom-0 left-0 z-20 w-[42%] max-w-[245px] sm:bottom-5 sm:w-[45%] lg:-left-5 lg:bottom-10 lg:w-[48%]">
                  <Image
                    src={mapCharacter.src}
                    alt={mapCharacter.alt}
                    width={mapCharacter.width}
                    height={mapCharacter.height}
                    sizes="(min-width: 1024px) 245px, (min-width: 640px) 220px, 160px"
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative h-3 bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-ink"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
