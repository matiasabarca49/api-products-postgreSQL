# Repositorio de Store API – Gestión de Productos y Carritos

Este proyecto es una API completa para la gestión de productos y carritos en un mercado online. Permite la obtención, visualización y administración de productos, así como la consulta de carritos almacenados en la base de datos.

La aplicación utiliza MongoDB como base de datos y está desarrollada con renderizado del lado del servidor (SSR). Para el Front-end se emplea Handlebars, ofreciendo vistas dinámicas como:

- Vista de productos desde la base de datos  
- Tienda online  
- Login y Registro de usuarios  
- Chat de mensajes en tiempo real

## Tecnologías y conceptos utilizados  

- **Node.js** y **Express.js**  
- **MongoDB** y **Mongoose**  
- **Handlebars** para SSR  
- **Paginación** con `mongoose-paginate`  
- **Autenticación** con `passport-local` y `passport-github`  
- **Patrón de arquitectura MVC**  
- **DAO (Data Access Object)**  
- **Loggers personalizados**  
- **Documentación con Swagger**  
- **Errores personalizados (Custom Errors)**  
- **Testing con TDD y BDD**  

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
git clone https://github.com/matiasabarca49/Back-end_API-Products.git
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

Una vez instalados todas las libreriasa necesarias, ejecutamos la aplicacion con el siguiente comando:

```
npm start
```

Con "npm start" el servidor iniciará en modo desarrollo y el puerto utilizado será el "8080". Las opciones que pude establecer son:

- **--mode** --mode production o --mode development
- **-p** numero de puerto. Por defecto "8080"  
Ej: 

=> nodemon ./src/app.js -p 9090  
=> node ./src/app.js -p 9090  
=> node ./src/app.js -p 9090 --mode development

NOTA: Es necesario crear un archivo ".env" con variables de entornos obligatorias

## Variables de Entorno

### Obligatorias

- **MONGO_URL** URL de la DB MongoDB.
- **SECRET_SESSIONS** Secreto para almacenar sesiones en la DB

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