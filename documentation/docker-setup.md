# Docker Deployment

## Visión general

El sistema puede ejecutarse completamente mediante Docker Compose utilizando una arquitectura distribuida compuesta por:

* múltiples instancias Node.js,
* balanceador de carga Nginx,
* Redis para manejo de sesiones,
* PostgreSQL con replicación master/slave.

La infraestructura fue diseñada con el objetivo de:

* desacoplar servicios,
* mejorar escalabilidad,
* soportar balanceo de carga,
* y facilitar despliegue local y futuro despliegue productivo.

---

# Arquitectura Docker

```
                    ┌─────────────────┐
                    │     NGINX       │
                    │ Load Balancer   │
                    └────────┬────────┘
                             │
               ┌─────────────┴─────────────┐
               │                           │
      ┌────────▼────────┐        ┌────────▼────────┐
      │   APP NODE 1    │        │   APP NODE 2    │
      └────────┬────────┘        └────────┬────────┘
               │                           │
               └─────────────┬─────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│      REDIS     │  │ POSTGRES MASTER │  │ POSTGRES SLAVE  │
└────────────────┘  └─────────────────┘  └─────────────────┘
```

---

# Servicios implementados

## Redis

Almacenamiento de sesiones

Características:

* guardar sesiones en un archivo en caso de caida. AOF
```
 redis-server --appendonly yes
```
* volumen persistente Docker.
```
 volumes:
      - redis_data:/data
```

---

## PostgreSQL Master

Base de datos principal encargada de:

* escrituras,
* persistencia principal,
* replicación hacia nodos secundarios.

Características:

* scripts de inicialización automáticos.

**NOTA:** Debe colocar el archivo de esquema de la db en la carpeta "init-scripts" para que se creen las tablas automáticamente.

---

## PostgreSQL Slaves

Réplicas de lectura conectadas al nodo master.

Objetivos:

* separación lectura/escritura,
* simulación de escalabilidad horizontal,
* arquitectura distribuida.

---

## Instancias Node.js

El sistema ejecuta múltiples instancias de la aplicación Node.js.

Características:

* misma imagen Docker,
* balanceadas mediante Nginx,
* conectadas a Redis y PostgreSQL.

Objetivos:

* escalabilidad horizontal,
* distribución de carga.

---

## Nginx Load Balancer

Actúa como balanceador de carga entre múltiples instancias Node.js.

Responsabilidades:

* recepción de tráfico HTTP,
* distribución de requests,
* abstracción de instancias backend.

---

# Redes Docker

La infraestructura utiliza redes separadas para desacoplar responsabilidades.

## network_frontend

Utilizada para:

* comunicación entre Nginx y aplicaciones Node.js.

---

## network_backend

Utilizada para:

* comunicación interna entre:

  * Node.js,
  * PostgreSQL,
  * Redis.

---

# Volúmenes persistentes

## Redis

```
redis_data
```

Persistencia de datos Redis.

---

## PostgreSQL

```
postgres_master_data
```

Persistencia de base de datos principal.

---

# Variables de entorno

El sistema utiliza un archivo:

```
.env.production
```

Variables principales:

```
NODE_ENV=production
SECRET_SESSIONS=<SECRETO_SESION>
PG_DATABASE=<NOMBRE_DB>
PG_PORT=<PUERTO>
PG_HOST=<HOST_DE_POSTGRE>
PG_USER=<NOMBRE_USUARIO_POSTGRE>
PG_PASSWORD=<PASSWORD>

DB_REPL_USER=<USUARIO_REPLICADOR>
DB_REPL_PASSWORD=<CLAVE_USUARIO_REPLICADOR>

REDIS_HOST=<HOST_REDIS>
PORT=<PUERTO_REDIS>
```

---

# Ejecución del sistema

## Construcción y despliegue

Desde la carpeta `docker/`:

```
docker compose up --build
```

---

## Ejecución en segundo plano

```
docker compose up -d --build
```

---

## Detener servicios

```
docker compose down
```

---

# Acceso al sistema

El balanceador Nginx expone la aplicación en:

```
http://localhost:8080
```

---

# Objetivos arquitectónicos

La infraestructura Docker busca:

* desacoplar servicios,
* facilitar despliegue,
* soportar múltiples instancias backend,
* implementar persistencia aislada,
* y simular una arquitectura distribuida real.

---

# Tecnologías utilizadas

* Docker
* Docker Compose
* Node.js
* Nginx
* Redis
* PostgreSQL
