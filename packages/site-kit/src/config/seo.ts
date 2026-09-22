import type { MetadataRoute } from "next";
import { getSiteRoutes } from "./metadata";
import type { SiteConfig, SitePageKey } from "./types";

/** Validates and normalizes a configured site URL to a plain HTTP(S) origin. */
export function normalizeSiteOrigin(value: string): string {
  const url = new URL(value);

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) origin without a path, query string or hash."
    );
  }

  return url.origin;
}

/**
 * Reasonable, non-abusive defaults per page type. The legal hub and its two
 * children change the least; the home page is the most likely to change.
 * Everything else falls back to a moderate, generic value.
 */
const PRIORITY_BY_PAGE: Partial<Record<SitePageKey, number>> = {
  home: 1,
  legal: 0.3,
  dataPolicy: 0.3,
  pqrs: 0.3,
};

const FREQUENCY_BY_PAGE: Partial<
  Record<SitePageKey, MetadataRoute.Sitemap[number]["changeFrequency"]>
> = {
  home: "weekly",
  legal: "yearly",
  dataPolicy: "yearly",
  pqrs: "yearly",
};

/**
 * Builds the sitemap directly from the real navigation tree, so it can never
 * list a route that doesn't actually exist in the site's own menu, nor drift
 * out of sync with it. Redirect-only legacy routes, the intentionally
 * unlinked, `noindex`d PQRS filing route and the hidden provisional ethics
 * page are excluded by construction.
 *
 * `lastModified` is intentionally omitted: this project has no reliable
 * per-page last-modified source (no CMS, no content timestamps), and
 * stamping every URL with the build date would misrepresent the whole site
 * as changing on every deploy.
 */
export function createSitemapEntries(site: SiteConfig): MetadataRoute.Sitemap {
  return getSiteRoutes(site)
    .filter((item) => item.page !== "ethics")
    .map((item) => ({
      url: new URL(item.href, site.siteUrl).toString(),
      changeFrequency: FREQUENCY_BY_PAGE[item.page] ?? "monthly",
      priority: PRIORITY_BY_PAGE[item.page] ?? 0.7,
    }));
}

/**
 * Allows crawling of the entire public site. The one route that must stay
 * out of search results (`/legal/pqrs/radicacion`) already carries its own
 * `noindex` meta tag (see that page's metadata) rather than a robots.txt
 * disallow: blocking it from crawling would prevent Google from ever seeing
 * that `noindex` tag, which is the documented, correct way to keep a
 * still-reachable URL out of the index.
 */
export function createRobotsConfig(site: SiteConfig): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", site.siteUrl).toString(),
  };
}
