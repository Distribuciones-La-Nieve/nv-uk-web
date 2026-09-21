"use client";

import Image from "next/image";
import type { SiteConfig } from "../config/types";
import { useRevealAnimation } from "../hooks/useRevealAnimation";
import { WarehouseMap } from "./WarehouseMap";

export function Stats({ site }: { site: SiteConfig }) {
  const figureRef = useRevealAnimation<HTMLDivElement>({ type: "fadeLeft" });
  const contentRef = useRevealAnimation<HTMLDivElement>({ type: "fadeUp" });

  const isUnimarka = site.id === "unimarka";
  const mapCharacter = isUnimarka
    ? {
        src: "/images/personajes-final-07.png",
        alt: "Personaje de Unimarka señalando el mapa de bodegas",
        width: 1081,
        height: 1081,
      }
    : {
        src: "/images/personajes-final-03.png",
        alt: "Personaje de Distribuciones La Nieve señalando el mapa de bodegas",
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
      className="scroll-mt-24 border-y border-border bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-brand-primary bg-gradient-to-br from-brand-primary to-[color-mix(in_srgb,var(--brand-primary)_78%,black)] px-6 py-8 text-white shadow-card sm:px-10 sm:py-10 lg:px-14">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div ref={contentRef} className="min-w-0 max-w-lg">
              <h2
                id="home-stats-title"
                className={
                  isUnimarka
                    ? "text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl"
                    : "mt-3 text-[1.75rem] font-bold leading-tight tracking-tight text-white sm:text-[2rem]"
                }
              >
                {site.stats.title}
              </h2>
              <dl
                className={
                  isUnimarka
                    ? "mt-8 grid gap-6 border-t border-white/20 pt-8 sm:gap-8"
                    : "mt-8 grid grid-cols-2 gap-x-5 border-t border-white/20 pt-7 sm:mt-10 sm:gap-x-8 sm:pt-8"
                }
              >
                {departments && (
                  <div
                    className={
                      isUnimarka
                        ? "grid min-w-0 grid-cols-[8.5rem_1fr] items-center gap-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                        : "flex min-w-0 flex-col"
                    }
                  >
                    <dt
                      className={
                        isUnimarka
                          ? "order-2 max-w-[12rem] text-sm leading-relaxed text-white/80 sm:text-base"
                          : "order-2 mt-3 max-w-[10rem] text-sm leading-relaxed text-white/75"
                      }
                    >
                      Departamentos de Colombia con presencia
                    </dt>
                    <dd className="order-1 whitespace-nowrap text-[2.25rem] font-bold leading-none tracking-tight text-white tabular-nums sm:text-[3rem]">
                      {departments.value}
                    </dd>
                  </div>
                )}
                {coverage && (
                  <div
                    className={
                      isUnimarka
                        ? "grid min-w-0 grid-cols-[8.5rem_1fr] items-center gap-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                        : "flex min-w-0 flex-col"
                    }
                  >
                    <dt
                      className={
                        isUnimarka
                          ? "order-2 max-w-[12rem] text-sm leading-relaxed text-white/80 sm:text-base"
                          : "order-2 mt-3 max-w-[10rem] text-sm leading-relaxed text-white/75"
                      }
                    >
                      De los departamentos de Colombia
                    </dt>
                    <dd className="order-1 whitespace-nowrap text-[2.25rem] font-bold leading-none tracking-tight text-white tabular-nums sm:text-[3rem]">
                      {coverage.value.replace(".", ",")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <div ref={figureRef} className="relative min-w-0">
              <div className="relative z-10 mx-auto mb-[-1rem] flex w-full max-w-[12rem] justify-center lg:absolute lg:left-0 lg:top-20 lg:mb-0 lg:w-44 lg:max-w-none lg:justify-start">
                <Image
                  src={mapCharacter.src}
                  alt={mapCharacter.alt}
                  width={mapCharacter.width}
                  height={mapCharacter.height}
                  sizes="(min-width: 1024px) 176px, 192px"
                  className="h-auto w-48 object-contain lg:w-44"
                />
              </div>
              <div className="lg:pl-28">
                <WarehouseMap site={site.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
