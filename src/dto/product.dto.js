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
            product_status: product.product_status,
            seller_status: product.seller_status,
            seller_product_id: product.seller_product_id,
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