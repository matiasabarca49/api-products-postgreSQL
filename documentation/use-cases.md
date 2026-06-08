# Casos de Uso

## Visión general

El sistema implementa un marketplace online con funcionalidades orientadas a:

* compradores,
* vendedores,
* administración de productos,
* procesamiento de compras,
* y gestión de ventas.

---

# Actores principales

## Usuario visitante

Usuario no autenticado que puede navegar el catálogo y visualizar productos.

---

## Usuario registrado

Usuario autenticado que puede:

* comprar productos,
* administrar carrito,
* comentar productos

---

## Usuario premium (vendedor)

Usuario con permisos para:

* crear tienda,
* publicar productos,
* administrar inventario,
* visualizar ventas.

---

## Administrador

Usuario con permisos administrativos sobre el sistema.

Usuario con permisos para:

* publicar productos,
* administrar inventario,
* visualizar ventas.

---

# Casos de uso principales

---

# Autenticación y usuarios

## Registro de usuario

### Actor

* Usuario visitante

### Flujo principal

1. El usuario completa el formulario de registro.
2. El sistema valida los datos.
3. Se crea la cuenta en la base de datos.
4. El usuario puede iniciar sesión.

---

## Inicio de sesión

### Actor

* Usuario registrado

### Flujo principal

1. El usuario ingresa credenciales.
2. El sistema autentica mediante Passport.
3. Se crea la sesión del usuario.
4. El usuario accede al sistema.

---

# Marketplace y catálogo

## Visualizar catálogo de productos

### Actor

* Usuario visitante
* Usuario registrado

### Flujo principal

1. El usuario navega categorías.
2. El sistema consulta productos.
3. Se muestran productos disponibles.

---

## Buscar productos por categoría

### Actor

* Usuario visitante
* Usuario registrado

### Flujo principal

1. El usuario selecciona una categoría.
2. El sistema obtiene los productos de esa categoría.
3. Se listan productos relacionados.

---

## Visualizar detalle de producto

### Actor

* Usuario visitante
* Usuario registrado

### Flujo principal

1. El usuario selecciona un producto.
2. El sistema obtiene información del catálogo.
3. Se muestran vendedores disponibles, stock y precios.

---

# Gestión de vendedores

## Crear tienda

### Actor

* Usuario registrado

### Flujo principal

1. El usuario registrado registra una tienda y se convierte en usuario premium.
2. El sistema valida permisos.
3. Se crea la tienda asociada al usuario.

---

## Publicar producto

### Actor

* Usuario premium

### Flujo principal

1. El vendedor selecciona un producto del catálogo o crea uno nuevo.
2. Define precio y stock.
3. El sistema crea un registro.

---

## Administrar inventario

### Actor

* Usuario premium

### Flujo principal

1. El vendedor accede a sus publicaciones.
2. Modifica stock o precio.
3. El sistema actualiza inventario.

---

# Compras y carrito

## Agregar producto al carrito

### Actor

* Usuario registrado

### Flujo principal

1. El usuario selecciona un producto publicado.
2. Indica cantidad.
3. El sistema agrega el producto al carrito.

---

## Visualizar carrito

### Actor

* Usuario registrado

### Flujo principal

1. El usuario accede al carrito.
2. El sistema obtiene productos agregados.
3. Se muestran cantidades y totales.

---

## Finalizar compra

### Actor

* Usuario registrado

### Flujo principal

1. El usuario confirma compra.
2. El sistema genera snapshot histórico.
3. Se crea ticket de compra.
4. Se registran ventas individuales.
5. Se actualiza stock.

---

# Historial y ventas

## Visualizar historial de compras

### Actor

* Usuario registrado

### Flujo principal

1. El usuario consulta historial.
2. El sistema obtiene compras realizadas.
3. Se carritos de productos comprados.

---

## Visualizar ventas realizadas

### Actor

* Usuario premium

### Flujo principal

1. El vendedor accede a sus ventas.
2. El sistema obtiene registros de ventas.
3. Se muestran estados y totales.

---

# Comentarios y calificaciones

## Comentar producto

### Actor

* Usuario registrado

### Flujo principal

1. El usuario selecciona un producto comprado.
2. Ingresa comentario y calificación.
3. El sistema almacena la review.

---

# Procesamiento asíncrono

## Envío de emails

### Actor

* Sistema

### Flujo principal

1. Se genera un evento relevante.
2. El sistema agrega una tarea a la cola.
3. Un worker procesa el envío.
4. El email es enviado en background.

---

# Objetivos funcionales del sistema

El sistema busca:

* soportar múltiples vendedores,
* mantener historial de compras,
* y facilitar escalabilidad futura.
