import type { StaticImageData } from "next/image";

/**
 * Primitive icon identifiers supported by the shared corporate components.
 * Keeping identifiers as strings makes every site configuration serializable.
 */
export type SiteIconName =
  | "building"
  | "briefcase"
  | "check"
  | "file-text"
  | "glass-water"
  | "handshake"
  | "heart"
  | "lightbulb"
  | "map-pin"
  | "megaphone"
  | "package-check"
  | "scale"
  | "shield"
  | "sparkles"
  | "store"
  | "target"
  | "trending-up"
  | "truck"
  | "users"
  | "wine";

export type SitePageKey =
  | "home"
  | "about"
  | "allies"
  | "culture"
  | "contact"
  | "suppliers"
  | "careers"
  | "legal"
  | "ethics"
  | "dataPolicy"
  | "pqrs";

export interface SiteNavigationItem {
  readonly label: string;
  readonly href: string;
  readonly page: SitePageKey;
  readonly children?: readonly SiteNavigationItem[];
}

export interface SiteMetadataConfig {
  readonly title: string;
  readonly titleTemplate: string;
  readonly description: string;
  readonly category: string;
  readonly keywords: readonly string[];
}

export interface SiteImageConfig {
  readonly src: string | StaticImageData;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly treatment?: "photo" | "character" | "illustration";
  readonly objectPosition?: string;
}

export interface SiteLogoConfig {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly display: "cropped-square" | "wide";
}

export interface SiteFeature {
  readonly title: string;
  readonly description: string;
  readonly icon: SiteIconName;
}

export interface SiteCultureTopic extends SiteFeature {
  readonly image: SiteImageConfig;
}

export interface SiteCultureHeroImage extends SiteImageConfig {
  /** Permite conservar la foto completa cuando el sujeto no debe recortarse. */
  readonly fit?: "contain" | "cover";
  /** Acercamiento sutil para ajustar el encuadre dentro del panel inclinado. */
  readonly visualScale?: number;
  /** Desplaza la foto completa sin alterar el punto focal del recorte. */
  readonly verticalOffset?: string;
  readonly transformOrigin?: string;
}

export interface SitePageCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}

export interface SiteStatFigure {
  /** Texto previo discreto, p. ej. "Más de". */
  readonly prefix?: string;
  /** Cifra literal tal como fue suministrada, p. ej. "159,000" o "580-700". */
  readonly value: string;
  /** Unidad destacada junto a la cifra, p. ej. "m²", "departamentos". */
  readonly unit?: string;
  /** Descripción corta que completa la lectura de la cifra. */
  readonly label: string;
}

export interface SiteStatGroup {
  readonly title: string;
  readonly figures: readonly SiteStatFigure[];
  /** Líneas secundarias sin cifra propia. */
  readonly notes?: readonly string[];
}

export interface SiteAlly {
  readonly name: string;
  readonly image?: SiteImageConfig;
  /** Preferred visual width in CSS pixels inside shared logo displays. */
  readonly displayWidth?: number;
  /**
   * Uniform visual scale (default 1) applied to the rendered logo to
   * compensate for files with large internal transparent margins, without
   * editing the source image. Only logos that look small relative to their
   * peers should set this; most logos omit it. Keep values moderate
   * (≈1.1–1.4) — this scales the artwork in place, centered, not the shared
   * layout box, so excessive values risk visual overlap with neighbors.
   */
  readonly visualScale?: number;
}

export interface SiteCommercialAlly extends SiteAlly {
  /** Casa comercial o grupo propietario que reúne esta marca en el catálogo. */
  readonly commercialHouse: string;
}

export interface SiteBrandLogo extends SiteAlly {
  readonly image: SiteImageConfig;
}

export type SiteAdvertisingVariant =
  "featured" | "split" | "portrait" | "landscape" | "paired";

export type SiteAdvertisingOrientation = "media-left" | "media-right";
export type SiteAdvertisingProportion = 55 | 60 | 65 | 70;

export interface SiteAdvertisingImage extends SiteImageConfig {
  readonly fit: "contain" | "cover";
  readonly priority?: boolean;
}

export interface SiteAdvertisingCampaign {
  readonly id: string;
  readonly brand: string;
  readonly variant: SiteAdvertisingVariant;
  readonly orientation?: SiteAdvertisingOrientation;
  readonly mainProportion?: SiteAdvertisingProportion;
  readonly main: SiteAdvertisingImage;
  readonly secondary?: SiteAdvertisingImage;
  readonly logo?: SiteBrandLogo;
  readonly title?: string;
  readonly description?: string;
}

export interface SiteValue {
  readonly title: string;
  readonly description: string;
  readonly image: SiteImageConfig;
}

