import { ImageIcon } from "lucide-react";
import type { SiteCommercialAlly, SiteConfig } from "../config/types";
import { AdvertisingShowcase } from "../components/AdvertisingShowcase";
import { AllyLogo } from "../components/AllyLogo";
import { AlliesLogoGrid } from "../components/AlliesLogoGrid";
import { PageIntro } from "../components/PageIntro";
import { RevealGroup } from "../components/RevealGroup";

/** Builds a compact, readable placeholder mark from an ally name. */
function getAllyInitials(ally: SiteCommercialAlly) {
  return ally.name
    .split(/[\s–—-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function groupAlliesByCommercialHouse(items: readonly SiteCommercialAlly[]) {
  const groups = new Map<string, SiteCommercialAlly[]>();

  for (const ally of items) {
    const house = ally.commercialHouse;
    const group = groups.get(house);

    if (group) {
      group.push(ally);
    } else {
      groups.set(house, [ally]);
    }
  }

  return Array.from(groups, ([name, groupItems]) => ({
    name,
    items: groupItems,
  }));
}

/**
 * Commercial allies route with future-proof image slots for approved logos.
 */
export function AlliesPage({ site }: { site: SiteConfig }) {
  const hasAdvertising = site.allies.advertisements.length > 0;
  const logoGridClassName = "flex flex-wrap justify-center";
  const logoStageClassName =
    "flex h-28 w-full items-center justify-center overflow-hidden dark:rounded-2xl dark:bg-white/90 dark:px-4 dark:py-3";
  const allyGroups = groupAlliesByCommercialHouse(site.allies.items);
  const alliesInCommercialHouseOrder = allyGroups.flatMap(
    (house) => house.items
  );
  const renderAllyCard = (ally: SiteCommercialAlly) => (
    <article
      key={ally.name}
      data-ally-card="true"
      className="group flex min-h-56 min-w-0 w-full flex-col items-center justify-center border-b border-border px-2 py-8 text-center sm:w-1/2 sm:px-4 lg:w-1/3 xl:w-1/4"
    >
      {ally.image ? (
        <div className={logoStageClassName} data-ally-logo-stage="true">
          <AllyLogo
            name={ally.name}
            image={ally.image}
            className="h-20 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
            displayWidth={ally.displayWidth}
            visualScale={ally.visualScale}
            sizes={`${ally.displayWidth ?? 160}px`}
          />
        </div>
      ) : (
        <div
          className="relative flex h-24 w-full max-w-48 items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/5"
          aria-label={`Espacio reservado para el logotipo de ${ally.name}`}
        >
          <span className="text-2xl font-black tracking-tight text-primary transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none">
            {getAllyInitials(ally)}
          </span>
          <ImageIcon
            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/60"
            aria-hidden="true"
          />
        </div>
      )}
      <h3 className="mt-3 text-sm font-bold leading-snug text-foreground sm:text-base">
        {ally.name}
      </h3>
      {!ally.image && (
        <p className="mt-1 text-xs text-muted-foreground">Logotipo pendiente</p>
      )}
    </article>
  );

  return (
    <>
      {hasAdvertising ? (
        <>
          <header
            id="marcas-aliadas"
            className="scroll-mt-24 bg-background px-4 pb-8 pt-32 sm:px-6 sm:pb-10 sm:pt-36 lg:px-8"
          >
            <RevealGroup className="mx-auto max-w-7xl">
              <h1 className="max-w-4xl text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {site.allies.title}
              </h1>
            </RevealGroup>
          </header>
          <AdvertisingShowcase campaigns={site.allies.advertisements} />
        </>
      ) : (
        <PageIntro copy={site.allies} />
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <RevealGroup className="mx-auto mb-10 max-w-4xl text-center sm:mb-12">
          <p className="text-balance text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
            Hoy hacen parte de nuestra historia y las representamos con orgullo
            en cada rincón a los que llegamos.
          </p>
        </RevealGroup>
        <div data-commercial-houses="true">
          <AlliesLogoGrid className={logoGridClassName}>
            {alliesInCommercialHouseOrder.map(renderAllyCard)}
          </AlliesLogoGrid>
        </div>
      </section>
    </>
  );
}
