const { transporter } = require("../config/config.js");
const { generateFormatEmail } = require("../utils/utils.js");
const ProductDTO = require("../dto/product.dto.js");
const ProductsRepository = require("../repositories/implementations/productsRepository.js");

class ProductsService{
  constructor(){
    this.repository = new ProductsRepository();
  }

  //Para tienda
  async findAll(filters = {}, limit, page, sort) {
    // Si se recibe un filtro de categoría, convertirlo a category_id para la consulta
    if(filters.category){
      filters.category_id = await this.repository.findCategoryByName(filters.category);
      delete filters.category;
    }

    filters.status = true; // Solo mostrar productos activos

    const products = await this.repository.findAll(filters, limit, page, sort)

    if(products & products.docs.length > 0) {
      products.docs = this.toManyDTO(products.docs);
    }

    return products
  }

  async findById(id) {
    const product = await this.repository.findByID(id)
    if(!product) return null
    return this.toDTO(product)
  }

  //Para administración
  async findManageableProducts(user, filters = {}, limit, page, sort) {

    // Solo los productos del usuario si es Premium, Admin puede ver todos los productos
    if (user.rol === "Premium") {
      filters.owner = user.email;
    }

    // Si se recibe un filtro de categoría, convertirlo a category_id para la consulta
    if(filters.category){
      filters.category_id = await this.repository.findCategoryByName(filters.category);
      delete filters.category;
    }

    const documents = await this.repository.findAllAdmin(
      filters,
      limit,
      page
    );

    return documents;
  }

  async create(document){

        if(document.category){
          document.category_id = await this.repository.findCategoryByName(document.category);
          delete document.category;
        }
        //Formateamos el documento y lo creamos en la base de datos
        const documentCreated = await this.repository.create(this.toFormatDTO(document))

        //Si se produjo un error al crear el documento, lanzamos una excepción
        if (!documentCreated){ 
            throw new Error('Error al crear el documento')
        }
        //Retornamos el documento creado formateado a DTO
        return this.toDTO(documentCreated) 
  }

  async update(id, updatedDocument){

    if(!this.repository.existByID(id)){
      throw new Error("Producto no encontrado")
    }

    if(updatedDocument.category){
      updatedDocument.category_id = await this.repository.findCategoryByName(updatedDocument.category);
      delete updatedDocument.category;
    }
    
    return await this.repository.update(id, updatedDocument)
  }

  async delProduct(ID, user) {
    const productFound = await this.repository.findByID(ID);
    console.log("Producto encontrado: ", productFound);

    if (!productFound) {
      throw new Error("Producto no encontrado");
    }
    /* //Enviar mail al propietario del producto
    if (productFound.owner !== "Admin") {
      transporter.sendMail(
        generateFormatEmail(productFound.owner, {
          subject: "Producto Borrado",
          head: "El Producto fue borrado correctamente",
          body: `El producto "${productFound.title}" con código "${productFound.code}" fue borrado. Por el administrador ${user.user} ${user.lastName}. El producto pertenece al usuario con email ${productFound.owner}`,
        }),
        (error, info) => {
          if (error) {
            req.logger.error(`Peticion ${req.method} en "${
              "http://" + req.headers.host + "/api/mail" + req.url
            }" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
                    ERROR: Fallo al enviar el mail. EL error es:\n
                    ${error}`);
            res.status(500).send({ status: "ERROR", reason: error });
          } else {
            req.logger.info(
              `Mensaje enviado con éxito solicitado en el endpoint${
                "http://" + req.headers.host + "/api/mail" + req.url
              }"`
            );
          }
        }
      );
    } */
    //Eliminar el producto. "Admin" puede eliminar todos los productos, "El propietario solo puede eliminar sus productos"
    if (user.rol === "Premium") {
      if (user.email !== productFound.owner) {
        throw new Error("No tienes permisos para eliminar este producto");
      } else {
        return this.repository.delete(ID);
      }
    } else if (user.rol === "Admin") {
        return this.repository.delete(ID);
    } else {
        throw new Error("No tienes permisos para eliminar este producto");
    }
  }

  async verifyStock(product_id, quantity){
      console.log("product_id: ", product_id)
      console.log("quantity: ", quantity)
      return await this.repository.verifyStock(product_id, quantity);
  }

  /**
   *
   *Wrapper Pattern
   */

  toFormatDTO(productData) {
    return new ProductDTO(productData);
  }

  toDTO(product) {
    return ProductDTO.toResponse(product);
  }

  toManyDTO(products) {
    return products.map((product) => ProductDTO.toResponse(product));
  }
}

module.exports = ProductsService;