export interface SiteTimelineMilestone {
  readonly period: string;
  readonly isoDate?: string;
  readonly isCurrent?: boolean;
  readonly description: string;
}

export interface SiteSocialLinks {
  readonly linkedin: string | null;
  readonly instagram: string | null;
  readonly facebook: string | null;
}

export interface SiteTextSection {
  readonly title: string;
  readonly body: string;
}

export interface SiteDataPolicySection {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export interface SiteDataPolicyDocument {
  readonly owner: string;
  readonly sourceFile: string;
  readonly title: string;
  readonly sections: readonly SiteDataPolicySection[];
}

export type SiteDataPolicyDocumentId = "la-nieve" | "unimarka";

export interface SiteConfig {
  readonly id: "la-nieve" | "unimarka";
  readonly name: string;
  readonly legalName: string;
  readonly slogan: string;
  readonly logo: SiteLogoConfig;
  readonly chromeLogo: SiteLogoConfig;
  readonly favicon?: string;
  readonly themeColor: string;
  /** Absolute production origin (no trailing slash), sourced from an environment variable per app. Drives `metadataBase`, canonicals, sitemap and robots. */
  readonly siteUrl: string;
  /** Google Search Console verification token, if one has been issued for this property. Sourced from an environment variable; omitted entirely when unset. */
  readonly googleSiteVerification?: string;
  readonly metadata: SiteMetadataConfig;
  readonly navigation: readonly SiteNavigationItem[];
  readonly home: SitePageCopy & {
    readonly image: SiteImageConfig;
    readonly points: readonly SiteFeature[];
  };
  readonly stats: SitePageCopy & {
    /** Imagen estática de cobertura nacional; con null se muestra el espacio preparado para incorporarla después. */
    readonly image: SiteImageConfig | null;
    readonly groups: readonly SiteStatGroup[];
  };
  /** Legacy: alimentaba el mapa interactivo (CoverageMap), retirado del home en 2026-07. Se conserva solo como referencia. */
  readonly coverage: SitePageCopy & {
    readonly departments: readonly string[];
    readonly disclaimer: string;
    readonly isDemo: boolean;
  };
  readonly channels: SitePageCopy & {
    readonly items: readonly SiteFeature[];
  };
  readonly innovation: SitePageCopy & {
    readonly image: SiteImageConfig;
    readonly imageCaption: string;
    readonly items: readonly SiteFeature[];
  };
  readonly about: SitePageCopy & {
    readonly image: SiteImageConfig;
    readonly timeline: readonly SiteTimelineMilestone[];
    readonly mission: string;
    readonly vision: string;
    readonly values: readonly SiteValue[];
  };
  readonly allies: SitePageCopy & {
    readonly items: readonly SiteCommercialAlly[];
    readonly logos: readonly SiteBrandLogo[];
    readonly advertisements: readonly SiteAdvertisingCampaign[];
  };
  readonly culture: SitePageCopy & {
    readonly image: SiteImageConfig;
    readonly imagePresentation?: "inline" | "featured-before-intro";
    readonly heroImages: readonly [
      SiteCultureHeroImage,
      SiteCultureHeroImage,
      SiteCultureHeroImage,
    ];
    readonly topics: readonly SiteCultureTopic[];
  };
  readonly contact: SitePageCopy & {
    readonly email?: string;
    readonly phone?: string;
    readonly pendingMessage: string;
  };
  readonly suppliers: SitePageCopy;
  readonly careers: SitePageCopy & {
    readonly image: SiteImageConfig;
  };
  readonly legal: SitePageCopy;
  /** Publicly visible draft content; it must remain clearly marked as provisional and unapproved. */
  readonly ethics: SitePageCopy;
  readonly dataPolicy: SitePageCopy & {
    readonly applicability: string;
    readonly documentId: SiteDataPolicyDocumentId | null;
  };
  readonly pqrs: SitePageCopy & {
    readonly categories: readonly SiteFeature[];
    /** Controls the formal filing route (`/legal/pqrs/radicacion`) linked from this page. */
    readonly filing: {
      /** Whether the "Radicar una solicitud" button and route are offered at all. */
      readonly enabled: boolean;
      /** Whether a real submission backend exists; false keeps the final submit disabled. */
      readonly backendAvailable: boolean;
    };
  };
  readonly footerDescription: string;
  readonly socialLinks: SiteSocialLinks;
  /** Networks this brand actually uses; controls which footer icons render at all. */
  readonly socialNetworks: readonly (keyof SiteSocialLinks)[];
  /** Verified footer contact details sourced from redesciales.txt, independent from `contact`. */
  readonly footerContact: {
    readonly email: string | null;
    readonly location: string | null;
  };
  /** Discreet development-team credit shown at the opposite end of the footer's copyright line. */
  readonly developmentTeam: string;
}
