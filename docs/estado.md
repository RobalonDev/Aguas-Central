# Estado del proyecto

Última actualización: 2026-10-20.

## Cómo interpretar este documento

Las comprobaciones indicadas fueron ejecutadas por Roberto y comunicadas
en la conversación. No representan una ejecución independiente del asistente.

El código y la configuración actuales del repositorio son la referencia
para conocer la implementación exacta.

## Verificado

### Proyecto

- Template de NestJS creado.
- Repositorio subido a GitHub.
- Comprobación de tipos superada.
- Compilación superada.
- Test inicial del controlador superado.
- ESLint sin errores ni avisos tras corregir el arranque.
- Comprobación de formato superada.

El test inicial comprueba el endpoint del template, no funcionalidades
de la aplicación.

### Configuración

- @nestjs/config y Zod instalados.
- Configuración de NODE_ENV y PORT incorporada.
- Arranque con puerto válido comprobado.
- Rechazo de puerto inválido comprobado.

### Entorno local

- Docker Desktop instalado en Mac con Apple Silicon.
- hello-world ejecutado correctamente.
- PostgreSQL levantado mediante Compose.
- Conexión desde pgAdmin conseguida.
- Contraseña del usuario administrador actualizada en PostgreSQL
  y coordinada con el .env.
- Persistencia comprobada: una fila sobrevivió a down y posterior up.

## Requisitos acordados

- Clientes previstos: web y móvil.
- Autenticación propia con objetivo de aprendizaje.
- Usuarios con pertenencia a varios hogares.
- Miembros sin cuenta.
- Roles ADMIN y MEMBER por hogar.
- Creador del hogar como administrador.
- Varios administradores permitidos; al menos uno debe permanecer.
- Invitaciones por email con aceptación y email verificado.

## Todavía no implementado

- Modelos y migraciones del dominio.
- Usuario de base de datos limitado para la aplicación.
- Conexión de Nest a PostgreSQL.
- Registro y autenticación.
- Sesiones y recuperación de acceso.
- Verificación del email.
- Hogares, miembros e invitaciones.
- Clientes web y móvil.
- CI y despliegue.

## Próximos pasos

1. Incorporar estos documentos al repositorio.
2. Crear el tablero de tareas de GitHub Projects.
3. Elegir persistencia y herramienta de migraciones.
4. Diseñar autenticación y sesiones para web y móvil.
5. Definir roles y permisos de PostgreSQL.
6. Implementar el primer incremento: registro de usuarios.

El orden podrá ajustarse según dependencias justificadas.

## Pendientes de mantenimiento

- Revisar el aviso de fin de soporte de ESLint 9.
- Identificar qué dependencia incorpora glob obsoleto.
- Acordar y registrar las versiones de Node y pnpm.
- Confirmar las reglas de exclusión del .env y seguimiento de .env.example.

No se deben guardar contraseñas, tokens ni contenidos del .env
en estos documentos.

## Método de trabajo

- Explicar decisiones, alternativas y costes.
- Implementar por incrementos pequeños.
- Definir criterios de aceptación antes de cerrar una tarea.
- Distinguir propuesto, implementado y verificado.
- Actualizar este estado al cerrar un incremento o cambiar de dirección.
- Consultar estos documentos al retomar el proyecto.
