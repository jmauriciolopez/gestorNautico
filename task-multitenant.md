# Roadmap: Estrategia y Tareas para Multi-Tenant (SaaS)

Este documento detalla el análisis técnico para transformar el Gestor Náutico en una plataforma SaaS Multi-Tenant, incluyendo el modelo híbrido solicitado.

## 🏗️ 1. Modelos de Aislamiento Propuestos

### A. Esquema Compartido (Shared Database)
- **Para**: Clubes pequeños/medianos.
- **Implementación**: Columna `tenant_id` en todas las tablas.
- **Ventaja**: Bajos costos de mantenimiento e infraestructura.

### B. Esquema Aislado (Database-per-Tenant)
- **Para**: Grandes clubes con alto volumen de transacciones o requisitos de seguridad/legalidad específicos.
- **Implementación**: Cada club tiene su propia base de datos física o instancia.
- **Ventaja**: Mayor seguridad, facilidad de backups por club y escalabilidad vertical independiente.

---

## 🚀 2. Arquitectura Híbrida (El "Catalog Pattern")

Para soportar ambos modelos simultáneamente, la arquitectura debe evolucionar hacia una **Enrutamiento Dinámico de Conexiones**.

### Componentes Clave:
1.  **Base de Datos Maestra (Master/Catalog DB)**:
    - Una base de datos pequeña que SOLO contiene la tabla `Tenants`.
    - Atributos: `id`, `nombre`, `slug`, `storage_type` (SHAERD/ISOLATED), `connection_string` (null si es shared).
2.  **Connection Manager en el Backend**:
    - Un servicio que, en cada request, consulta el caché (Redis) para saber a qué base de datos apuntar.
    - Si es `SHARED`, usa el pool de conexiones común e inyecta el `tenant_id`.
    - Si es `ISOLATED`, crea o recupera una conexión específica para ese club.

---

## 📊 3. Tareas Técnicas (Esquema Híbrido)

### Tareas de Infraestructura:
- [ ] **Catalog Database**: Implementar la tabla de tenants y configuración de conectividad.
- [ ] **Interceptor de Conexión**: Crear un middleware de NestJS que resuelva el `DataSource` correcto dinámicamente.
- [ ] **Secret Management**: Almacenar de forma segura (Vault/AWS Secrets) las credenciales de las bases de datos de clientes aislados.

### Tareas de Migración:
- [ ] **Herramienta de Extracción**: Crear un script que pueda "extraer" todos los datos de un `tenant_id` de la DB compartida y los inserte en una DB nueva para transformarlo en `ISOLATED`.
- [ ] **Versionamiento Sincronizado**: Asegurar que todas las bases de datos (común y aisladas) se mantengan en la misma versión de esquema mediante migraciones automatizadas.

---

## ⚡ 4. Cuellos de Botella y Performance

### Identificados en Híbrido:
- **Latencia de Conexión**: La creación de conexiones "al vuelo" es costosa. Se necesita un pool persistente por cada base de datos aislada, lo que consume memoria RAM en el servidor de backend.
- **Escala del Pool**: El número máximo de conexiones abiertas en el servidor de Postgres debe ajustarse cuidadosamente.
- **Mantenimiento**: Correr una migración de esquema en 100 bases de datos aisladas es más lento que en una sola compartida.

---

## 🔐 5. Seguridad y Gobernanza

- **Aislamiento de Recursos**: Un club grande aislado no afectará el performance de los clubes compartidos si hay un pico de tráfico (Noisy Neighbor Effect).
- **Backups**: Capacidad de ofrecer al club "VIP" su propio backup diario descargable.

---

## 🛠️ 6. Resumen de Implementación
1.  **Inicio**: Comenzar con Esquema Compartido (`tenant_id`).
2.  **Escalado**: Al llegar a N registros, implementar el `ConnectionManager`.
3.  **Híbrido**: Mover los clubes de alta carga a sus propias instancias.

---

> [!TIP]
> **Estrategia Comercial**: El modelo aislado suele venderse como un "Add-on" premium o nivel "Enterprise", justificando los costos extra de infraestructura.
