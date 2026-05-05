# Repositorio de Store API – Gestión de Productos y Carritos

Este proyecto parte del desarrollo de un proyecto anterior:  
https://github.com/matiasabarca49/Back-end_API-Products  

Es un sistema web para la gestión de un marketplace online. Incluye registro y autenticación de usuarios, administración de productos y ventas, creación de tiendas para vendedores premium y historial de compras con comentarios y calificaciones.  

La aplicación utiliza PostgreSQL como base de datos y está desarrollada con renderizado del lado del servidor (SSR). Para el front-end se emplea Handlebars, ofreciendo vistas dinámicas como:

- Administración de productos por vendedor
- Tienda online con carrito de compras
- Login y registro de usuarios
- Creación y administración de tiendas
- Panel de administración de productos y usuarios

## Tecnologías y conceptos utilizados  

- **Node.js** y **Express.js**  
- **PostgreSQL** y **pg**  
- **Handlebars** para SSR   
- **Autenticación** con `passport-local` y `passport-github`  
- **Patrón de arquitectura MVC**  
- **Loggers personalizados**  
- **Documentación con Swagger**   


## Estilos

- **Bootstrap**
- **CSS personalizado**

> ⚠️ **Importante:** El servidor no podrá iniciarse sin las variables de entorno requeridas. Asegúrese de definirlas correctamente en un archivo `.env`.

## Instalación y puesta en marcha
###### Requisitos para la instalación:

- **Node.js** Entorno de ejecucion.
- **NPM** Para instalar las librerías necesarias
- **Terminal Linux/cmd Windows** Para su instalación

Node.js se puede descargar de su página oficial -> https://nodejs.org/en
El paquete de instalación de Node.js tambien instala la herramienta **npm**

En linux se puede instalar mediante la ejecución del comando:

```
sudo apt install nodejs
```

Para descargar la ultima version de npm, en una terminal podemos ejecutar:

```
npm install -g npm
npm install -g npm@latest
```
NOTA: Es posible que se requiera permisos de administrador para ejecutar los comandos anteriores

## Descarga o clonación del repositorio

Se puede descargar desde el propio Github en el apartado -> code-> Donwload ZIP o mediante el comando de clonación en una terminal:

```
https://github.com/matiasabarca49/api-products-postgreSQL.git
```

## Instalación

Para instalar las librerias necesarias, ingresamos al directorio una vez realizada la descompresión del ZIP y ejecutamos el siguiente comando:
```
npm install
```
Es necesario tener instalado nodemon para poder ejecutar la aplicación. Esta herramienta nos permite reiniciar la aplicacion cada vez que se guardan los cambios. Para instalar:

```
npm install nodemon
```
Debemos crear la db en postgreSQL. El nombre de la DB debe coincidir con el nombre colocado en la variable de entorno.  

Una vez creada, creamos las tablas:

```
psql -U <PG_USER> -d <PG_DATABASE> -f ./src/model/pg/schemas.sql
```

Ya instaladas todas las libreriasa necesarias, como tambien la DB, ejecutamos la aplicacion con el siguiente comando:

```
npm start
```

Con "npm start" el servidor iniciará en modo desarrollo y el puerto utilizado será el "8080". Las opciones que pude establecer son:

- **--mode** --mode production o --mode development
- **-p** numero de puerto. Por defecto "8080"  
Ej: 

=> nodemon ./src/server.js -p 9090  
=> node ./src/server.js -p 9090  
=> node ./src/server.js -p 9090 --mode development

NOTA: Es necesario crear un archivo ".env" con variables de entornos obligatorias

## Variables de Entorno

### Obligatorias

- **SECRET_SESSIONS** Secreto para almacenar sesiones en la DB
- **PG_HOST** Host de postgreSQL.
- **PG_PORT** Puerto de postgreSQL.
- **PG_DATABASE** Nombre de la db.  

Credenciales de acceso a la DB:  

- **PG_USER** 
- **PG_PASSWORD** 

### Opcionales

- **PORT** Cambiar el puerto del servidor.  
- **GMAIL_CREDENTIAL_USER** Usuario que permite enviar emails  
- **GMAIL_CREDENTIAL_TOKEN** Token para enviar emails  
- **GITHUB_CLIENT_ID** ID Github Autenticación Terceros  
- **GITHUB_CLIENT_SECRET** Secreto Github

## Acceso

El acceso se realiza mediante el navegador. 

 - En local a través de la dirección -> http://localhost:8080
 - En dispositivos de la red -> http://IP_Server:8080

La API ofrece un mocks de productos en => http://IP_Server:8080/mockingproducts  

La documentacion se encuentran en => http://IP_Server:8080/apidocs