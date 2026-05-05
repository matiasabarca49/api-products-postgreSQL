const ProductDTO = require("../dto/product.dto.js");
const ProductsRepository = require("../repositories/postgreSQL/productsRepository.js");
const { NotFoundException, ForbiddenException } = require("../exceptions/validation.exception.js");
const { sendEmailDeleteProduct } = require("../utils/mail.halper.js");
const AppError = require("../utils/errors/AppError.js");

class ProductsService{
  constructor(){
    this.repository = new ProductsRepository();
  }

  /**
   * Obtener productos para la tienda con paginación, filtro y ordenamiento. NO retornar productos con status false (inactivos).
   * Si se recibe un filtro de categoría, convertirlo a category_id para la consulta
   * Paginacion:
   * @param {number} [limit=10]
   * @param {number} [page=1]
   * @param {number} [sort=1]
   * Filtros:
   * @param {Object} filters - Objeto con los filtros a aplicar (title, category, priceMin, priceMax)
   * @param {string} [filters.title] - Filtro de búsqueda parcial por título
   * @param {string} [filters.category] - Filtro por categoría
   * @param {number} [filters.priceMin] - Filtro de precio mínimo
   * @param {number} [filters.priceMax] - Filtro de precio máximo
   * @returns {Promise<Array<Object>>} Objeto con los productos encontrados formateados y la información de paginación 
   */
  async findAll(filters = {}, limit, page, sort) {
    // Si se recibe un filtro de categoría, convertirlo a category_id para la consulta
    if(filters.category){
      const category = await this.repository.findCategoryBySlug(filters.category);

      if(category){
        filters.path = category.path;
        delete filters.category;
      }

      delete filters.category;
    }

    //filters.status = true; // Solo mostrar productos activos

    const products = await this.repository.findAll(filters, limit, page, sort)

    if(products & products.payload.length > 0) {
      products.payload = this.toManyDTO(products.payload);
    }

    return products
  }


  /**
   * Buscar un producto por ID de seller_product. La relacion entre productos y users es a través de seller_products, por lo que se debe buscar el producto a través de su ID en seller_products para luego retornar la información del producto formateada a DTO. Si no se encuentra el producto con el ID proporcionado, lanzar una excepción de tipo NotFoundException
   * @param {number} id - ID del producto a buscar
   * @returns {Promise<Object>} Producto encontrado formateado a DTO
   * @throws {NotFoundException} Si no se encuentra el producto con el ID proporcionado
   */
  async findByIdSeller(idProduct, idSeller){
    const product = await this.repository.findByIdSeller(idProduct, idSeller);
    if(!product) throw new NotFoundException("Producto no encontrado");
    return this.toDTO(product)
  }

  /**
   * Retorna los productos que puede gestionar el usuario según su rol. Premium solo puede ver sus productos, Admin puede ver todos los productos.
   * Si se recibe un filtro de categoría, convertirlo a category_id para la consulta
   * @param {Object} user 
   * @param {Object} filters 
   * @param {number} limit 
   * @param {number} page 
   * @param {number} sort 
   * @returns {Promise<Array<Object>>} Array con los productos encontrados formateados y la información de paginación
   */
  async findManageableProducts(user, filters = {}, limit, page, sort) {

    // Solo los productos del usuario si es Premium, Admin puede ver todos los productos
    if (user.rol === "premium") {
      filters.seller_id = user.idUser;
    } 

    // Si se recibe un filtro de categoría, convertirlo a category_id para la consulta
    if(filters.category){
      const category = await this.repository.findCategoryBySlug(filters.category);

      if(category){
        filters.path = category.path;
        delete filters.category
      }

      delete filters.category;
    }

    const documents = await this.repository.findAllAdmin(
      filters,
      limit,
      page,
      sort
    );

    return documents;
  }

  /**
   * Crear un nuevo producto. Solo usuarios con rol Premium o Admin pueden crear productos. Si se recibe una categoría, convertirla a category_id para la consulta
   * @param {Object} product - Objeto con los datos del producto a crear
   * @returns {Promise<Object>} Producto creado formateado a DTO
   * @throws {NotFoundException} Si se recibe una categoría que no existe en la base de datos
   */
  async create(product){

        if(product.category){

          product = await this.#returnCategory(product);
          
          if(!product) throw new NotFoundException("Categoria no encontrada")
        }

        //Verificamos si el producto ya existe
        let productToAssociate = await this.repository.findByCode(product.code);
        //Si el producto no existe, lo creamos
        if(!productToAssociate){
          //Formateamos el documento y lo creamos en la base de datos
          productToAssociate = await this.repository.create(this.toFormatDTO(product))
        }
      
        if(!productToAssociate) throw new AppError("Error al crear el producto");
        //Asociamos el producto al Usuario que lo creó a través de seller_products
        const sellerProduct = {
          product_id: productToAssociate.id,
          seller_id: product.owner_id,
          stock: product.stock,
          price: product.price
        }

        await this.repository.associateProductToSeller(sellerProduct)

        //Retornamos el documento creado formateado a DTO
        return this.toDTO(productToAssociate) 
  }

