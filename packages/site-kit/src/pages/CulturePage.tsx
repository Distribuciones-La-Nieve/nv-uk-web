import Image from "next/image";
import type { SiteConfig } from "../config/types";
import { CulturePhotoHero } from "../components/CulturePhotoHero";
import { CultureTopics } from "../components/CultureTopics";
import { RevealGroup } from "../components/RevealGroup";

/**
 * Editorial route prepared for commercial tips and educational resources.
 */
export function CulturePage({ site }: { site: SiteConfig }) {
  const character = site.id === "la-nieve" ? "Don Tulio" : "Doña Ceci";
  const hasFeaturedImage =
    site.culture.imagePresentation === "featured-before-intro";

  return (
    <>
      <CulturePhotoHero
        images={site.culture.heroImages}
        siteName={site.name}
        copy={site.culture}
      />

      {hasFeaturedImage && (
        <section
          aria-label={`Collage de ${site.name}`}
          className="bg-muted/25 px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
        >
          <RevealGroup className="mx-auto max-w-[100rem]">
            <figure className="overflow-hidden rounded-3xl shadow-card">
              <Image
                src={site.culture.image.src}
                alt={site.culture.image.alt}
                width={site.culture.image.width}
                height={site.culture.image.height}
                sizes="(min-width: 1600px) 1536px, calc(100vw - 1.5rem)"
                className="h-auto w-full object-contain"
                priority
              />
            </figure>
          </RevealGroup>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <RevealGroup className="mx-auto max-w-3xl text-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Contenido para crecer
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Herramientas prácticas para cada negocio
            </h2>
          </div>
        </RevealGroup>
      </section>

      <section className="border-y border-border bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Consejos de {character}
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Un buen consejo hace crecer tu negocio
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Pasa el cursor sobre una tarjeta y deja que {character} te
              acompañe con una idea para poner en práctica.
            </p>
          </div>
          <CultureTopics site={site.id} />
        </div>
      </section>
    </>
  );
}
