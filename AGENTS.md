# Proyecto Clínica Dental Frontend

## Objetivo

Desarrollar un frontend sencillo para consumir la API de una clínica dental.

La documentación completa del backend está en:

- `docs/openapi.json`

Antes de implementar o modificar una integración con el backend, revisar ese
archivo y respetar exactamente sus rutas, métodos HTTP, campos, validaciones,
estados y tipos de contenido.

## Tecnologías

- Angular 20
- TypeScript estricto
- Aplicación standalone
- SCSS
- Angular Router
- Angular HttpClient
- Formularios reactivos
- Zone.js habilitado
- Sin SSR
- Sin SSG
- Docker
- Nginx para producción

## Alcance inicial

El frontend debe incluir:

1. Inicio de sesión.
2. Registro de usuarios.
3. Consulta del usuario autenticado.
4. Listado, búsqueda, creación, edición y eliminación de pacientes.
5. Listado, filtrado, creación, edición y eliminación de citas.
6. Cambio de estado de citas.
7. Cierre de sesión.

No agregar módulos que no estén contemplados en `docs/openapi.json` sin
consultarlo primero.

## Arquitectura

Usar una arquitectura sencilla basada en funcionalidades.

Estructura esperada:

src/app/
├── core/
│   ├── config/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── features/
│   ├── auth/
│   ├── patients/
│   ├── appointments/
│   └── dashboard/
├── layout/
├── shared/
├── app.config.ts
└── app.routes.ts

## Responsabilidades

### core

Contiene elementos globales y de una sola instancia:

- Configuración de la API.
- Servicios HTTP.
- Interfaces y tipos.
- Interceptor JWT.
- Manejo de errores HTTP.
- Guards de autenticación.

### features

Cada funcionalidad debe conservar sus páginas y componentes dentro de su
propia carpeta.

Ejemplos:

- `features/auth`
- `features/patients`
- `features/appointments`

### shared

Solo debe contener componentes reutilizables por varias funcionalidades.

No colocar lógica de negocio en `shared`.

### layout

Contiene la estructura visual general:

- Barra de navegación.
- Menú lateral.
- Contenedor principal.
- Encabezado.

## Reglas de integración con la API

- Usar `/api` como URL base desde Angular.
- No escribir la dirección IP del backend directamente en los servicios.
- En desarrollo, `/api` debe redirigirse mediante `proxy.conf.json`.
- En producción, `/api` debe redirigirse mediante Nginx.
- Todas las llamadas HTTP deben realizarse mediante servicios Angular.
- Los componentes no deben usar `HttpClient` directamente.
- Las rutas protegidas deben enviar `Authorization: Bearer <token>`.
- El interceptor debe agregar automáticamente el JWT.
- No agregar el JWT a `/auth/login` ni `/auth/register`.

## Autenticación

El endpoint de login es:

POST /auth/login

El cuerpo debe enviarse como:

application/x-www-form-urlencoded

Campos:

- username
- password

La respuesta contiene:

- access_token
- token_type

Para esta demostración, guardar el token en `localStorage`.

La ruta `/auth/me` debe utilizarse para recuperar los datos del usuario
autenticado.

## Pacientes

Implementar las operaciones definidas en OpenAPI:

- POST `/patients`
- GET `/patients`
- GET `/patients/{patient_id}`
- PUT `/patients/{patient_id}`
- DELETE `/patients/{patient_id}`

El listado acepta:

- q
- skip
- limit

Aunque el backend usa PUT, la actualización es parcial. Solo deben enviarse
los campos modificados.

## Citas

Implementar las operaciones definidas en OpenAPI:

- POST `/appointments`
- GET `/appointments`
- GET `/appointments/{appointment_id}`
- PUT `/appointments/{appointment_id}`
- DELETE `/appointments/{appointment_id}`
- PATCH `/appointments/{appointment_id}/status`

Estados válidos:

- scheduled
- completed
- cancelled

El listado acepta filtros por:

- patient_id
- dentist_name
- status
- date_from
- date_to
- skip
- limit

Las fechas deben enviarse en formato ISO 8601.

## Formularios

- Usar formularios reactivos.
- Mostrar mensajes de validación debajo de cada campo.
- No enviar formularios inválidos.
- Deshabilitar el botón mientras se procesa la solicitud.
- Mostrar errores comprensibles para el usuario.
- Evitar formularios excesivamente complejos.

## TypeScript

- No utilizar `any`.
- Crear interfaces para todas las solicitudes y respuestas.
- Usar tipos unión para roles y estados.
- Mantener habilitado el modo estricto.
- Usar nombres en inglés para código, clases, variables y archivos.
- Usar textos en español en la interfaz de usuario.

## Componentes

- Mantener los componentes pequeños.
- Evitar lógica HTTP dentro de componentes.
- Evitar componentes genéricos prematuros.
- Preferir componentes standalone.
- Utilizar `ChangeDetectionStrategy.OnPush` cuando sea conveniente.
- No agregar una biblioteca de estado global para este MVP.

## Diseño

Crear una interfaz administrativa sencilla, limpia y adaptable.

Debe incluir:

- Pantalla de login.
- Menú lateral.
- Cabecera.
- Tablas para pacientes y citas.
- Formularios dentro de páginas o diálogos simples.
- Indicadores de carga.
- Mensajes de éxito y error.
- Confirmación antes de eliminar.

No sobrecargar la interfaz con gráficos o animaciones innecesarias.

## Manejo de errores

Considerar al menos:

- 401: cerrar sesión o redirigir al login.
- 403: mostrar acceso denegado.
- 404: mostrar recurso no encontrado.
- 409: mostrar conflicto, especialmente por citas solapadas.
- 422: mostrar errores de validación.
- 500: mostrar error interno del servidor.

No mostrar al usuario trazas técnicas completas.

## Seguridad

- No guardar contraseñas.
- No imprimir tokens en consola.
- No subir secretos al repositorio.
- No colocar credenciales reales en el código.
- No desactivar validaciones del backend.
- No considerar los guards de Angular como seguridad del servidor.

## Docker

Usar una compilación de dos etapas:

1. Node para compilar Angular.
2. Nginx para servir los archivos estáticos.

Nginx debe:

- Servir la aplicación Angular.
- Redirigir rutas desconocidas a `index.html`.
- Enviar `/api/` al contenedor del backend.

## Forma de trabajo de Codex

Antes de modificar código:

1. Revisar `AGENTS.md`.
2. Revisar `docs/openapi.json` cuando el cambio involucre la API.
3. Revisar la estructura existente.
4. No reemplazar decisiones arquitectónicas sin justificación.

Después de modificar código:

1. Ejecutar el formateo disponible.
2. Ejecutar `npm run build`.
3. Corregir errores de TypeScript.
4. Informar qué archivos fueron modificados.
5. No afirmar que algo funciona si no se ejecutó o verificó.

## Restricciones

- No cambiar el backend.
- No inventar endpoints.
- No instalar dependencias sin necesidad.
- No migrar el proyecto a SSR.
- No eliminar Zone.js.
- No usar NgModules salvo que una dependencia lo requiera.
- No introducir NgRx para este proyecto sencillo.
