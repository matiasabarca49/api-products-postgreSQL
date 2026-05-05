//Errores custom
const CustomError = require('../utils/errors/customError.js')
const { generateProductErrorInfo } = require('../utils/errors/messageCreater.js')
const EErrors = require('../utils/errors/ErrorEnums.js')
//Administrador de productos
const ProductsService = require('../service/products.service.js')
const productsService = new ProductsService()

/**
 * Obtener productos para la tienda con paginación, filtro y ordenamiento. NO retornar productos con status false (inactivos).
 * Paginacion:
 * @param {number} [limit=10] 
 * @param {number} [page=1]
 * @param {number} [sort=1] 
 * Filtros:
 * @param {string} [title] - Filtro de búsqueda parcial por título
 * @param {string} [category] - Filtro por categoría
 * @param {number} [priceMin] - Filtro de precio mínimo
 * @param {number} [priceMax] - Filtro de precio máximo
 */
const getProducts = async (req,res, next) =>{
    try{
        const { limit = 10, page = 1, sort = 1 } = req.query;

        //Filtros
        const { title, category, priceMin, priceMax } = req.query
        const filters = {};
        if (title) filters.title = title;
        if (category) filters.category = category;
        if (priceMin) filters.priceMin = parseInt(priceMin);
        if (priceMax) filters.priceMax = parseInt(priceMax);

        const products = await productsService.findAll(filters, parseInt(limit), parseInt(page) , parseInt(sort));

        return res.status(200).json({
                success: true,
                data: {
                    payload: products.payload,
                    totalPages: products.totalPages,
                    totalDocs: products.totalDocs,
                    prevPage: products.prevPage,
                    page: products.page,
                    nextPage: products.nextPage,
                    hasPrevPage: products.hasPrevPage,
                    hasNextPage: products.hasNextPage,
                    prevLink:products.hasPrevPage?`http://localhost:8080/api/products?page=${products.prevPage} ` : null,
                    nextLink:products.hasNextPage?`http://localhost:8080/api/products?page=${products.nextPage} `: null
                }
                })
    }
    catch(error){
        next(error);
    }
}

/**
 * Obtener un producto por su ID
 * @param {string} id - ID del producto a obtener
 */
const getByIdSeller = async (req,res, next) =>{
    try{
        const {product_id, seller_id} = req.params;
        const productFound = await productsService.findByIdSeller(product_id, seller_id);
        return res.status(200).json({success: true, data: productFound})
         
    }catch(error){
        next(error);
    }
}

/**
 * Obtener productos para el panel de administración. Retornar todos los productos sin importar su status, pero solo los productos del usuario si es Premium. Admin puede ver todos los productos.
 * Paginacion:
 * @param {number} [limit=10] - Cantidad de registros por página
 * @param {number} [page=1] - Número de página
 * @param {string} [sort=1] - Campo por el cual ordenar (sort=1 para ascendente por precio, sort=-1 para descendente por precio)
 * Filtros:
 * @param {string} [title] - Filtro de búsqueda parcial por título
 * @param {string} [category] - Filtro por categoría
 * @param {number} [priceMin] - Filtro de precio mínimo
 * @param {number} [priceMax] - Filtro de precio máximo
 */
const getManageableProducts = async(req, res, next) => {
    try{
        const { limit = 10, page = 1, sort = 1} = req.query;

        //Filtros
        const { title, category, priceMin, priceMax } = req.query;
        const filters = {};
        if (title) filters.title = title;
        if (category) filters.category = category;
        if (priceMin) filters.priceMin = parseInt(priceMin);
        if (priceMax) filters.priceMax = parseInt(priceMax);

        const productsFound = await productsService.findManageableProducts(req.session, filters, limit, page,sort);

        return res.status(200).json({
                success: true,
                data: {
                    payload: productsFound.payload,
                    totalPages: productsFound.totalPages,
                    totalDocs: productsFound.totalDocs,
                    prevPage: productsFound.prevPage,
                    page: productsFound.page,
                    nextPage: productsFound.nextPage,
                    hasPrevPage: productsFound.hasPrevPage,
                    hasNextPage: productsFound.hasNextPage,
                    prevLink:productsFound.hasPrevPage?`http://localhost:8080/api/products/admin?page=${productsFound.prevPage} ` : null,
                    nextLink:productsFound.hasNextPage?`http://localhost:8080/api/products/admin?page=${productsFound.nextPage} `: null
                }
                })
    }catch(error){
        next(error);
    }
}

