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
            category_path: product.category_path,
            thumbnail: product.thumbnail,
            store_name: product.store_name,
            comments: product.comments || [],
            rating: product.rating || 0,
            sellers: product.sellers || []
        }
    }

}


class CreateRequestDTO{
    constructor(product){
        this.title = product.title
        this.description = product.description
        this.code = product.code
        this.status = product.status
        this.category = product.category
        this.thumbnail = product.thumbnail || "Not URL"
        this.stock = product.stock
        this.price = product.price
    }
}


class UpdateProductRequestDTO{
    constructor(product){
        this.title = product.title;
        this.description = product.description;
        this.thumbnail = product.thumbnail;
        this.category = product.category;
    }
}

class CreateCommentRequestDTO{
    constructor(comment){
        this.product_id = comment.product_id;
        this.rating = comment.rating;
        this.comment = comment.comment;
    }
}

class UpdateProductSellerRequestDTO{
    constructor(product){
        this.status = product.status;
        this.price = product.price;
        this.stock = product.stock;
    }
}

module.exports = {
    ProductDTO,
    CreateRequestDTO,
    UpdateProductRequestDTO,
    UpdateProductSellerRequestDTO,
    CreateCommentRequestDTO
}