class ProductDTO {
    constructor(product){
        this.title = product.title
        this.description = product.description
        this.code = product.code
        this.status = product.status
        this.category_id = product.category_id
        this.thumbnail = product.thumbnail || []
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
            store_name: product.store_name,
            comments: product.comments || [],
            rating: product.rating || 0,
            sellers: product.sellers || []
        }
    }

}

module.exports = ProductDTO