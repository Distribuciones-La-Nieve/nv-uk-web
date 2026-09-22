import type { SiteNavigationItem } from "./types";

/**
 * Builds the mirrored route structure with brand-specific labels.
 */
export function createCorporateNavigation(
  brandLabel: "Nieve" | "Unimarka"
): readonly SiteNavigationItem[] {
  return [
    { label: "Inicio", href: "/", page: "home" },
    { label: `Somos ${brandLabel}`, href: "/somos", page: "about" },
    {
      label: "Aliados comerciales",
      href: "/aliados-comerciales",
      page: "allies",
    },
    { label: `Cultura ${brandLabel}`, href: "/cultura", page: "culture" },
    { label: "Proveedores", href: "/proveedores", page: "suppliers" },
    {
      label: "Trabaja con nosotros",
      href: "/trabaja-con-nosotros",
      page: "careers",
    },
    {
      label: "Legal",
      href: "/legal",
      page: "legal",
      children: [
        {
          label: "Tratamiento de datos",
          href: "/legal/tratamiento-de-datos",
          page: "dataPolicy",
        },
        { label: "PQRS", href: "/legal/pqrs", page: "pqrs" },
      ],
    },
  ];
}
