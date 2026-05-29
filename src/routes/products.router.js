const express = require('express')
//controllers
const {getProducts, getByIdSeller, create, update, deleteProduct, getManageableProducts, updateProductFromSeller, addCommentToProduct, deleteProductFromSeller} = require('../controllers/products.controller.js')
//middleware
const {checkPermAdminAndPremium, checkPermAdmin, authorizeRoles } = require('../middlewares/permissions.middleware.js')
const { validateProduct, validateId, validateUpdateProduct, validateComment } = require('../validations/product.validations.js')
const { checkLogin, auth } = require('../middlewares/sessions.middleware.js')

//Desestructuramos el objeto para obtener el constructor de Rutas
const { Router } = express
//Creamos una nueva instancia de Router
const router = new Router()


/**
* RUTAS PUBLICAS
**/

/**
 * @route GET /api/products
 * @description Obtener todos los productos con paginación, filtro y ordenamiento para la store. NO retornar productos con status false (inactivos).
 * @access Public
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=10] - Cantidad de registros por página
 * @query {string} [sort=1] - Campo por el cual ordenar (sort=1 para ascendente por precio, sort=-1 para descendente por precio)
 * @query {string} [title] - Filtro de búsqueda parcial por título
 * @query {string} [category] - Filtro por categoría
 * @query {number} [priceMin] - Filtro de precio mínimo
 * @query {number} [priceMax] - Filtro de precio máximo
 */
router.get("/", getProducts)

/**
 * @route GET /api/products/:product_id/:seller_id 
 * @description Obtener un producto por ID de seller_product. La relacion entre productos y users 
 * es a través de seller_products.
 * @access Public
 * @params {string} id - ID del producto a obtener
 */
router.get("/:product_id/:seller_id",getByIdSeller)

/**
 * RUTAS CON AUTENTICACION Y AUTORIZACION
 */

/**
 * @route GET /api/products/admin
 * @description Obtener todos los productos para el panel de administración. Retornar todos los productos sin importar su status, pero solo los productos del usuario si es Premium. Admin puede ver todos los productos.
 * @access Private(Admin y Premium)
 * @query {string} [title] - Filtro de búsqueda parcial por título
 * @query {string} [category] - Filtro por categoría
 * @query {number} [priceMin] - Filtro de precio mínimo
 * @query {number} [priceMax] - Filtro de precio máximo
 * @query {number} [limit=10] - Cantidad de registros por página
 * @query {number} [page=1] - Número de página
 * @query {string} [sort=1] - Campo por el cual ordenar (sort=1 para ascendente por precio, sort=-1 para descendente por precio)
 * @middleware auth para verificar autenticacion del usuario
 * @middleware authorizeRoles (autorizacion) verificar que el usuario tenga rol Admin o Premium antes de permitir el acceso a esta ruta. Premium solo puede ver sus productos, Admin puede ver todos los productos.
 */
router.get("/admin", auth, authorizeRoles("admin", "premium"), getManageableProducts)



/**
* POST
**/

/**
 * @route POST /api/products
 * @description Crear un nuevo producto. Solo usuarios con rol Premium o Admin pueden crear productos.
 * @access Private (Premium y Admin)
 * @body {string} title - Título del producto (requerido)
 * @body {string} description - Descripción del producto
 * @body {string} code - Código del producto (requerido)
 * @body {number} stock - Cantidad en stock (requerido)
 * @body {number} price - Precio del producto
 * @body {string} category - Categoría del producto
 * @body {string} thumbnail - URL de la imagen del producto
 * @body {boolean} status - Estado del producto (activo/inactivo)
 * @middleware auth autenticacion.
 * @middleware authRoles (Autorizacion) verificar que el usuario tenga rol Admin o Premium antes de permitir el acceso a esta ruta. Solo estos roles pueden crear productos.
 * @middleware validateProduct validar los datos del producto.
 */
router.post("/", auth, authorizeRoles("admin", "premium") ,validateProduct, create)

/**
 * @route POST /api/products/comment
 * @description Agregar comentario a un producto
 * @access Private (Auth)
 * @middleware auth autenticacion.
 * @middleware  validateComment validación.
 */
router.post("/comment", auth, validateComment, addCommentToProduct)

/**
* PUT
*/

/**
 * @route PUT /api/products/:id
 * @description Actualizar un producto por su ID. Solo el Admin pueden actualizar productos.
 * @access Private (Admin)
 * @params {string} id - ID del producto a actualizar
 * @middleware auth (autenticación)
 * @middleware authorizeRoles para verificar que el usuario tenga rol Admin o Premium antes de permitir el acceso a esta ruta. Solo estos roles pueden actualizar productos.
 * @middleware validateUpdateProduct validar los datos del producto antes de actualizar el producto.
 */
router.put("/:id", auth, authorizeRoles("admin"), validateUpdateProduct, update);

/**
 * @route PUT /api/products/:product_id/seller/:seller_id
 * @description Actualizar el status, stock y precio del producto
 * @access Private (Premium y Admin)
 * @params {string} product_id - ID del producto a actualizar
 * @params {string} seller_id -  ID del vendedor que vende el producto
 * @middleware checkPermAdminAndPremium
 */
router.put("/:product_id/seller/:seller_id", auth, authorizeRoles("admin", "premium"), updateProductFromSeller);

/**
* DELETE
*/
/** 
 * @route DELETE /api/products/:id
 * @description Eliminar un producto de Vendedor. Solo usuarios con rol Premium o Admin pueden eliminar productos. Premium solo puede eliminar sus productos, Admin puede eliminar cualquier producto.
 * @access Private (Premium y Admin)
 * @params {string} id - ID del producto a eliminar
 * @middleware checkPermAdminAndPremium para verificar que el usuario tenga rol Admin o Premium antes de permitir el acceso a esta ruta. Solo estos roles pueden eliminar productos.
 * @middleware validateId para validar el ID del producto antes de eliminarlo.
 */
router.delete("/:id", auth, authorizeRoles("admin", "premium"), deleteProductFromSeller);


module.exports = router