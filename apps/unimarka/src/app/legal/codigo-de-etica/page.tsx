import {
  EthicsCodePage,
  JsonLd,
  buildLegalBreadcrumbJsonLd,
  createNoIndexPageMetadata,
} from "@corporativo/site-kit";
import { siteConfig } from "@/site.config";

/**
 * This route remains directly reachable but hidden from navigation and search
 * while its content remains fictional and unapproved.
 */
export const metadata = createNoIndexPageMetadata(siteConfig, {
  title: siteConfig.ethics.title,
  description: siteConfig.ethics.description,
  href: "/legal/codigo-de-etica",
});

export default function Page() {
  return (
    <>
      <JsonLd data={buildLegalBreadcrumbJsonLd(siteConfig, "ethics")} />
      <EthicsCodePage site={siteConfig} />
    </>
  );
}
