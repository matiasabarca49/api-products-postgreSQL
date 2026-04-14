class ProductDTO {
    constructor(product){
        this.title = product.title
        this.description = product.description
        this.code = product.code
        this.price = product.price
        this.status = product.status
        this.stock = product.stock
        this.category_id = product.category_id
        this.thumbnail = product.thumbnail || []
        this.owner = product.owner 
    }

    static toResponse(product){
        return {
            id: product._id || product.id,
            title: product.title,
            description: product.description,
            code: product.code,
            price: product.price,
            status: product.status,
            stock: product.stock,
            category: product.category,
            thumbnail: product.thumbnail,
            owner: product.owner
        }
    }

}

module.exports = ProductDTO