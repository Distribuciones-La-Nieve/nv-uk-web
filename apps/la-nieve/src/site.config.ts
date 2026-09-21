import {
  CORPORATE_MISSION,
  createCorporateStatsGroups,
  CORPORATE_TECHNOLOGY,
  CORPORATE_VALUES,
  CORPORATE_VISION,
  LA_NIEVE_TIMELINE,
  createCorporateNavigation,
  normalizeSiteOrigin,
  type SiteAdvertisingCampaign,
  type SiteAdvertisingOrientation,
  type SiteAdvertisingProportion,
  type SiteAdvertisingVariant,
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

const laNieveBrandLogos = [
  brandLogo("BAT", "/brands/bat.png", 2387, 1017, 176),
  brandLogo(
    "Colgate-Palmolive",
    "/brands/colgate-palmolive.png",
    1544,
    1064,
    142
  ),
  brandLogo(
    "Nestlé Alimentos",
    "/brands/nestle-alimentos.png",
    400,
    400,
    100,
    1.4
  ),
  brandLogo("Nestlé Purina", "/brands/nestle-purina.png", 5000, 2834, 170, 1.4),
  brandLogo("Alpina", "/brands/alpina.png", 755, 455, 142),
  brandLogo(
    "Harinera del Valle",
    "/brands/harinera-del-valle-20260730-v2.png",
    1536,
    1024,
    100
  ),
  brandLogo(
    "Pisa Farmacéutica – Electrolit",
    "/brands/electrolit.png",
    600,
    600,
    104,
    1.4
  ),
  brandLogo("Levapan", "/brands/levapan.png", 1200, 1200, 100, 1.4),
  brandLogo("Softys", "/brands/softys.png", 410, 222, 154),
  brandLogo("Incauca", "/brands/incauca.png", 1536, 1024, 136, 1.4),
  brandLogo("Rama", "/brands/rama.png", 260, 130, 164),
  brandLogo(
    "Corporación Diana",
    "/brands/corporacion-diana.png",
    227,
    148,
    138
  ),
  brandLogo(
    "Unidad de Licores del Meta",
    "/brands/unidad-licores-meta.png",
    1024,
    1024,
    104
  ),
  brandLogo("Súper de Alimentos", "/brands/super-alimentos.png", 400, 201, 164),
] as const;

function extractedAllyLogo(
  commercialHouse: string,
  id: string,
  name: string,
  width: number,
  height: number,
  displayWidth = 160,
  visualScale?: number
) {
  return {
    ...brandLogo(
      name,
      `/brands/allies-page/logo-${id}.webp`,
      width,
      height,
      displayWidth,
      visualScale
    ),
    commercialHouse,
  };
}

/** Catálogo completo exclusivo de la página Aliados comerciales. */
const laNieveAlliesPageLogos = [
  extractedAllyLogo("Alpina", "061", "Alpina", 600, 314, 178),
  extractedAllyLogo("Colgate-Palmolive", "010", "Colgate", 400, 400, 156, 1.75),
  extractedAllyLogo("BAT", "056", "Vuse", 600, 188, 196, 1.08),
  extractedAllyLogo("Nestlé Alimentos", "016", "Maggi", 400, 400, 136),
  extractedAllyLogo("Nestlé Alimentos", "021", "Nestlé", 400, 400, 150, 1.65),
  extractedAllyLogo("Nestlé Alimentos", "015", "Milo", 400, 400, 136),
  extractedAllyLogo("Nestlé Alimentos", "018", "Nescafé", 400, 400, 154, 2),
  extractedAllyLogo(
    "Colgate-Palmolive",
    "006",
    "Palmolive",
    600,
    306,
    188,
    1.05
  ),
  extractedAllyLogo(
    "Colgate-Palmolive",
    "004",
    "Suavitel",
    400,
    400,
    144,
    1.55
  ),
  extractedAllyLogo("Colgate-Palmolive", "003", "Axion", 400, 400, 136),
  extractedAllyLogo("Colgate-Palmolive", "008", "Protex", 400, 400, 150, 2),
  extractedAllyLogo("Levapan", "054", "San Jorge", 400, 400, 142),
  extractedAllyLogo("Nestlé Purina", "035", "Dog Chow", 400, 400, 144, 1.1),
  extractedAllyLogo("Nestlé Purina", "036", "Cat Chow", 600, 297, 160, 1.18),
  extractedAllyLogo("Nestlé Alimentos", "022", "Saltinas", 400, 400, 144, 1.55),
  extractedAllyLogo("Nestlé Alimentos", "017", "Klim", 400, 400, 136),
  extractedAllyLogo("Alpina", "057", "Bon Yurt", 400, 400, 144, 1.1),
  extractedAllyLogo("Alpina", "060", "Yogo Yogo", 400, 400, 142, 1.05),
  extractedAllyLogo(
    "Nestlé Alimentos",
    "019",
    "La Lechera",
    400,
    400,
    144,
    1.3
  ),
  extractedAllyLogo("Colgate-Palmolive", "002", "Fabuloso", 400, 400, 136),
  extractedAllyLogo("Colgate-Palmolive", "012", "Ajax", 498, 400, 152, 1.05),
  extractedAllyLogo(
    "Harinera del Valle",
    "043",
    "Haz de Oros",
    375,
    400,
    140,
    1.05
  ),
  extractedAllyLogo(
    "Harinera del Valle",
    "044",
    "Pastas La Muñeca",
    510,
    400,
    154,
    1.2
  ),
  extractedAllyLogo(
    "Harinera del Valle",
    "046",
    "Riquísimo",
    600,
    371,
    190,
    1.05
  ),
  extractedAllyLogo("Softys", "029", "Babysec", 600, 366, 180, 1.08),
  extractedAllyLogo("Softys", "028", "Ladysoft", 600, 364, 186, 1.08),
  extractedAllyLogo("Softys", "027", "Elite Profesional", 600, 365, 188, 1.08),
  extractedAllyLogo("Nestlé Purina", "039", "Felix", 449, 400, 150, 1.05),
  extractedAllyLogo(
    "Colgate-Palmolive",
    "011",
    "Speed Stick",
    400,
    400,
    142,
    1.2
  ),
  extractedAllyLogo(
    "Colgate-Palmolive",
    "014",
    "Lady Speed Stick",
    510,
    400,
    150,
    1.7
  ),
  extractedAllyLogo("Levapan", "055", "Gel'hada", 600, 290, 182, 1.1),
  extractedAllyLogo("Nestlé Alimentos", "023", "Nestum", 400, 400, 144, 1.6),
  extractedAllyLogo("Nestlé Alimentos", "020", "Fitness", 400, 400, 148, 1.5),
  extractedAllyLogo("Nestlé Purina", "038", "Alpo", 478, 400, 140, 1.22),
  extractedAllyLogo("Nestlé Purina", "037", "Gatsy", 400, 400, 136, 1.05),
  extractedAllyLogo(
    "Harinera del Valle",
    "045",
    "Pastas San Remo",
    412,
    400,
    152,
    1.1
  ),
  extractedAllyLogo(
    "Harinera del Valle",
    "047",
    "Harina La Americana",
    600,
    157,
    194,
    1.08
  ),
] as const;

function advertisingCampaign(
  id: string,
  name: string,
  src: string,
  width: number,
  height: number,
  logo: SiteBrandLogo | undefined,
  variant: SiteAdvertisingVariant,
  orientation: SiteAdvertisingOrientation = "media-left",
  mainProportion: SiteAdvertisingProportion = 65,
  priority = false
): SiteAdvertisingCampaign {
  return {
    id,
    brand: "la-nieve",
    variant,
    orientation,
    mainProportion,
    ...(logo ? { logo } : {}),
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

const laNieveAdvertisementCatalog = [
  advertisingCampaign(
    "vuse-bat",
    "Vuse (BAT)",
    "/images/advertising/vuse-bat.png",
    1536,
    1024,
    laNieveBrandLogos[0],
    "featured",
    "media-left",
    70,
    true
  ),
  advertisingCampaign(
    "colgate-palmolive",
    "Colgate-Palmolive",
    "/images/advertising/colgate-palmolive.png",
    1536,
    1024,
    laNieveBrandLogos[1],
    "split",
    "media-right",
    65
  ),
  advertisingCampaign(
    "alpina",
    "Alpina",
    "/images/advertising/alpina.png",
    1717,
    916,
    laNieveBrandLogos[4],
    "landscape"
  ),
  advertisingCampaign(
    "nestle-alimentos",
    "Nestlé Alimentos",
    "/images/advertising/nestle-alimentos-20260914.jpg",
    1600,
    800,
    laNieveBrandLogos[2],
    "split",
    "media-left",
    60
  ),
  advertisingCampaign(
    "electrolit",
    "Electrolit",
    "/images/advertising/electrolit.png",
    1717,
    916,
    laNieveBrandLogos[6],
    "split",
    "media-right",
    70
  ),
  advertisingCampaign(
    "nestle-purina",
    "Nestlé Purina",
    "/images/advertising/nestle-purina.png",
    1774,
    887,
    laNieveBrandLogos[3],
    "featured"
  ),
  advertisingCampaign(
    "harinera-del-valle",
    "Harinera del Valle",
    "/images/advertising/harinera-del-valle.png",
    1717,
    916,
    laNieveBrandLogos[5],
    "split",
    "media-left",
    65
  ),
  advertisingCampaign(
    "levapan",
    "Levapan",
    "/images/advertising/levapan.png",
    1693,
    929,
    laNieveBrandLogos[7],
    "landscape"
  ),
  advertisingCampaign(
    "rama",
    "Rama",
    "/images/advertising/rama-20260914.jpg",
    1600,
    854,
    laNieveBrandLogos[10],
    "split",
    "media-right",
    60
  ),
  advertisingCampaign(
    "incauca",
    "Incauca",
    "/images/advertising/incauca.png",
    1717,
    916,
    laNieveBrandLogos[9],
    "split",
    "media-left",
    70
  ),
  advertisingCampaign(
    "aceite-oleoflor",
    "Aceite Oleoflor",
    "/images/advertising/aceite-oleoflor-20260914.jpg",
    1600,
    800,
    undefined,
    "landscape"
  ),
  advertisingCampaign(
    "aseo-softys",
    "Aseo Softys",
    "/images/advertising/aseo-softys-20260914.jpg",
    1600,
    800,
    laNieveBrandLogos[8],
    "landscape"
  ),
  advertisingCampaign(
    "diana",
    "Diana",
    "/images/advertising/diana-20260914.png",
    1600,
    800,
    laNieveBrandLogos[11],
    "landscape"
  ),
  advertisingCampaign(
    "licor-llanero",
    "Aguardiente Llanero",
    "/images/advertising/licor-llanero-20260914.jpg",
    1600,
    800,
    laNieveBrandLogos[12],
    "landscape"
  ),
] as const;

// Ocultamiento temporal solicitado: la campaña y sus recursos permanecen en
// el catálogo para poder reactivarlos sin reconstruir su configuración.
const laNieveAdvertisements = laNieveAdvertisementCatalog.filter(
  (campaign) => campaign.id !== "vuse-bat"
);

/**
 * Brand-owned content and identity for Distribuciones La Nieve.
 * Any illustrative content is explicitly identified as pending validation.
 */
export const siteConfig = {
  id: "la-nieve",
  name: "Distribuciones La Nieve",
  legalName: "Distribuciones La Nieve",
  slogan: "Sirviendo con pasión",
  logo: {
    src: "/brand/logo-horizontal.png",
    alt: "Logotipo de Distribuciones La Nieve",
    width: 438,
    height: 214,
    display: "wide",
  },
  chromeLogo: {
    // Nombre versionado: /brand/logo-white.png sirvió durante un tiempo un archivo
    // 1536×1024 con otra proporción y las cachés (navegador y optimizador de Next)
    // podían seguir entregándolo. La URL nueva garantiza el archivo 438×214 actual.
    src: "/brand/logo-white-v2.png",
    alt: "Logotipo blanco de Distribuciones La Nieve",
    width: 438,
    height: 214,
    display: "wide",
  },
  favicon: "/faviconnieve.png",
  themeColor: "#27348A",
  // Producción: definir NEXT_PUBLIC_SITE_URL en el entorno de despliegue (ver
  // docs/deployment.md). Sin esa variable, se usa el origen de desarrollo
  // local para que metadataBase, canonicals, sitemap y robots sigan siendo
  // URLs absolutas válidas sin afirmar un dominio de producción inexistente.
  siteUrl: normalizeSiteOrigin(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  // Token de Google Search Console para esta propiedad, si ya fue emitido.
  // Sin NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION definido, el meta tag de
  // verificación simplemente no se genera (no se inventa ningún valor).
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  metadata: {
    title: "Distribuciones la Nieve",
    titleTemplate: "%s | Distribuciones La Nieve",
    description:
      "Sitio corporativo de Distribuciones La Nieve, empresa colombiana de distribución y comercio mayorista ubicada en Villavicencio, Meta.",
    category: "Distribución y comercio mayorista",
    keywords: [
      "Distribuciones La Nieve",
      "distribución",
      "comercio mayorista",
      "Villavicencio",
      "Meta",
      "Colombia",
    ],
  },
  navigation: createCorporateNavigation("Nieve"),
  home: {
    eyebrow: "Juntos transformamos",
    title: "Somos el puente entre las marcas y tu negocio",
    description:
      "En Distribuciones La Nieve entendemos el día a día de tiendas, supermercados y aliados comerciales. Por eso trabajamos para que nunca falte el producto correcto, en el momento correcto.",
    image: {
      src: "/images/cliente-nieve-hero.png",
      alt: "Cliente recibiendo una caja de Distribuciones La Nieve en su tienda",
      width: 1254,
      height: 1254,
      treatment: "photo",
      objectPosition: "center",
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
    description: "Cobertura territorial.",
    // Fuente: assets/mapaNV.png. El nombre público versionado evita servir
    // una versión anterior desde la caché del navegador o del optimizador.
    image: {
      src: "/images/mapa-cobertura-la-nieve-20260730-v3.png",
      alt: "Mapa de cobertura nacional de Distribuciones La Nieve con los departamentos atendidos destacados",
      width: 2943,
      height: 4511,
      treatment: "illustration",
    },
    groups: createCorporateStatsGroups({
      departmentsCovered: 15,
      clients: "+42.000",
      municipalities: "212",
      employees: "650",
    }),
  },
  coverage: {
    eyebrow: "Mapa de cobertura — demostración",
    title: "Una operación que conecta territorios",
    description:
      "El mapa presenta una selección provisional de departamentos para mostrar la experiencia interactiva prevista.",
    departments: [
      "Amazonas",
      "Antioquia",
      "Arauca",
      "Atlántico",
      "Bolívar",
      "Boyacá",
      "Caquetá",
      "Casanare",
      "Cundinamarca",
      "Guaviare",
      "Huila",
      "Magdalena",
      "Meta",
      "Norte de Santander",
      "Santander",
      "Tolima",
      "Valle del Cauca",
      "Vichada",
    ],
    disclaimer:
      "Cobertura demostrativa: estos departamentos no constituyen una declaración de operación real. La lista requiere confirmación oficial de Distribuciones La Nieve.",
    isDemo: true,
  },
  channels: {
    eyebrow: "Clientes por canal",
    title: "Soluciones para cada tipo de negocio",
    description:
      "La arquitectura organiza la información comercial en los cinco canales definidos para el sitio.",
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
      src: "/images/innovacion-nieve.png",
      alt: "Equipo trabajando en iniciativas de tecnología e innovación",
      width: 1536,
      height: 1024,
      treatment: "photo",
    },
  },
  about: {
    eyebrow: "Somos Nieve",
    title: "Una identidad construida alrededor del servicio",
    description:
      "Conoce el propósito y los principios que orientan a Distribuciones La Nieve.",
    image: {
      src: "/images/somos-nieve-20260730-v3.png",
      alt: "Equipo reunido en una operación logística",
      width: 1672,
      height: 941,
      treatment: "photo",
    },
    timeline: LA_NIEVE_TIMELINE,
    mission: CORPORATE_MISSION,
    vision: CORPORATE_VISION,
    values: CORPORATE_VALUES,
  },
  allies: {
    eyebrow: "Aliados comerciales",
    title: "Aliados que hacen parte de esta historia",
    description: "Conoce las marcas aliadas de Distribuciones La Nieve.",
    items: laNieveAlliesPageLogos,
    logos: laNieveBrandLogos,
    advertisements: laNieveAdvertisements,
  },
  culture: {
    eyebrow: "Cultura Nieve",
    title: "Tips para hacer crecer tu negocio",
    description:
      "Ideas prácticas para fortalecer tu gestión comercial y conectar mejor con tus clientes.",
    image: {
      src: "/images/collage-cultura-nieve-20260730-v2.jpeg",
      alt: "Collage de cultura de La Nieve",
      width: 1600,
      height: 900,
      treatment: "photo",
    },
    imagePresentation: "inline",
    heroImages: [
      {
        src: "/images/culture/people/hero-persona-1.jpeg",
        alt: "Cliente de La Nieve en su establecimiento comercial",
        width: 3024,
        height: 4032,
        treatment: "photo",
        objectPosition: "50% 42%",
      },
      {
        src: "/images/culture/people/hero-persona-2.jpeg",
        alt: "Cliente y asesora comercial de La Nieve en Yopal",
        width: 960,
        height: 1280,
        treatment: "photo",
        objectPosition: "50% 14%",
        visualScale: 1.06,
        transformOrigin: "50% 15%",
      },
      {
        src: "/images/culture/people/hero-persona-3-tv-molinos-atlantico-villavicencio.jpeg",
        alt: "Asesora de La Nieve y cliente de Molinos del Atlántico en Villavicencio",
        width: 960,
        height: 1280,
        treatment: "photo",
        objectPosition: "50% 50%",
        fit: "contain",
      },
    ],
    topics: [
      {
        icon: "trending-up",
        title: "Buenas prácticas para tu negocio",
        description:
          "Recomendaciones para ofrecer una gran experiencia de compra.",
        image: {
          src: "/images/culture/tips-comerciales-nieve-ruleset-faces-v3.png",
          alt: "Asesora comercial de La Nieve revisando el surtido de una tienda",
          width: 1448,
          height: 1086,
          treatment: "photo",
        },
      },
      {
        icon: "store",
        title: "Recomendaciones y contenido para avanzar",
        description:
          "Recursos pensados para inspirarte, tomar mejores decisiones y llevar tu negocio al siguiente nivel.",
        image: {
          src: "/images/culture/buenas-practicas-nieve-ruleset-faces-v3.png",
          alt: "Colaborador de La Nieve organizando la exhibición de productos de un minimercado",
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
          src: "/images/culture/contenido-apoyo-nieve-ruleset-faces-v3.png",
          alt: "Integrante administrativo de La Nieve preparando contenido de apoyo",
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
      "Encuentra aquí los canales oficiales de atención de La Nieve.",
    email: "servicioalcliente@lanieve.co",
    phone: "320 3414212",
    pendingMessage:
      "Para comunicarte, utiliza el teléfono, correo o redes sociales disponibles en esta página.",
  },
  suppliers: {
    eyebrow: "Proveedores",
    title: "Bienvenido al registro.",
    description:
      "Registra la información de tu empresa para iniciar el proceso como proveedor de Distribuciones La Nieve.",
  },
  careers: {
    eyebrow: "Trabaja con nosotros",
    title: "Construyamos nuevas oportunidades",
    description:
      "Conoce la información disponible sobre oportunidades laborales y postulaciones.",
    image: {
      src: "/images/trabajo-nieve-20260824-v2.png",
      alt: "Mano firmando un contrato de trabajo sobre un escritorio",
      width: 1024,
      height: 1536,
      treatment: "photo",
    },
  },
  legal: {
    eyebrow: "Información legal",
    title: "Transparencia y atención responsable",
    description:
      "Consulta la política de tratamiento de datos y la información sobre PQRS de Distribuciones La Nieve.",
  },
  ethics: {
    eyebrow: "Demostración · contenido provisional",
    title: "Código de ética — borrador no aprobado",
    description:
      "Propuesta ficticia para explorar principios y pautas de conducta empresarial. No constituye una política de Distribuciones La Nieve.",
  },
  dataPolicy: {
    eyebrow: "Tratamiento de datos",
    title: "Política de tratamiento de datos personales",
    description:
      "Consulta los principios, términos y condiciones del tratamiento de datos personales de Distribuciones La Nieve S.A.S.",
    applicability:
      "Esta política identifica expresamente como responsable a DISTRIBUCIONES LA NIEVE S.A.S.",
    documentId: "la-nieve",
  },
  pqrs: {
    eyebrow: "PQRS",
    title: "Peticiones, quejas, reclamos y sugerencias",
    description:
      "Conoce los tipos de solicitudes disponibles para comunicarte con Distribuciones La Nieve.",
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
    "Somos especializados en brindar soluciones para la comercialización y distribución de consumo masivo a nivel nacional",
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/distribuciones-la-nieve-ltda",
    instagram: "https://www.instagram.com/distribuciones_la_nieve/",
    facebook:
      "https://www.facebook.com/people/Distribuciones-La-Nieve-SAS/100069879480762/#",
  },
  socialNetworks: ["linkedin", "instagram", "facebook"],
  // Fuente: C:\Devs\web\la-nieve-web\redesciales.txt (sección "Nieve").
  footerContact: {
    email: "servicioalcliente@lanieve.com",
    location:
      "Cra 22 N 5B-114 BG A15 Parque Comercial La Primavera Villavicencio – Meta",
  },
  developmentTeam: "Equipo TI & Desarrollo La Nieve",
} as const satisfies SiteConfig;
