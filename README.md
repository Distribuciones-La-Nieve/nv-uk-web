# Sitios corporativos: La Nieve + Unimarka

Monorepo de dos aplicaciones Next.js independientes que comparten estructura, componentes, estilos y comportamiento sin duplicar la implementación.

## Aplicaciones

| Aplicación              | Workspace               | Desarrollo              | Producción local        |
| ----------------------- | ----------------------- | ----------------------- | ----------------------- |
| Distribuciones La Nieve | `@corporativo/la-nieve` | `http://localhost:3000` | `http://localhost:3000` |
| Unimarka                | `@corporativo/unimarka` | `http://localhost:3001` | `http://localhost:3001` |

## Inicio rápido

Desde la raíz del repositorio:

```bash
npm install
npm run dev
```

`npm run dev` levanta las dos aplicaciones simultáneamente. Los puertos acordados son `3000` para La Nieve y `3001` para Unimarka; no deben reasignarse automáticamente si alguno está ocupado.

También se puede iniciar cada app de forma independiente:

```bash
npm run dev:la-nieve
npm run dev:unimarka
```

## Comandos

```bash
npm run dev               # ambas apps: 3000 y 3001
npm run build             # build de producción de ambas apps
npm run build:la-nieve    # solo La Nieve
npm run build:unimarka    # solo Unimarka
npm run lint              # ESLint en apps, paquete y scripts
npm run typecheck         # TypeScript en los tres workspaces
npm run format:check      # comprueba formato
```

## Despliegue en Hostinger

Cada marca se despliega como una aplicación Node.js independiente desde la
raíz del repositorio. Los comandos `npm run deploy:la-nieve` y
`npm run deploy:unimarka` generan paquetes autónomos en `deploy/`, sin duplicar
el código fuente compartido.

La configuración completa del panel, las variables y el procedimiento de
verificación están en [docs/hostinger-node-deployment.md](./docs/hostinger-node-deployment.md).

## Arquitectura

```text
apps/
  la-nieve/
    public/               # logo e imágenes exclusivos
    src/app/              # layout y rutas de La Nieve
    src/site.config.ts    # identidad, metadata y textos
  unimarka/
    public/               # logo e imágenes exclusivos
    src/app/              # layout y rutas de Unimarka
    src/site.config.ts    # identidad, metadata y textos
packages/
  site-kit/
    src/assets/           # hero y fotografías de valores compartidos
    src/components/       # navegación, footer y UI compartida
    src/config/           # tipos, navegación y contenido corporativo común
    src/hooks/            # GSAP, Lenis, glow, tilt y scroll
    src/pages/            # plantillas de cada página
    src/styles/           # Tailwind y tokens de ambas marcas
scripts/
  dev.mjs                 # orquestador de los dos servidores
assets/                   # fuentes de marca y documentos originales
```

La implementación compartida vive en `@corporativo/site-kit`; las rutas de cada app son entradas delgadas que inyectan su propia configuración.

## Navegación y rutas

Cada aplicación expone la misma estructura de páginas:

| Ruta                          | Contenido                                  |
| ----------------------------- | ------------------------------------------ |
| `/`                           | Inicio                                     |
| `/somos`                      | Somos Nieve / Somos Unimarka               |
| `/aliados-comerciales`        | Aliados comerciales                        |
| `/cultura`                    | Cultura Nieve / Cultura Unimarka           |
| `/contacto`                   | Contacto                                   |
| `/trabaja-con-nosotros`       | Trabaja con nosotros                       |
| `/legal`                      | Entrada al contenido legal                 |
| `/legal/tratamiento-de-datos` | Tratamiento de datos                       |
| `/legal/pqrs`                 | Peticiones, quejas, reclamos y sugerencias |

La barra de navegación es transparente al inicio y toma el color principal de la marca al hacer scroll. `Legal` despliega un menú unido a la barra mediante hover o foco, y sus opciones también son accesibles desde la navegación móvil.

Las rutas anteriores se conservan como redirecciones para no romper enlaces existentes:

