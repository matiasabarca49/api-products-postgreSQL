# Store API – Marketplace Multi-Vendedor

Backend de un marketplace online desarrollado con Node.js, Express y PostgreSQL.

El sistema permite gestionar:

* autenticación y autorización de usuarios,
* tiendas de vendedores premium,
* catálogo global de productos,
* inventario independiente por vendedor,
* carrito de compras,
* historial de compras,
* comentarios y calificaciones,
* y procesamiento de ventas.

La aplicación utiliza renderizado del lado del servidor (SSR) mediante Handlebars y sigue una arquitectura multicapa basada en una variante extendida del patrón MVC.

---

# Características principales

## Marketplace multi-vendedor

El sistema separa:

* catálogo global de productos (`products`)
* inventario/publicaciones por vendedor (`seller_products`)

Esto permite que múltiples vendedores publiquen el mismo producto con:

* diferente precio,
* stock,
* promociones,
* y disponibilidad.

---

## Categorías jerárquicas

Las categorías implementan una estructura jerárquica utilizando:

* `parent_id`
* `slug`
* `path`

Esto permite:

* navegación jerárquica,
* búsquedas eficientes,
* URLs amigables,
* y filtrado de productos por árbol de categorías.

---

## Persistencia de sesiones

Con el fin de que el sistema sea stateless las sesiones se almacenan utilizando Redis para mejorar:

* rendimiento,
* persistencia,
* y escalabilidad del sistema.

Sin embargo en el modelo se incluye un tabla sesiones por si se quiere persistir en postgreSQL

---

## Sistema de colas

El envío de correos electrónicos se procesa mediante colas de mensajes para desacoplar tareas pesadas del flujo principal de la aplicación.

---

## Snapshot de compras

Las compras almacenan información histórica de:

* productos,
* precios,
* cantidades,
* y totales

al momento de realizar la transacción, preservando integridad histórica incluso si el producto cambia posteriormente.

---

## Integridad relacional

La base de datos implementa:

* Foreign Keys
* CHECK constraints
* UNIQUE constraints
* índices
* triggers automáticos para `updated_at`

para garantizar consistencia e integridad de datos.

---

# Arquitectura

La aplicación utiliza una arquitectura multicapa basada en una extensión del patrón MVC.

## Capas principales

### Validations

Validación de datos de entrada.

### Controllers

Manejo de requests y responses HTTP.

### DTOs

Los DTOs se utilizan para validar, normalizar y transformar los datos antes de que ingresen a la lógica de negocio, así como también para controlar la información expuesta entre capas.

#### Tipos de DTO utilizados

#### DTOs de entrada

Utilizados en la capa HTTP (`request -> controller`) para:

* validar estructura de datos,
* normalizar tipos,
* filtrar atributos no permitidos,
* y evitar exponer directamente `req.body`.

#### DTOs de servicio

Utilizados para desacoplar la comunicación entre:

* `controller -> service`
* `service -> repository`

Esto permite mantener contratos de datos claros entre capas y reducir acoplamiento interno.

#### DTOs de salida

Utilizados para controlar la información retornada al cliente (`service -> controller -> response`), evitando exponer datos sensibles o innecesarios.


### Services

Implementación de lógica de negocio.

### Repositories

Acceso desacoplado a PostgreSQL.

Esta separación permite:

* reducir acoplamiento,
* mejorar mantenibilidad,
* facilitar testing,
* y escalar funcionalidades del sistema.

---

# Tecnologías utilizadas

## Backend

* Node.js
* Express.js
* PostgreSQL
* Redis

## Frontend SSR

* Handlebars
* Bootstrap
* CSS

## Autenticación

* passport-local
* passport-github

## Infraestructura y herramientas

* Swagger / OpenAPI
* Colas de mensajes
* Loggers personalizados

---

# Funcionalidades

* Registro y autenticación de usuarios
* Login local y con GitHub
* Gestión de productos
* Gestión de tiendas
* Carrito de compras
* Historial de compras
* Sistema de comentarios y calificaciones
* Panel administrativo
* Gestión de promociones
* Documentación Swagger

---

## Estructura del proyecto

```
src/
├── config/         # Configuración general del sistema
├── controllers/    # Manejo de requests y responses HTTP
├── docs/           # Documentación endpoints swagger
├── dto/            # Transferencia y normalización de datos
├── exceptions/     # Excepciones personalizadas
├── middlewares/    # Middlewares de Express
├── model/          # Definiciones relacionadas a persistencia
├── public/         # Recursos estáticos
├── queue/          # Gestión de colas y procesamiento asíncrono
├── repositories/   # Acceso a datos
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio
├── validations/    # Validaciones de entrada
├── views/          # Vistas SSR con Handlebars
├── workers/        # Procesamiento de tareas en segundo plano
├── app.js
└── server.js
```

---

# Variables de entorno

## Obligatorias

```
SECRET_SESSIONS=
PG_HOST=
PG_PORT=
PG_DATABASE=
PG_USER=
PG_PASSWORD=
```

## Opcionales

```
GMAIL_CREDENTIAL_USER=
GMAIL_CREDENTIAL_TOKEN=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

**NOTA:** Se desactivará el envio de emails e autenticación de teceros si no se declaran las variables

Para cambiar la URL de la API y el FRONT debe colocar las siguientes variables:  

```
API_URL=
URL_FRONTEND=
PORT=
```
**NOTA:** En caso de no asignar las variables. Se utilizará por defecto:

```
API_URL=http://localhost:8080
URL_FRONTEND=http://localhost:8080
PORT=8080
```
---

# Instalación

## Requisitos

* Node.js
* npm
* PostgreSQL
* Redis

## Clonar repositorio

```
git clone https://github.com/matiasabarca49/api-products-postgreSQL.git
```

## Instalar dependencias

```
npm install
```

## Crear base de datos

Ejecutar el script SQL:

```
psql -U <PG_USER> -d <PG_DATABASE> -f ./src/model/pg/schemas.sql
```

## Ejecutar aplicación

```
npm start
```

Modo desarrollo:

```
npm run dev
```

---

# Acceso

## Aplicación

```
http://localhost:8080
```

## Swagger

```
http://localhost:8080/apidocs
```

---

# Próximas mejoras

* Manejo de Direcciones y Promociones
* CI/CD
* Observabilidad y métricas
