# Arquitectura del Sistema

## Visión general

La aplicación sigue una arquitectura multicapa basada en una variante extendida del patrón MVC, separando responsabilidades entre:

* capa HTTP,
* validación,
* transferencia de datos,
* lógica de negocio,
* acceso a datos,
* y procesamiento asíncrono.

El objetivo principal es reducir acoplamiento y mejorar:

* mantenibilidad,
* escalabilidad,
* reutilización,
* y claridad del sistema.

El mismo esta destinado a que se pueda levantar a tráves de docker facilmente.

---

# Arquitectura general

```
HTTP Request
    ↓
Routes
    ↓
Middlewares
    ↓
Validations
    ↓
DTOs de entrada
    ↓
Controllers
    ↓
Services
    ↓
Repositories
    ↓
PostgreSQL / Redis
```

Procesos asíncronos:

```
Service
   ↓
Queue
   ↓
Worker
   ↓
Tarea en segundo plano
```

---

# Capas principales

## Routes

Responsables de definir los endpoints del sistema y conectar las requests con sus respectivos controladores.

Responsabilidades:

* definición de rutas,
* agrupación de endpoints,
* aplicación de middlewares.

---

## Middlewares

Implementan lógica transversal reutilizable dentro del flujo HTTP.

Ejemplos:

* autenticación,
* autorización,
* manejo de errores,
* logging,
* validaciones previas.

---

## Validations

Responsables de validar reglas básicas de entrada antes de que los datos ingresen a la lógica principal.

Ejemplos:

* campos requeridos,
* formatos válidos,
* restricciones iniciales.

---

## DTOs

Los DTOs (Data Transfer Objects) se utilizan para validar, normalizar y transformar los datos intercambiados entre capas.

### Objetivos

* evitar exponer directamente `req.body`,
* desacoplar estructuras internas,
* filtrar atributos no permitidos,
* normalizar tipos,
* controlar datos de salida.

### Tipos de DTO utilizados

#### DTOs de entrada

Utilizados en el flujo:

```
request → controller
```

Responsabilidades:

* validación estructural,
* normalización,
* sanitización,
* filtrado de atributos.

---

#### DTOs de servicio

Utilizados entre:

```
controller → service
service → repository
```

Permiten desacoplar contratos internos entre capas.

---

#### DTOs de salida

Utilizados para controlar la información retornada al cliente:

```
service → controller → response
```

Evitan exponer:

* datos sensibles,
* atributos internos,
* información innecesaria.

---

## Controllers

Responsables del manejo HTTP.

Responsabilidades:

* recibir requests,
* utilizar DTOs,
* invocar servicios,
* devolver responses.

Los controladores no contienen lógica de negocio compleja.

---

## Services

Implementan la lógica de negocio principal del sistema.

Responsabilidades:

* coordinación de operaciones,
* reglas de negocio,
* validaciones complejas,
* interacción entre múltiples entidades,
* integración con colas y workers.

---

## Repositories

Encapsulan el acceso a datos y desacoplan la lógica de persistencia del resto del sistema.

Responsabilidades:

* consultas SQL,
* acceso a PostgreSQL,
* persistencia,
* mapeo de resultados.

---

# Persistencia

## PostgreSQL

El sistema utiliza PostgreSQL como base de datos principal.

Características implementadas:

* relaciones normalizadas,
* foreign keys,
* constraints,
* índices,
* triggers automáticos,
* integridad relacional.

---

## Redis

Redis se utiliza para:

* persistencia de sesiones

---

# Procesamiento asíncrono

La aplicación utiliza colas y workers para desacoplar tareas pesadas del flujo HTTP principal.

## Objetivos

* mejorar rendimiento,
* evitar bloquear requests,
* procesar tareas en background.

## Casos de uso

* envío de emails

---

# Estructura del proyecto

```
src/
├── config/
├── controllers/
├── docs/
├── dto/
├── exceptions/
├── middlewares/
├── model/
├── public/
├── queue/
├── repositories/
├── routes/
├── services/
├── validations/
├── views/
├── workers/
├── app.js
└── server.js
```

---

# Objetivos arquitectónicos

La arquitectura busca:

* reducir acoplamiento,
* mejorar mantenibilidad,
* facilitar escalabilidad,
* permitir evolución modular,
* y simplificar futuras migraciones tecnológicas.
