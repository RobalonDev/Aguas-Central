# Alcance de la aplicación

Última actualización: 2026-10-20.

## Objetivo

Construir una aplicación para gestionar hogares y facilitar su organización.

El desarrollo tiene también un objetivo de aprendizaje: comprender y justificar
las decisiones técnicas, implementar las funcionalidades y comprobar su comportamiento.

Este proyecto es independiente del itinerario de estudio backend.

## Plataformas

- Backend con NestJS y TypeScript.
- Clientes previstos: aplicación web y aplicación móvil.
- El frontend se desarrollará posteriormente con ayuda de IA.
- Por ahora, el trabajo se centra en el backend.

## Primera versión prevista

- Registro de usuarios.
- Verificación del email.
- Inicio y cierre de sesión.
- Recuperación de contraseña.
- Creación de hogares.
- Gestión de miembros y permisos.
- Invitaciones por email.

La secuencia de implementación y los detalles se concretarán mediante tareas.

## Reglas de hogares acordadas

- Una cuenta puede pertenecer a varios hogares.
- Un hogar puede tener varios miembros.
- Pueden existir miembros sin cuenta de acceso.
- Quien crea un hogar se convierte automáticamente en administrador.
- Los roles iniciales son ADMIN y MEMBER.
- El rol pertenece a la membresía de un hogar, no al usuario global.
- Puede haber varios administradores.
- No se permite dejar un hogar sin administradores.
- Una cuenta no puede tener dos membresías en el mismo hogar.
- Los miembros sin cuenta no pueden administrar el hogar.
- Crear el hogar y su membresía administradora debe ser una operación atómica.

## Incorporación mediante invitación

- Un administrador invita a una persona por email.
- La persona debe aceptar la invitación.
- La cuenta que acepta debe tener ese email verificado.
- El email debe coincidir con el de la invitación.
- Una invitación no incorpora automáticamente al destinatario.

## Miembros sin cuenta: diseño pendiente

Debemos concretar:

- Quién puede crearlos, editarlos y eliminarlos.
- Qué información tendrán.
- Cómo se vincularán posteriormente a una cuenta.
- Cómo se conservará su historial durante esa vinculación.

## Ideas para versiones posteriores

No forman parte del alcance inicial comprometido:

- Gastos compartidos.
- Conexiones con bancos y posibles transferencias.
- Tareas del hogar.
- Inventario de armarios.
- Solicitudes de acceso mediante un código de hogar.
- Invitaciones temporales mediante enlaces o códigos.

Las integraciones bancarias requerirán un análisis específico antes de decidir
su viabilidad y alcance.

## Solicitudes mediante código: idea pendiente

Se ha propuesto que un usuario pueda identificar un hogar mediante un código
y solicitar acceso, sujeto a aprobación de un administrador.

No está aprobado el acceso directo mediante una contraseña compartida.
No se ha definido todavía este flujo ni la información visible al solicitante.
