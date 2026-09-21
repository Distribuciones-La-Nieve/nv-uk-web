import type { Metadata } from "next";
import type {
  SiteConfig,
  SiteImageConfig,
  SiteNavigationItem,
  SitePageKey,
} from "./types";

const PAGE_COPY_KEYS = {
  home: "home",
  about: "about",
  allies: "allies",
  culture: "culture",
  suppliers: "suppliers",
  careers: "careers",
  legal: "legal",
  ethics: "ethics",
  dataPolicy: "dataPolicy",
  pqrs: "pqrs",
} as const satisfies Record<SitePageKey, keyof SiteConfig>;

/**
 * Next.js replaces the parent's whole `openGraph`/`twitter` objects when a
 * route segment declares its own, rather than merging field by field. Every
 * page-level `openGraph` below must therefore repeat `siteName`/`locale`
 * itself, or those fields silently disappear from every indexable page
 * except the ones with no page-specific metadata at all.
 */
const OG_LOCALE = "es_CO";

/**
 * Flattens the real navigation tree (one level of `children`, exactly as
 * rendered by `Navigation`/`Footer`) into a single list. This is the sole
 * source of truth for page URLs: sitemap, canonicals and breadcrumbs all
 * derive from it instead of a second, hand-maintained path list.
 */
export function getSiteRoutes(site: SiteConfig): readonly SiteNavigationItem[] {
  return site.navigation.flatMap((item) => [item, ...(item.children ?? [])]);
}

/** Resolves the real `href` for a page key from the navigation tree. */
export function getPageHref(site: SiteConfig, page: SitePageKey): string {
  return getSiteRoutes(site).find((item) => item.page === page)?.href ?? "/";
}

/** Resolves public paths and Next.js static imports to a URL that `metadataBase` can make absolute. */
function resolveImageUrl(image: SiteImageConfig): string {
  return typeof image.src === "string" ? image.src : image.src.src;
}

function toOgImage(image: SiteImageConfig) {
  const url = resolveImageUrl(image);
  return [{ url, width: image.width, height: image.height, alt: image.alt }];
}

/**
 * Builds root metadata from one app-owned brand configuration.
 */
export function createSiteMetadata(site: SiteConfig): Metadata {
  const defaultImage = toOgImage(site.about.image);

  return {
    metadataBase: new URL(site.siteUrl),
    applicationName: site.name,
    title: {
      default: site.metadata.title,
      template: site.metadata.titleTemplate,
    },
    description: site.metadata.description,
    category: site.metadata.category,
    keywords: [...site.metadata.keywords],
    authors: [{ name: site.legalName }],
    creator: site.legalName,
    publisher: site.legalName,
    icons: site.favicon
      ? {
          icon: site.favicon,
          shortcut: site.favicon,
          apple: site.favicon,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: OG_LOCALE,
      url: "/",
      siteName: site.name,
      title: site.metadata.title,
      description: site.metadata.description,
      images: defaultImage,
    },
    twitter: {
      card: "summary_large_image",
      title: site.metadata.title,
      description: site.metadata.description,
      images: defaultImage.map((image) => image.url),
    },
    verification: site.googleSiteVerification
      ? { google: site.googleSiteVerification }
      : undefined,
  };
}

/**
 * Builds route metadata without introducing claims beyond each page's copy.
 * Every indexable page gets a canonical URL derived from the real navigation
 * tree and a social image — the page's own when its copy defines one,
 * otherwise the site's default (`about.image`). Public paths and Next.js
 * static imports are both supported.
 */
export function createPageMetadata(
  site: SiteConfig,
  page: SitePageKey
): Metadata {
  const copy = site[PAGE_COPY_KEYS[page]] as SitePageCopyLike;
  const href = getPageHref(site, page);
  const pageImage =
    "image" in copy && copy.image ? copy.image : site.about.image;

  return createRouteMetadata(site, {
    title: copy.title,
    description: copy.description,
    href,
    image: pageImage,
  });
}

/** Builds complete metadata for a public route that must remain out of search results. */
export function createNoIndexPageMetadata(
  site: SiteConfig,
  page: RouteMetadataInput
): Metadata {
  return createRouteMetadata(site, page, false);
}

function createRouteMetadata(
  site: SiteConfig,
  page: RouteMetadataInput,
  index = true
): Metadata {
  const title = `${page.title} | ${site.name}`;
  const images = toOgImage(page.image ?? site.about.image);

  return {
    // `absolute` is required for the root page: a root layout's title template
    // does not apply to a page in the same route segment in Next.js 16.
    title: { absolute: title },
    description: page.description,
    alternates: {
      canonical: page.href,
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE,
      url: page.href,
      siteName: site.name,
      title,
      description: page.description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: images.map((image) => image.url),
    },
    ...(index
      ? {}
      : {
          robots: {
            index: false,
            follow: false,
          },
        }),
  };
}

interface SitePageCopyLike {
  readonly title: string;
  readonly description: string;
  readonly image?: SiteImageConfig;
}

interface RouteMetadataInput {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly image?: SiteImageConfig;
}
