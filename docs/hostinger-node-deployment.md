# Despliegue en Hostinger Node.js

El repositorio conserva las dos aplicaciones y el paquete compartido. En
Hostinger se crean dos aplicaciones Node.js conectadas al mismo repositorio,
pero cada una usa como raíz el workspace de su marca.

## Requisitos

- Aplicaciones Node.js en Hostinger, no alojamiento estático.
- Node.js 20.9 o posterior.
- Dos aplicaciones creadas en el panel, una por dominio.
- Una base MySQL preparada con `database/form-submissions.sql`.
- Variables de entorno configuradas antes del build.

## Aplicación La Nieve

Configurar en Hostinger:

```text
Repositorio: este repositorio completo
Rama: rama de producción
Directorio raíz: apps/la-nieve
Comando de build: npm run build
Versión de Node.js: 20 o superior
```

Aunque el comando se ejecuta en `apps/la-nieve`, npm reconoce que la carpeta es
un workspace y utiliza `package-lock.json`, `node_modules` y
`packages/site-kit` desde la raíz del repositorio.

## Aplicación Unimarka

Configurar una segunda aplicación Node.js conectada al mismo repositorio:

```text
Repositorio: este repositorio completo
Rama: rama de producción
Directorio raíz: apps/unimarka
Comando de build: npm run build
Versión de Node.js: 20 o superior
```

Cada aplicación recibe su propio dominio, variables y proceso. Un despliegue de
La Nieve no necesita compilar Unimarka, y viceversa.

Hostinger ejecuta la instalación automáticamente. No se configura un directorio
de publicación estática: cada workspace es una aplicación Next.js con rutas de
servidor.

## Variables públicas

Estas variables deben existir durante el build. Cada aplicación usa su propio
dominio y su propia clave pública de Turnstile:

```text
NEXT_PUBLIC_SITE_URL=https://dominio-de-la-marca.example
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

`NEXT_PUBLIC_SITE_URL` debe ser un origen HTTPS sin ruta final, parámetros ni
fragmentos.

## Variables privadas

Configurar en cada aplicación:

```text
TURNSTILE_SECRET_KEY=
DATABASE_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=
HOSTNAME=0.0.0.0
```

Hostinger debe asignar `PORT`; no se debe fijar manualmente. Si no se usa
`DATABASE_URL`, configurar:

```text
DATABASE_HOST=
DATABASE_PORT=3306
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_SSL=false
DATABASE_CONNECTION_LIMIT=5
DATABASE_QUEUE_LIMIT=50
```

Destinatarios para La Nieve:

```text
RESEND_CAREERS_TO_LA_NIEVE=
RESEND_PQRS_TO_LA_NIEVE=
RESEND_SUPPLIERS_TO_LA_NIEVE=
```

Destinatarios para Unimarka:

```text
RESEND_CAREERS_TO_UNIMARKA=
RESEND_PQRS_TO_UNIMARKA=
RESEND_SUPPLIERS_TO_UNIMARKA=
```

Las variables privadas no deben guardarse en Git. `.env.example` contiene solo
los nombres esperados.

## Controles de seguridad del alojamiento

Antes de habilitar los formularios públicos, configurar en Hostinger o en el
proxy/WAF frontal:

- Límite de cuerpo por solicitud de 27 MB.
- Límites de frecuencia por IP y ruta para `/api/forms/*`.
- Acceso HTTPS obligatorio y HSTS en el dominio público.
- Acceso directo al origen restringido al proxy de confianza, si aplica.
- MySQL limitado por firewall a los servidores de las aplicaciones.
- Conexión MySQL con TLS (`DATABASE_SSL=true`) cuando el tráfico salga de una
  red privada controlada.
- Alertas de crecimiento de base de datos, errores 429/413 y fallos repetidos de
  Turnstile.

El repositorio debe permanecer privado. No se deben versionar exportaciones,
instantáneas, credenciales, nombres de hosts internos ni resultados financieros
o comerciales obtenidos de bases corporativas.

## Empaquetado standalone opcional

Los comandos siguientes permanecen disponibles para un VPS, una migración o un
despliegue manual que necesite artefactos autónomos:

```bash
npm run deploy:la-nieve
npm run deploy:unimarka
```

Estos comandos realizan las siguientes tareas:

1. Compilan únicamente la aplicación seleccionada.
2. Crean la salida mínima de Next.js con `output: "standalone"`.
3. Copian el directorio `public` de la marca.
4. Copian los recursos compilados de `.next/static`.
5. Generan un `package.json` mínimo con el comando de inicio.

Las salidas locales son:

```text
deploy/la-nieve/
  apps/la-nieve/server.js
  node_modules/
  package.json

deploy/unimarka/
  apps/unimarka/server.js
  node_modules/
  package.json
```

`deploy/` está ignorado por Git porque es una salida generada y no forma parte
del despliegue administrado de Hostinger.

## Verificación local

Generar y ejecutar La Nieve:

```bash
npm run deploy:la-nieve
cd deploy/la-nieve
npm start
```

Generar y ejecutar Unimarka:

```bash
npm run deploy:unimarka
cd deploy/unimarka
npm start
```

En Windows PowerShell se puede asignar otro puerto antes de iniciar:

```powershell
$env:PORT = "4100"
$env:HOSTNAME = "127.0.0.1"
npm start
```

Antes de habilitar formularios públicos se deben verificar Turnstile, conexión
MySQL, radicación, carga de anexos y entrega de correos en cada dominio.
