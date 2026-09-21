export {
  createNoIndexPageMetadata,
  createPageMetadata,
  createSiteMetadata,
  getPageHref,
  getSiteRoutes,
} from "./config/metadata";
export {
  createRobotsConfig,
  createSitemapEntries,
  normalizeSiteOrigin,
} from "./config/seo";
export {
  buildBreadcrumbJsonLd,
  buildLegalBreadcrumbJsonLd,
  buildOrganizationAndWebsiteJsonLd,
} from "./config/structuredData";
export { createCorporateNavigation } from "./config/navigation";
export {
  CORPORATE_MISSION,
  CORPORATE_VALUES,
  CORPORATE_VISION,
} from "./config/corporateContent";
export {
  LA_NIEVE_DATA_POLICY_DOCUMENT,
  LA_NIEVE_DATA_POLICY_SOURCE,
  UNIMARKA_DATA_POLICY_DOCUMENT,
  UNIMARKA_DATA_POLICY_SOURCE,
} from "./config/dataPolicyContent";
export { sharedHeroImage } from "./config/sharedAssets";
export { CORPORATE_STATS_GROUPS } from "./config/statsContent";
export {
  PQRS_ATTACHMENT_RULES,
  PQRS_DOCUMENT_TYPES,
  PQRS_RESPONSE_TERMS_NOTE,
} from "./config/pqrsFilingContent";
export { CORPORATE_TECHNOLOGY } from "./config/technologyContent";
export { LA_NIEVE_TIMELINE, UNIMARKA_TIMELINE } from "./config/timelineContent";
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
} from "./config/types";

export { CompanyTimeline } from "./components/CompanyTimeline";
export { JsonLd } from "./components/JsonLd";
export { SiteChrome } from "./components/SiteChrome";
export { HomePage } from "./pages/HomePage";
export { AboutPage } from "./pages/AboutPage";
export { AlliesPage } from "./pages/AlliesPage";
export { CulturePage } from "./pages/CulturePage";
export { ContactPage } from "./pages/ContactPage";
export { SuppliersPage } from "./pages/SuppliersPage";
export { CareersPage } from "./pages/CareersPage";
export { LegalPage } from "./pages/LegalPage";
export { EthicsCodePage } from "./pages/EthicsCodePage";
export { DataPolicyPage } from "./pages/DataPolicyPage";
export { PqrsPage } from "./pages/PqrsPage";
export { PqrsFilingPage } from "./pages/PqrsFilingPage";