  /**
   * Agregar comentarios a productos
   */
  async addComment(user, comment){
    
    if(!await this.repository.existByID(comment.product_id)){
      throw new NotFoundException("El producto no existe");
    }

    //Agregamos el usuario actual
    comment.user_id = user.idUser;

    return await this.repository.addComment(comment);
  }

  /**
   * Actualizar un producto por su ID. Solo usuarios con rol Premium o Admin pueden actualizar productos. Premium solo puede actualizar sus productos, Admin puede actualizar cualquier producto. Si se recibe una categoría, convertirla a category_id para la consulta
   * @param {number} id - ID del producto a actualizar
   * @param {Object} updatedProduct - Objeto con los datos a actualizar del producto
   * @returns {Promise<Object>} Producto actualizado formateado a DTO
   * @throws {NotFoundException} Si no se encuentra el producto con el ID proporcionado o si se recibe una categoría que no existe en la base de datos
   */
  async update(id, updatedProduct){

    if(!this.repository.existByID(id)){
      throw new NotFoundException("Producto no encontrado")
    }

    if(updatedProduct.category){
      updatedProduct = await this.#returnCategory(updatedProduct);
          
      if(!updatedProduct) throw new NotFoundException("Categoria no encontrada")
    }

    //Actualizar producto
    return await this.repository.update(id, updatedProduct)
  }

  /**
   * Actualizar stock de user premium
   */
  async updateProductFromSeller(user, product_id, seller_id, dataToUpdate){
  
    if(user.rol === "premium" && user.idUser != seller_id){
      throw new ForbiddenException("No tiene permiso para modificar este producto");
    }

    return await this.repository.updateProductFromSeller(product_id, seller_id, dataToUpdate);
  }

  /**
   * Eliminar un producto por su ID. Solo usuarios con rol Premium o Admin pueden eliminar productos. Premium solo puede eliminar sus productos, Admin puede eliminar cualquier producto.
   * @param {number} ID - ID del producto a eliminar
   * @param {Object} user - Usuario que realiza la acción de eliminación
   */
  async delProduct(ID, user) {
    const productFound = await this.repository.findByID(ID);

    if (!productFound) {
      throw new NotFoundException("Producto no encontrado");
    }

    //Eliminar el producto. "Admin" puede eliminar todos los productos, "El propietario solo puede eliminar sus productos"
    if (user.rol === "Premium" && user.email !== productFound.owner) {
      
      throw new ForbiddenException("No tienes permisos para eliminar este producto");

    }else {

        //Enviar mail al propietario del producto si el producto no es de un Admin
        if (productFound.owner !== "Admin") {
          await sendEmailDeleteProduct(user.email, productFound);
        }

        return this.repository.delete(ID);
    }
    
  }

  async deleteFromSeller(id_product_seller, user){
     return this.repository.deleteFromSeller(id_product_seller);
  }


  /**
   * Verificar si hay stock suficiente para un producto dado su ID y la cantidad requerida
   * @param {number} product_id - ID del producto a verificar
   * @param {number} quantity - Cantidad requerida para la compra
   * @returns {Promise<boolean>} Retorna true si hay stock suficiente, false si no lo hay
   */
  async verifyStock(product_id, quantity){
      return await this.repository.verifyStock(product_id, quantity);
  }


  /**
   * Dado un producto con el campo category como nombre de la categoría, buscar el ID de la categoría y reemplazar el campo category por category_id con el ID encontrado. Si no se encuentra la categoría, retornar null
   * @param {Object} product - Objeto con los datos del producto a crear o actualizar, incluyendo el campo category con el nombre de la categoría
   * @returns {Promise<Object|null>} Retorna el producto con el campo category reemplazado por category_id con el ID encontrado, o null si no se encuentra la categoría 
   */
  async #returnCategory(product){

    const category = await this.repository.findCategoryBySlug(product.category);

    if(!category) return null;

    product.category_id = category.id;

    delete product.category;
    
    return product
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
