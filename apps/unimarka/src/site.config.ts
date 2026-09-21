import {
  CORPORATE_MISSION,
  createCorporateStatsGroups,
  CORPORATE_TECHNOLOGY,
  CORPORATE_VALUES,
  CORPORATE_VISION,
  UNIMARKA_TIMELINE,
  createCorporateNavigation,
  normalizeSiteOrigin,
  type SiteAdvertisingCampaign,
  type SiteBrandLogo,
  type SiteConfig,
} from "@corporativo/site-kit/config";

function brandLogo(
  name: string,
  src: string,
  width: number,
  height: number,
  displayWidth = 160,
  // Compensates files with large internal transparent margins (see docs/progress.md);
  // most logos omit this and rely on the default scale of 1.
  visualScale?: number
) {
  return {
    name,
    displayWidth,
    ...(visualScale ? { visualScale } : {}),
    image: {
      src,
      alt: `Logotipo de ${name}`,
      width,
      height,
      treatment: "illustration" as const,
    },
  };
}

function commercialAllyLogo(
  commercialHouse: string,
  name: string,
  src: string,
  width: number,
  height: number,
  displayWidth = 160,
  visualScale?: number
) {
  return {
    ...brandLogo(name, src, width, height, displayWidth, visualScale),
    commercialHouse,
  };
}

const unimarkaBrandLogos = [
  brandLogo("Unilever", "/brands/unilever.png", 1280, 720, 142),
  brandLogo("Brinsa", "/brands/brinsa.png", 2125, 791, 184),
  brandLogo("Grupo Familia", "/brands/grupo-familia.png", 1280, 318, 188),
  brandLogo("Tork Institucional", "/brands/familia-tork.png", 3840, 2160, 156),
  brandLogo("Contegral", "/brands/contegral.png", 472, 321, 136),
  brandLogo("Quala", "/brands/quala.png", 400, 400, 100, 1.25),
  brandLogo("Reckitt", "/brands/reckitt.png", 3840, 2160, 150),
  brandLogo("Providencia", "/brands/providencia.png", 400, 300, 126, 1.4),
  brandLogo("Amerincandy", "/brands/americandy.png", 1024, 422, 180),
  brandLogo("La Soberana", "/brands/la-soberana.png", 250, 150, 144, 1.4),
  brandLogo("PQP", "/brands/pqp.png", 503, 187, 176),
  brandLogo(
    "Precocidos del Oriente",
    "/brands/precocidos-del-oriente.png",
    699,
    600,
    122
  ),
  brandLogo("Indulacteos", "/brands/indulacteos.png", 1254, 1254, 104),
] as const;

function advertisingCampaign(
  id: string,
  name: string,
  src: string,
  width: number,
  height: number,
  logo: SiteBrandLogo,
  priority = false
): SiteAdvertisingCampaign {
  return {
    id,
    brand: "unimarka",
    variant: "landscape",
    logo,
    main: {
      src,
      alt: `Pieza publicitaria de ${name}`,
      width,
      height,
      treatment: "photo",
      fit: "contain",
      priority,
    },
  };
}

const unimarkaAdvertisements = [
  advertisingCampaign(
    "unilever",
    "Unilever",
    "/images/advertising/unilever.png",
    1774,
    887,
    unimarkaBrandLogos[0],
    true
  ),
  advertisingCampaign(
    "brinsa",
    "Brinsa",
    "/images/advertising/brinsa.png",
    1774,
    887,
    unimarkaBrandLogos[1]
  ),
  advertisingCampaign(
    "grupo-familia",
    "Grupo Familia",
    "/images/advertising/grupo-familia.png",
    1717,
    916,
    unimarkaBrandLogos[2]
  ),
  advertisingCampaign(
    "tork-institucional",
    "Tork Institucional",
    "/images/advertising/tork-institucional.png",
    1774,
    887,
    unimarkaBrandLogos[3]
  ),
  advertisingCampaign(
    "contegral",
    "Contegral",
    "/images/advertising/contegral.png",
    1717,
    916,
    unimarkaBrandLogos[4]
  ),
  advertisingCampaign(
    "quala",
    "Quala",
    "/images/advertising/quala.png",
    1717,
    916,
    unimarkaBrandLogos[5]
  ),
  advertisingCampaign(
    "reckitt",
    "Reckitt",
    "/images/advertising/reckitt.png",
    1663,
    946,
    unimarkaBrandLogos[6]
  ),
] as const;

/**
 * Brand-owned content and identity for Unimarka.
 * Any illustrative content is explicitly identified as pending validation.
 */
