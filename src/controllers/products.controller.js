//Errores custom
const CustomError = require('../utils/errors/customError.js')
const { generateProductErrorInfo } = require('../utils/errors/messageCreater.js')
const EErrors = require('../utils/errors/ErrorEnums.js')
//Administrador de productos
const ProductsService = require('../service/products.service.js')
const productsService = new ProductsService()

//Obtener todos los productos con paginación, filtro y ordenamiento para la store
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

const getById = async (req,res, next) =>{
    try{
        const {id} = req.params
        const productFound = await productsService.findById(id)
        return res.status(200).json({success: true, data: productFound})
         
    }catch(error){
        next(error);
    }
}

//Obtener productos para el panel de administración (Solo Admin y Premium)
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

const update = async (req,res, next)=>{
    try{
        const productUpdated = await productsService.update(req.params.id, req.body)
        
        return res.status(200).json({success: true, message: "Producto actualizado correctamente", data: productUpdated})
           
    }
    catch(error){
       next(error);
    }
 }

const deleteProduct = async (req,res, next) => {
    try{
        const user = req.session
        const productDelete = await productsService.delProduct(req.params.id, user)
        return res.status(200).json({success: true, message: "Producto borrado correctamente", data: productDelete});
        
    }
    catch(error){
        next(error);
    }
}


module.exports = {
    getProducts,
    getById,
    getManageableProducts,
    create,
    update,
    deleteProduct
}