```text
/nosotros  → /somos
/marcas    → /aliados-comerciales
/productos → /
/cobertura → /#cobertura
/clientes  → /#canales
```

## Composición de Inicio

La portada compartida se organiza en este orden:

1. Hero, basado en el bloque `Together` suministrado. Las dos apps importan la misma imagen física desde `packages/site-kit/src/assets/hero/together-store.png`.
2. Aliados (`Brands`), con los logotipos locales configurados por marca: 16 de `MarcasNV` para La Nieve y 12 de `MarcasUK` para Unimarka. El carrusel se pausa con hover, continúa desde el mismo punto y respeta `prefers-reduced-motion`.
3. Estadísticas de ejemplo.
4. Mapa interactivo de cobertura con departamentos demo.
5. Canales de clientes.
6. Tecnología e innovación continua.

Las cifras, departamentos y pilares incluidos como demostración deben permanecer identificados como tales y ser sustituidos o validados antes de publicar el sitio. La misión, la visión y los cinco valores suministrados se mantienen literalmente en una configuración compartida; ya no se presentan como contenido demo.

## Imágenes

El hero de las dos marcas usa un único recurso, sin copias por aplicación:

```text
packages/site-kit/src/assets/hero/together-store.png
```

Las cinco fotografías conceptuales y optimizadas de `Nuestros valores` también son compartidas:

```text
packages/site-kit/src/assets/values/integridad.webp
packages/site-kit/src/assets/values/compromiso-social.webp
packages/site-kit/src/assets/values/lealtad.webp
packages/site-kit/src/assets/values/respeto.webp
packages/site-kit/src/assets/values/emprendimiento.webp
```

Las imágenes corporativas generadas para esta iteración se integran localmente en el `public/images` de cada aplicación, sin depender de una URL externa:

```text
apps/la-nieve/public/images/somos-nieve.png
apps/la-nieve/public/images/stats-nieve.png
apps/la-nieve/public/images/innovacion-nieve.png
apps/la-nieve/public/images/cultura-nieve.png
apps/unimarka/public/images/somos-unimarka.png
apps/unimarka/public/images/stats-unimarka.png
apps/unimarka/public/images/innovacion-unimarka.png
apps/unimarka/public/images/cultura-unimarka.png
```

Estas piezas son provisionales y no incorporan logotipos, empaques identificables ni afirmaciones corporativas.

Los logotipos reales del carrusel y la página de aliados se publican por aplicación, sin mezclar marcas:

```text
apps/la-nieve/public/brands/   # 16 copias web desde assets/MarcasNV
apps/unimarka/public/brands/   # 12 copias web desde assets/MarcasUK
```

En Unimarka se mantienen marcadores solamente para Grupo Familia e Indulacteos, porque no se suministró un archivo identificable para esas entradas. La Nieve configura su favicon exclusivo en `apps/la-nieve/public/faviconnieve.png`.

## Edición de contenido

- La Nieve: `apps/la-nieve/src/site.config.ts`
- Unimarka: `apps/unimarka/src/site.config.ts`
- Misión, visión y valores literales: `packages/site-kit/src/config/corporateContent.ts`
- Tokens visuales: `packages/site-kit/src/styles/globals.css`
- Navegación compartida: `packages/site-kit/src/config/navigation.ts`

Unimarka prioriza los rojos mediante sus tokens semánticos, conservando la paleta oficial como referencia y un footer azul corporativo. La Nieve mantiene su paleta y utiliza un footer grafito. El navbar compartido muestra los logos directamente, sin cápsula, y aplica transparencia, desenfoque, sombra e indicador activo de forma discreta.

Las URLs de LinkedIn, Instagram y Facebook se configuran en `socialLinks` dentro de cada `site.config.ts`. No se encontraron enlaces oficiales verificables en el proyecto: actualmente todos están en `null` y los botones del footer se muestran deshabilitados, sin usar URLs inventadas ni `href="#"`.

No se deben publicar cifras, cobertura, contactos, logos de aliados o afirmaciones corporativas sin validación y autorización. El registro de decisiones, pruebas y pendientes está en [PROCESO_FASE_1.md](./PROCESO_FASE_1.md).
