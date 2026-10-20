# Decisiones técnicas

Última actualización: 2026-10-20.

Las decisiones aceptadas describen acuerdos del proyecto.
Las propuestas pendientes no deben interpretarse como implementadas.

## D01. NestJS y TypeScript

Estado: aceptada.

Utilizaremos NestJS y TypeScript para el backend.

Motivo:
Aprovechar la experiencia del desarrollador y la estructura modular,
inyección de dependencias y herramientas de NestJS.

## D02. Monolito modular

Estado: propuesta inicial, pendiente de ratificar al definir los módulos.

Comenzar con una aplicación organizada en módulos funcionales.

Motivo:
El alcance actual no presenta una necesidad identificada de separar
servicios y asumir comunicación y operación distribuidas.

Los límites concretos de los módulos todavía están pendientes.

## D03. Comprobaciones de TypeScript

Estado: aplicada por el desarrollador y comprobada mediante sus ejecuciones.

Se propuso activar:

- strict.
- noUncheckedIndexedAccess.
- noFallthroughCasesInSwitch.
- noImplicitOverride.

Motivo:
Detectar errores de tipos y accesos potencialmente inexistentes durante
el desarrollo.

Se mantienen los modos nodenext del template.

La configuración exacta vigente debe consultarse en tsconfig.json.

## D04. Configuración con @nestjs/config y Zod

Estado: aplicada y comprobada mediante pruebas manuales del desarrollador.

Se utiliza @nestjs/config 4 y Zod 4.

- ConfigModule carga la configuración.
- Una función validate utiliza Zod para comprobar y convertir valores.
- El tipo Environment se obtiene del esquema de Zod.
- Inicialmente se validan NODE_ENV y PORT.
- No se utilizan todavía factories mediante load.
- No se configura envFilePath porque se usa la ubicación predeterminada.

Motivo:
Validar al arrancar y mantener las reglas y los tipos relacionados.

Comprobado:
La aplicación arranca con un puerto válido y rechaza un puerto inválido.

## D05. PostgreSQL en Docker para desarrollo local

Estado: aplicada y verificada por el desarrollador.

- Imagen propuesta y utilizada en la configuración: postgres:18.
- PostgreSQL se ejecuta mediante Docker Compose.
- Nest se ejecuta directamente en el Mac.
- Un volumen nombrado conserva los datos.
- El puerto se publica en la interfaz local 127.0.0.1.
- Un healthcheck comprueba la disponibilidad.
- pgAdmin se utiliza como cliente gráfico.

Motivo:
Disponer de una base reproducible y aprender Docker sobre una necesidad real.

La etiqueta de versión mayor no fija una imagen exacta e inmutable.
No se ha definido todavía la política de actualizaciones.

## D06. Separar cuentas, hogares y miembros

Estado: aceptada; tablas aún no implementadas.

Conceptos previstos:

- User: cuenta con acceso.
- Household: hogar.
- HouseholdMember: persona dentro de un hogar, con cuenta opcional.

Motivo:
Permitir varios hogares por usuario y miembros sin acceso propio.

## D07. Autenticación propia

Estado: aceptada; pendiente de implementar.

Implementaremos el registro, credenciales, verificación del email,
sesiones y recuperación de acceso.

Motivo:
Aprender su diseño e implementación mientras construimos la aplicación.

Coste:
Asumimos el mantenimiento y las protecciones necesarias de estos flujos.

Todavía no se han elegido:

- Algoritmo y parámetros de hash de contraseñas.
- Sesiones opacas o JWT.
- Transporte y almacenamiento de credenciales por cliente.
- Política de expiración y revocación.
- Proveedor de correo.

Web y móvil deben tenerse en cuenta al decidir.

## D08. Separación de permisos de base de datos

Estado: acordada como dirección; pendiente de implementar.

El usuario inicial house_admin es administrador.
La aplicación no debe utilizar ese usuario como credencial habitual.

Se diseñarán permisos para administración, migraciones y ejecución
de la aplicación, junto con scripts reproducibles.

## D09. Persistencia y migraciones

Estado: pendiente.

Prisma se ha propuesto, pero no está elegido.

La elección deberá justificar:

- Integración con NestJS y TypeScript.
- Control y revisión del SQL.
- Migraciones reproducibles.
- Transacciones.
- Facilidad de pruebas y mantenimiento.
