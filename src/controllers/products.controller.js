//Errores custom
const CustomError = require('../utils/errors/customError.js')
const { generateProductErrorInfo } = require('../utils/errors/messageCreater.js')
const EErrors = require('../utils/errors/ErrorEnums.js')
//Administrador de productos
const ProductsService = require('../service/products.service.js')
const productsService = new ProductsService()

//Obtener todos los productos con paginación, filtro y ordenamiento para la store
const getProducts = async (req,res) =>{
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

        return res.status(200).send({
                status: "success",
                payload: products.docs,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                page: products.page,
                nextPage: products.nextPage,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink:products.hasPrevPage?`http://localhost:8080/api/products?page=${products.prevPage} ` : null,
                nextLink:products.hasNextPage?`http://localhost:8080/api/products?page=${products.nextPage} `: null,
                })
    }
    catch(error){
        console.log(error)
        res.status(500).json({success: false, status: "Error",error: "Error interno del servidor"});
    }
}

const getById = async (req,res) =>{
    try{
        const {id} = req.params
        const productFound = await productsService.findById(id)
        productFound
         ? res.status(200).send({status: "Success", producto: productFound})
         : res.status(404).send({status: "Error", reason: "El producto no encotrado"})
    }catch(error){
        console.log(error)
        res.status(500).json({success: false, status: "Error",error: "Error interno del servidor"});
    }
}

//Obtener productos para el panel de administración (Solo Admin y Premium)
const getManageableProducts = async(req, res) => {
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
        res.status(200).send({
                status: "success",
                payload: productsFound.docs,
                totalPages: productsFound.totalPages,
                prevPage: productsFound.prevPage,
                page: productsFound.page,
                nextPage: productsFound.nextPage,
                hasPrevPage: productsFound.hasPrevPage,
                hasNextPage: productsFound.hasNextPage,
                prevLink:productsFound.hasPrevPage?`http://localhost:8080/api/products/admin?page=${productsFound.prevPage} ` : null,
                nextLink:productsFound.hasNextPage?`http://localhost:8080/api/products/admin?page=${productsFound.nextPage} `: null,
                })
    }catch(error){
        console.log(error)
        res.status(500).json({success: false, status: "Error",error: "Error interno del servidor"});
    }
}

const create = async (req, res) =>{
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

        console.log(req.body);

        const productAdded = await productsService.create(req.body)
        productAdded
            ?res.status(201).send({status: "Success", action: "Producto agregado a DB correctamente", producto: productAdded})
            :res.status(400).send({status: "Error", action: 'Campos Faltantes, mal escritos o  campo code repetido'})
    } catch (error) {
        console.log(error)
        res.status(400).send({status: "Error", action: 'Campos Faltantes o inválidos'})
    }
    
}

const addManyProducts = async (req, res) =>{
    try{
        const prs = await productsService.createMany(req.body)
        productAdded
            ?res.status(201).send({status: "Success", action: "Producto agregado a DB correctamente", productos: prs})
            :res.status(400).send({status: "Error", action: 'Campos Faltantes, mal escritos o  campo code repetido'})
    }catch(error){
        console.log(error)
        res.status(400).send({status: "Error", action: 'Campos Faltantes o inválidos'})
    }
}

const update = async (req,res)=>{
    try{
        const productUpdated = await productsService.update(req.params.id, req.body)
        productUpdated
         ? res.status(200).send({status: "Success", action: "Producto actualizado correctamente", product: productUpdated})
         : res.status(400).send({status: "Error", reason: "Al producto le faltan campos o no existe "})   
    }
    catch(error){
        console.log(error)
        res.status(500).json({success: false, status: "Error",error: "Error interno del servidor"});
    }
 }

const deleteProduct = async (req,res) => {
    try{
        const user = req.session
        const productDelete = await productsService.delProduct(req.params.id, user)
        productDelete
         ?res.status(200).send({status: "Success", action: "Producto borrado correctamente", product: productDelete})
         :res.status(404).send({status: "Error", reason: "El producto no existe o no tienes permiso para borrarlo"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({success: false, status: "Error",error: "Error interno del servidor"});
    }
}


module.exports = {
    getProducts,
    getById,
    getManageableProducts,
    create,
    addManyProducts,
    update,
    deleteProduct
}