/**
 * Crear un nuevo producto. Solo usuarios con rol Premium o Admin pueden crear productos.
 * @body {string} title - Título del producto (requerido)
 * @body {string} description - Descripción del producto
 * @body {string} code - Código del producto (requerido)
 * @body {number} stock - Cantidad en stock (requerido)
 * @body {number} price - Precio del producto
 * @body {string} category - Categoría del producto
 * @body {string} thumbnail - URL de la imagen del producto
 * @body {boolean} status - Estado del producto (activo/inactivo)
 * @body {string} owner - Usuario que creó el producto
 */
const create = async (req, res, next) =>{
    const {title, code, stock} = req.body
    try {
        if(!title || !code || !stock || stock < 1){
            const customError = new CustomError()
            customError.createError({
                name:"Product creation error",
                cause: generateProductErrorInfo(req.body),
                message: "Error to create Product",
                code: EErrors.CREATE_PRODUCT_ERROR

            })
        }
        //Si el body es correcto
        //Agregar el usuario que creó el producto
        if(req.session.rol === "Premium"){
            req.body.owner = req.session.email
        }
        else{
            req.body.owner = "Admin"
        }

        const productAdded = await productsService.create(req.body)
        
        return res.status(201).json({success: true, message: "Producto agregado a DB correctamente", data: productAdded})
            
    } catch (error) {
        next(error);
    }
    
}

/**
 * Agregar comentarios a productos
 * 
*/
const addCommentToProduct = async (req, res, next) => {
    try{

        const comment = req.body;

        const commentAdded = await productsService.addComment(req.session, comment);

        res.status(200).json({success: true, data: commentAdded});

    }catch(error){
        next(error);
    }
}

/**
 * Actualizar un producto por su ID. Solo usuarios con rol Premium o Admin pueden actualizar productos. Premium solo puede actualizar sus productos, Admin puede actualizar cualquier producto.
 * @params {string} id - ID del producto a actualizar
 */
const update = async (req,res, next)=>{
    try{
 
        const productUpdated = await productsService.update(req.params.id, req.body)
        
        return res.status(200).json({success: true, message: "Producto actualizado correctamente", data: productUpdated})
           
    }
    catch(error){
       next(error);
    }
}

/**
 * Aumentar stock
 */
const updateProductFromSeller = async (req, res, next) => {
    try{
        const {product_id, seller_id} = req.params;

        const dataToUpdate = {};

        if(req.body.stock) dataToUpdate.stock = req.body.stock;
        if(req.body.status) dataToUpdate.status = req.body.status;
        if(req.body.price) dataToUpdate.price = req.body.price;

        const product = await productsService.updateProductFromSeller(req.session, product_id, seller_id, dataToUpdate);
        return res.status(200).json({success: true, data: product});
    }catch(error){
        next(error)
    }
}

 /**
  * Eliminar un producto por su ID. Solo usuarios con rol Premium o Admin pueden eliminar productos. Premium solo puede eliminar sus productos, Admin puede eliminar cualquier producto.
  * @params {string} id - ID del producto a eliminar
  */
const deleteProduct = async (req,res, next) => {
    try{
        const user = req.session
        const productDelete = await productsService.deleteFromSeller(req.params.id, user)
        return res.status(200).json({success: true, message: "Producto borrado correctamente", data: productDelete});
        
    }
    catch(error){
        next(error);
    }
}


module.exports = {
    getProducts,
    getByIdSeller,
    getManageableProducts,
    create,
    addCommentToProduct,
    update,
    updateProductFromSeller,
    deleteProduct
}