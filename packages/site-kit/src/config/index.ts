export {
  createNoIndexPageMetadata,
  createPageMetadata,
  createSiteMetadata,
  getPageHref,
  getSiteRoutes,
} from "./metadata";
export {
  createRobotsConfig,
  createSitemapEntries,
  normalizeSiteOrigin,
} from "./seo";
export {
  buildBreadcrumbJsonLd,
  buildLegalBreadcrumbJsonLd,
  buildOrganizationAndWebsiteJsonLd,
} from "./structuredData";
export { CUSTOMER_CHANNEL_IMAGES } from "./channelAssets";
export { createCorporateNavigation } from "./navigation";
export {
  CORPORATE_MISSION,
  CORPORATE_VALUES,
  CORPORATE_VISION,
} from "./corporateContent";
export {
  LA_NIEVE_DATA_POLICY_DOCUMENT,
  LA_NIEVE_DATA_POLICY_SOURCE,
  UNIMARKA_DATA_POLICY_DOCUMENT,
  UNIMARKA_DATA_POLICY_SOURCE,
} from "./dataPolicyContent";
export { sharedHeroImage } from "./sharedAssets";
export {
  CORPORATE_STATS_GROUPS,
  createCorporateStatsGroups,
} from "./statsContent";
export {
  PQRS_ATTACHMENT_RULES,
  PQRS_DOCUMENT_TYPES,
  PQRS_RESPONSE_TERMS_NOTE,
} from "./pqrsFilingContent";
export { CORPORATE_TECHNOLOGY } from "./technologyContent";
export { LA_NIEVE_TIMELINE, UNIMARKA_TIMELINE } from "./timelineContent";
export type {
  SiteConfig,
  SiteDataPolicyDocument,
  SiteDataPolicyDocumentId,
  SiteDataPolicySection,
  SiteAlly,
  SiteCommercialAlly,
  SiteAdvertisingCampaign,
  SiteAdvertisingImage,
  SiteAdvertisingOrientation,
  SiteAdvertisingProportion,
  SiteAdvertisingVariant,
  SiteBrandLogo,
  SiteFeature,
  SiteIconName,
  SiteImageConfig,
  SiteLogoConfig,
  SiteMetadataConfig,
  SiteNavigationItem,
  SitePageCopy,
  SitePageKey,
  SiteStatFigure,
  SiteStatGroup,
  SiteSocialLinks,
  SiteTextSection,
  SiteTimelineMilestone,
  SiteValue,
} from "./types";