export const siteConfig = {
  id: "unimarka",
  name: "Unimarka",
  legalName: "Unimarka",
  slogan: "Lo hacemos de corazón",
  logo: {
    src: "/brand/logo-horizontal.png",
    alt: "Logotipo de Unimarka",
    width: 543,
    height: 209,
    display: "wide",
  },
  chromeLogo: {
    src: "/brand/logo-white.png",
    alt: "Logotipo blanco de Unimarka",
    width: 543,
    height: 209,
    display: "wide",
  },
  favicon: "/brand/favicon.png",
  themeColor: "#BD202D",
  // Producción: definir NEXT_PUBLIC_SITE_URL en el entorno de despliegue (ver
  // docs/deployment.md). Sin esa variable, se usa el origen de desarrollo
  // local para que metadataBase, canonicals, sitemap y robots sigan siendo
  // URLs absolutas válidas sin afirmar un dominio de producción inexistente.
  siteUrl: normalizeSiteOrigin(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
  ),
  // Token de Google Search Console para esta propiedad, si ya fue emitido.
  // Sin NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION definido, el meta tag de
  // verificación simplemente no se genera (no se inventa ningún valor).
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  metadata: {
    title: "Unimarka",
    titleTemplate: "%s | Unimarka",
    description:
      "Sitio corporativo de Unimarka, distribuidora colombiana de productos de consumo masivo, productos institucionales, licores y vinos.",
    category: "Distribución de productos de consumo masivo",
    keywords: [
      "Unimarka",
      "distribución",
      "consumo masivo",
      "productos institucionales",
      "licores",
      "vinos",
      "Colombia",
    ],
  },
  navigation: createCorporateNavigation("Unimarka"),
  home: {
    eyebrow: "Calidad, servicio e innovación",
    title: "Conectamos productos, empresas y experiencias",
    description:
      "En Unimarka ofrecemos soluciones de comercialización y distribución para productos de consumo masivo, institucionales y licores",
    image: {
      src: "/images/cliente-unimarka.jpg",
      alt: "Cliente de Unimarka en su negocio",
      width: 2679,
      height: 1459,
      treatment: "photo",
      objectPosition: "50% 50%",
    },
    points: [
      {
        icon: "store",
        title: "Impulsamos tu tienda",
        description: "",
      },
      {
        icon: "handshake",
        title: "Aliados de las marcas",
        description: "",
      },
      {
        icon: "package-check",
        title: "Servicio de principio a fin",
        description: "",
      },
    ],
  },
  stats: {
    eyebrow: "Cobertura y operación",
    title: "Nuestra operación nacional",
    description:
      "Cobertura territorial, volumen de operaciones y equipo humano que respaldan nuestro servicio.",
    // Fuente: assets/mapaUK.png. El nombre público versionado evita servir una
    // versión anterior desde la caché del navegador o del optimizador.
    image: {
      src: "/images/mapa-cobertura-unimarka-20260730-v2.png",
      alt: "Mapa de cobertura nacional de Unimarka con los departamentos atendidos destacados",
      width: 2833,
      height: 4383,
      treatment: "illustration",
    },
    groups: createCorporateStatsGroups({
      departmentsCovered: 10,
      clients: "+13.000",
      municipalities: "182",
      employees: "208",
    }),
  },
  coverage: {
    eyebrow: "Mapa de cobertura — demostración",
    title: "Una operación que conecta territorios",
    description:
      "El mapa presenta una selección provisional de departamentos para mostrar la experiencia interactiva prevista.",
    departments: [
      "Antioquia",
      "Atlántico",
      "Bolívar",
      "Boyacá",
      "Caldas",
      "Cundinamarca",
      "Meta",
      "Quindío",
      "Risaralda",
      "Santander",
      "Tolima",
      "Valle del Cauca",
    ],
    disclaimer:
      "Cobertura demostrativa: estos departamentos no constituyen una declaración de operación real. La lista requiere confirmación oficial de Unimarka.",
    isDemo: true,
  },
  channels: {
    eyebrow: "Clientes por canal",
    title: "Soluciones para cada tipo de negocio",
    description:
      "La arquitectura organiza la información comercial en los seis canales definidos para el sitio.",
    items: [
      {
        icon: "store",
        title: "Tiendas",
        description:
          "Espacio para presentar el acompañamiento dirigido al comercio de cercanía.",
      },
      {
        icon: "building",
        title: "Minimercados y Supermercados",
        description:
          "Información para establecimientos con surtidos y dinámicas de compra diversas.",
      },
      {
        icon: "package-check",
        title: "Mayoristas",
        description:
          "Contenido comercial destinado a operaciones de compra y distribución mayorista.",
      },
      {
        icon: "briefcase",
        title: "Institucional",
        description:
          "Un canal preparado para comunicar soluciones orientadas a organizaciones.",
      },
      {
        icon: "wine",
        title: "Bares y Licoreras",
        description:
          "Sección destinada a las necesidades propias de estos establecimientos.",
      },
      {
        icon: "users",
        title: "Otros",
        description:
          "Un punto de entrada para perfiles comerciales que no pertenecen a los canales anteriores.",
      },
    ],
  },
  innovation: {
    ...CORPORATE_TECHNOLOGY,
    image: {
      src: "/images/innovacion-unimarka.png",
      alt: "Equipo trabajando en iniciativas de tecnología e innovación",
      width: 1536,
      height: 1024,
      treatment: "photo",
    },
  },
  about: {
    eyebrow: "Somos Unimarka",
    title: "Calidad, servicio y confianza en cada experiencia",
    description:
      "Conoce el propósito y los principios que orientan a Unimarka.",
    image: {
      src: "/images/somos-unimarka-20260730-v2.png",
      alt: "Equipo reunido en una operación logística",
      width: 1672,
      height: 941,
      treatment: "photo",
    },
    timeline: UNIMARKA_TIMELINE,
    mission: CORPORATE_MISSION,
    vision: CORPORATE_VISION,
    values: CORPORATE_VALUES,
  },
  allies: {
    eyebrow: "Aliados comerciales",
    title: "Aliados que hacen parte de esta historia",
    description: "Conoce las marcas aliadas de Unimarka.",
    items: [
      // Relevancia editorial en Colombia: eleccion FMCG publicada por Kantar,
      // reconocimiento masivo y, despues, marcas especializadas/institucionales.
      commercialAllyLogo(
        "Brinsa",
        "Refisal",
        "/brands/allies-page/refisal.webp",
        600,
        376
      ),
      commercialAllyLogo(
        "Unilever",
        "Fruco",
        "/brands/allies-page/fruco.webp",
        491,
        400
      ),
      commercialAllyLogo(
        "Essity / Grupo Familia",
        "Familia",
        "/brands/allies-page/familia.webp",
        600,
        372
      ),
      commercialAllyLogo(
        "Unilever",
        "Dove",
        "/brands/allies-page/dove.webp",
        550,
        400
      ),
      commercialAllyLogo(
        "Quala",
        "Vive 100",
        "/brands/allies-page/vive100.webp",
        600,
        210
      ),
      commercialAllyLogo(
        "Essity / Grupo Familia",
        "Nosotras",
        "/brands/allies-page/nosotras.webp",
        452,
        400
      ),
      commercialAllyLogo(
        "Unilever",
        "Maizena",
        "/brands/allies-page/maizena.webp",
        600,
        232
      ),
      commercialAllyLogo(
        "Essity / Grupo Familia",
        "Pequeñín",
        "/brands/allies-page/pequenin.webp",
        549,
        400
      ),
      commercialAllyLogo(
        "Essity / Grupo Familia",
        "TENA",
        "/brands/allies-page/tena.webp",
        600,
        368
      ),
      commercialAllyLogo(
        "Super de Alimentos",
        "Trululu",
        "/brands/allies-page/trululu.webp",
        600,
        222
      ),
      commercialAllyLogo(
        "Unilever",
        "Axe",
        "/brands/allies-page/axe.webp",
        600,
        189
      ),
      commercialAllyLogo(
        "Unilever",
        "Savital",
        "/brands/allies-page/savital.webp",
        600,
        282
      ),
      commercialAllyLogo(
        "Brinsa",
        "Blancox",
        "/brands/allies-page/blancox.webp",
        600,
        393
      ),
      commercialAllyLogo(
        "Reckitt",
        "Vanish",
        "/brands/allies-page/vanish.webp",
        515,
        400
      ),
      commercialAllyLogo(
        "Unilever",
        "Lux",
        "/brands/allies-page/lux.webp",
        600,
        251
      ),
      commercialAllyLogo(
        "Alicorp",
        "Aromatel",
        "/brands/allies-page/aromatel.webp",
        526,
        400
      ),
      commercialAllyLogo(
        "Grupo BIOS",
        "Mirringo",
        "/brands/allies-page/mirringo.webp",
        600,
        146
      ),
      commercialAllyLogo(
        "Grupo BIOS",
        "Ringo",
        "/brands/allies-page/ringo.webp",
        600,
        178
      ),
      commercialAllyLogo(
        "Super de Alimentos",
        "Súper",
        "/brands/allies-page/super.webp",
        600,
        333
      ),
      commercialAllyLogo(
        "Americandy / Dulces La Americana",
        "Big Bom",
        "/brands/allies-page/big-bom.webp",
        430,
        400
      ),
      commercialAllyLogo(
        "Essity / Grupo Familia",
        "Tork",
        "/brands/allies-page/tork.webp",
        600,
        340
      ),
      commercialAllyLogo(
        "CanAmor",
        "Petys",
        "/brands/allies-page/petys.webp",
        600,
        378
      ),
      commercialAllyLogo(
        "Essity / Grupo Familia",
        "Pomys",
        "/brands/allies-page/pomys.webp",
        600,
        326
      ),
      commercialAllyLogo(
        "Essential Home",
        "Woolite",
        "/brands/allies-page/woolite.webp",
        600,
        284
      ),
      commercialAllyLogo(
        "Grupo BIOS",
        "Nutriss",
        "/brands/allies-page/nutriss.webp",
        600,
        318
      ),
      commercialAllyLogo(
        "Quala",
        "Ricostilla",
        "/brands/allies-page/ricostilla.webp",
        554,
        400
      ),
      commercialAllyLogo(
        "Soberana",
        "La Soberana",
        "/brands/allies-page/la-soberana.webp",
        600,
        249
      ),
      commercialAllyLogo(
        "Quala",
        "Saviloe",
        "/brands/allies-page/saviloe.webp",
        600,
        217
      ),
      commercialAllyLogo(
        "Quala",
        "NutriBela",
        "/brands/allies-page/nutribela.webp",
        600,
        193
      ),
      commercialAllyLogo(
        "Brinsa",
        "Blancox Lozacrem",
        "/brands/allies-page/blancox-lozacrem.webp",
        600,
        227
      ),
      commercialAllyLogo(
        "Reckitt",
        "Sanpic",
        "/brands/allies-page/sanpic.webp",
        526,
        400
      ),
      commercialAllyLogo(
        "Essity / Grupo Familia",
        "Familia Institucional",
        "/brands/allies-page/familia-institucional.webp",
        600,
        371
      ),
      commercialAllyLogo(
        "Americandy / Dulces La Americana",
        "Americandy",
        "/brands/allies-page/americandy.webp",
        600,
        255
      ),
    ],
    logos: unimarkaBrandLogos,
    advertisements: unimarkaAdvertisements,
  },
  culture: {
    eyebrow: "Cultura Unimarka",
    title: "Ideas útiles para fortalecer cada negocio",
    description:
      "Un espacio editorial enfocado para compartir contenido de valor con los clientes de Unimarka.",
    image: {
      src: "/images/collage-cultura-unimarka-20260730-v2.jpg",
      alt: "Collage de cultura de Unimarka",
      width: 6000,
      height: 3375,
      treatment: "photo",
    },
    imagePresentation: "inline",
    heroImages: [
      {
        src: "/images/culture/people/hero-persona-1.jpg",
        alt: "Comerciante atendida por Unimarka en su tienda",
        width: 2607,
        height: 1739,
        treatment: "photo",
        objectPosition: "32% 0%",
        verticalOffset: "5rem",
      },
      {
        src: "/images/culture/people/hero-persona-2.jpg",
        alt: "Cliente de Unimarka presentando productos en su establecimiento",
        width: 2650,
        height: 1653,
        treatment: "photo",
        objectPosition: "69% 0%",
        verticalOffset: "5rem",
      },
      {
        src: "/images/culture/people/hero-persona-3.jpg",
        alt: "Cliente de Unimarka compartiendo su experiencia comercial",
        width: 2629,
        height: 1758,
        treatment: "photo",
        objectPosition: "61% 0%",
        verticalOffset: "5rem",
      },
    ],
    topics: [
      {
        icon: "trending-up",
        title: "Tips comerciales",
        description:
          "Ideas prácticas para apoyar la gestión comercial y la relación con los compradores.",
        image: {
          src: "/images/culture/tips-comerciales-unimarka-ruleset-faces-v3.png",
          alt: "Asesora comercial de Unimarka revisando el surtido de una tienda",
          width: 1448,
          height: 1086,
          treatment: "photo",
        },
      },
      {
        icon: "store",
        title: "Buenas prácticas para establecimientos",
        description:
          "Orientaciones generales sobre organización, exhibición y experiencia en el punto de venta.",
        image: {
          src: "/images/culture/buenas-practicas-unimarka-ruleset-faces-v3.png",
          alt: "Colaborador de Unimarka realizando control de inventario",
          width: 1448,
          height: 1086,
          treatment: "photo",
        },
      },
      {
        icon: "lightbulb",
        title: "Recomendaciones y contenido de apoyo",
        description:
          "Recursos para inspirar decisiones informadas y fortalecer la operación de los negocios.",
        image: {
          src: "/images/culture/contenido-apoyo-unimarka-ruleset-faces-v3.png",
          alt: "Equipo de Unimarka revisando un plan operativo",
          width: 1448,
          height: 1086,
          treatment: "photo",
        },
      },
    ],
  },
  contact: {
    eyebrow: "Contacto",
    title: "Conversemos por nuestros canales oficiales",
    description:
      "Encuentra aquí los canales oficiales de atención de Unimarka.",
    // Correo y teléfono verificados en redesciales.txt.
    email: "servicioalcliente@unimarka.com",
    phone: "320-341-4212",
    pendingMessage:
      "Para comunicarte, utiliza el teléfono, correo o redes sociales disponibles en esta página.",
  },
  suppliers: {
    eyebrow: "Proveedores",
    title: "Bienvenido al registro.",
    description:
      "Registra la información de tu empresa para iniciar el proceso como proveedor de Unimarka.",
  },
  careers: {
    eyebrow: "Trabaja con nosotros",
    title: "Construyamos nuevas oportunidades",
    description:
      "Conoce la información disponible sobre oportunidades laborales y postulaciones.",
    image: {
      src: "/images/trabajo-unimarka-contratouk-20260824.png",
      alt: "Mano firmando un contrato de trabajo sobre un escritorio",
      width: 1536,
      height: 1024,
      treatment: "photo",
    },
  },
  legal: {
    eyebrow: "Información legal",
    title: "Transparencia y atención responsable",
    description:
      "Consulta la política de tratamiento de datos y la información sobre PQRS de Unimarka.",
  },
  ethics: {
    eyebrow: "Demostración · contenido provisional",
    title: "Código de ética — borrador no aprobado",
    description:
      "Propuesta ficticia para explorar principios y pautas de conducta empresarial. No constituye una política de Unimarka.",
  },
  dataPolicy: {
    eyebrow: "Tratamiento de datos",
    title: "Política de tratamiento de datos personales",
    description:
      "Consulta los principios, términos y condiciones del tratamiento de datos personales de Unimarka S.A.S.",
    applicability:
      "Esta política identifica expresamente como responsable a UNIMARKA S.A.S.",
    documentId: "unimarka",
  },
  pqrs: {
    eyebrow: "PQRS",
    title: "Peticiones, quejas, reclamos y sugerencias",
    description:
      "Conoce los tipos de solicitudes disponibles para comunicarte con Unimarka.",
    categories: [
      {
        icon: "file-text",
        title: "Peticiones",
        description:
          "Solicitudes de información, orientación o actuaciones relacionadas con la empresa.",
      },
      {
        icon: "megaphone",
        title: "Quejas",
        description:
          "Manifestaciones relacionadas con la atención o el servicio recibido.",
      },
      {
        icon: "shield",
        title: "Reclamos",
        description:
          "Solicitudes de revisión sobre una situación concreta relacionada con productos o servicios.",
      },
      {
        icon: "lightbulb",
        title: "Sugerencias",
        description:
          "Ideas y recomendaciones orientadas a mejorar la atención, los procesos o los servicios.",
      },
    ],
    filing: {
      enabled: true,
      backendAvailable: true,
    },
  },
  footerDescription:
    "Somos especializados en la comercialización y distribución de productos de consumo masivo",
  socialLinks: {
    linkedin: null,
    instagram: "https://www.instagram.com/unimarka_col/?igshid=YmMyMTA2M2Y=",
    facebook: "https://www.facebook.com/unimarka.23/?ti=as",
  },
  // LinkedIn no aparece en redesciales.txt para Unimarka; se retira del footer sin dejar espacio vacío.
  socialNetworks: ["instagram", "facebook"],
  // Fuente: C:\Devs\web\la-nieve-web\redesciales.txt (sección "Unimarka").
  footerContact: {
    email: "servicioalcliente@unimarka.com",
    location:
      "Cra 22 N 5B-114 BG A15 Parque Comercial La Primavera Villavicencio – Meta",
  },
  developmentTeam: "Equipo TI & Desarrollo Unimarka",
} as const satisfies SiteConfig;
