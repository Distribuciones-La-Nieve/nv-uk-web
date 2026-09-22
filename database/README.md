# Persistencia de formularios

La aplicacion usa MySQL como fuente de verdad para PQRS, postulaciones laborales y registros de proveedores. Resend queda como canal de notificacion, no como almacenamiento.

## 1. Crear las tablas

En Hostinger abre phpMyAdmin, selecciona la base de datos de la aplicacion y ejecuta `form-submissions.sql`.

La tabla `form_submissions` guarda el expediente y los campos validados en JSON. `form_submission_attachments` guarda los adjuntos como `MEDIUMBLOB` de hasta 10 MB por archivo, acorde con los limites actuales del formulario.

## 2. Variables privadas

Configura estas variables en el entorno de produccion de cada aplicacion. No deben llevar el prefijo `NEXT_PUBLIC_` ni entrar al repositorio.

```text
DATABASE_HOST=host-de-mysql-de-hostinger
DATABASE_PORT=3306
DATABASE_NAME=nombre_de_la_base
DATABASE_USER=usuario_de_la_base
DATABASE_PASSWORD=contrasena_de_la_base
DATABASE_SSL=false
DATABASE_CONNECTION_LIMIT=5
```

Tambien se admite una sola `DATABASE_URL` con formato `mysql://usuario:contrasena@host:3306/base`.

## 3. Flujo

1. El endpoint valida Turnstile y los campos en el servidor.
2. Una transaccion bloquea el consecutivo de la empresa, crea el radicado y guarda los adjuntos.
3. El endpoint devuelve el numero al navegador.
4. Resend envia el aviso interno y una confirmacion al correo registrado.
5. Si Resend falla, el expediente y el radicado permanecen guardados; el estado de cada notificacion queda marcado para reintento.

El formato es `NV-PQRS-AAAA-######`, `NV-VAC-AAAA-######` y `NV-PRO-AAAA-######` para La Nieve; Unimarka usa `UK`.

## 4. Despliegue

La aplicacion necesita ejecutarse como servidor Node; un hosting que solo sirva archivos estaticos no puede ejecutar estos endpoints ni conectarse a MySQL. El despliegue de Hostinger usa los servidores `standalone` documentados en `docs/hostinger-node-deployment.md`.

Antes de recibir datos reales, valida con la empresa y asesoria juridica la politica de conservacion, acceso, tiempos de respuesta y el caracter oficial del radicado.
