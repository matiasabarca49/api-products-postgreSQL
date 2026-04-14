const renderProducts = (array) => {
    const contProducts = document.getElementById('products')
    contProducts.innerHTML = ""
    array.forEach(product => {
        const div = document.createElement('div')
        div.className = "product-card"
        div.style.maxWidth = "18rem"
        div.innerHTML = 
                    ` 
                            <div class="card-header">
                                <div class="header-content">
                                    <p class="card-category">${product.category}</p>
                                    <div class="header-buttons">
                                        <button class="btn principal-button edit-btn" onclick="editProduct('${product.id}')">
                                            ✎
                                        </button>
                                        <button class="btn btn-danger delete-btn" onclick="deleteProduct('${product.id}')">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <h6 class="text-body-secondary">ID: ${product.id}</h6>
                                <h5 class="card-title">${product.title}</h5>
                                <h6>stock: ${product.stock}</h6>
                            </div>
                            <div class="card-footer"> 
                                <span class="card-price">$ ${product.price}</span>
                                <a class="btn btn-light" href="http://localhost:8080/productview?id=${product.id}">Ver en Tienda</a>
                            </div>  
                    `
        contProducts.appendChild(div)
    })
}


//Funcion que renderiza la botonera de paginas
const renderBotonPage = (data) => {
    const pageCurrent = document.getElementById("currtPag")
    pageCurrent.innerHTML= `${data.page}`
}

//Funcion que nos pemite renderizar los elementos con paginate
const fetchProducts = (page)=>{
    //Obtenemos los productos de la pagina pasada por parametro
    fetch(`http://localhost:8080/api/products/admin?page=${page}`)
    .then( response => response.json())
    .then( data => {
        products = data
        //Una vez obtenido los productos se llama la funcion que los renderiza en el DOM
        renderProducts(data.payload)
        renderBotonPage(data)
    })
}
const fetchProductsOpts = (page,limit, sort, query)=>{
    //Obtenemos los productos de la pagina pasada por parametro
    fetch(`http://localhost:8080/api/products/admin?page=${page}&&limit=${limit}&&sort=${sort}&&category=${query}`)
    .then( response => response.json())
    .then( data => {
        products = data
        console.log(data)
        //Una vez obtenido los productos se llama la funcion que los renderiza en el DOM
        renderProducts(data.payload)
        renderBotonPage(data)
    })
}

//Funcion que nos pemite renderizar los elementos con paginate
const fetchProductsSearch = (search)=>{
    //Obtenemos los productos de la pagina pasada por parametro
    fetch(`http://localhost:8080/api/products/admin?title=${search}`)
    .then( response => response.json())
    .then( data => {
        products = data.payload
        //Una vez obtenido los productos se llama la funcion que los renderiza en el DOM
        renderProducts(data.payload)
        renderBotonPage(data)
    })
}

function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        console.log('Eliminando producto:', productId);
        fetch(`http://localhost:8080/api/products/${productId}`,{  
                method : "DELETE",
                credentials : "include", // to send HTTP only cookies
                headers: {
                 "Content-Type" : "application/json",
                 'Accept': 'application/json'
                }
        })
        .then( res => res.json())
        .then( data => {
            fetchProducts(1)
        })
    }
}

// Función para abrir el modal y cargar los datos del producto
async function editProduct(productId) {
    // obtener los datos del producto por ID
    const product = await getProductById(productId); // Implementa esta función según tu lógica
    
    if (product) {
        // Llenar el formulario con los datos del producto
        document.getElementById('editTitle').value = product.title || '';
        document.getElementById('editCategory').value = product.category || '';
        document.getElementById('editPrice').value = product.price || '';
        document.getElementById('editDescription').value = product.description || '';
        document.getElementById('editStock').value = product.stock || '';
        
        // Mostrar el modal
        document.getElementById('editProductModal').style.display = 'block';

        //Envío del formulario
        const modal = document.getElementById('editProductModal');
        document.getElementById('editProductForm').onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            const updatedProduct = {
                title: document.getElementById('editTitle').value,
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                stock: parseInt(formData.get('stock'))
            };
            
            //Actualizar el producto
            updateProduct(productId, updatedProduct);
            
            // Cerrar el modal
            modal.style.display = 'none';
        }
    }
}

// Cerrar modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('editProductModal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    
    // Cerrar con X
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    // Cerrar con botón Cancelar
    cancelBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    // Cerrar al hacer clic fuera del modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
});

async function getProductById(productId) {
    //obtener los datos del producto
    const res = await fetch(`http://localhost:8080/api/products/${productId}`)
    const data = await res.json()
    return data.producto
}

// Función para actualizar el producto)
async function updateProduct(productId, updatedProduct) {
    
    const res =  await  fetch(`http://localhost:8080/api/products/${productId}`,{
        method: "PUT",
        credentials : "include", // to send HTTP only cookies
        headers: {
            "Content-Type" : "application/json",
            'Accept': 'application/json'
        }, 
        body: JSON.stringify(updatedProduct)
        }
    )
    fetchProducts(1)

}


//Algoritmo Principal

let page = 1, limit = 10, sort = 1, query=""
let products = []

fetchProducts(page)

//Evento que permite renderizar los elementos de la pagina siguiente
const nextPag = document.getElementById("nextPag")
nextPag.addEventListener("click", ()=>{
    page = products.nextPage == null? page : products.nextPage
    //Evita que se llame la funcion si la proxima pagina es "null"
    page && fetchProductsOpts(page,limit, sort, query)
})
//Evento que permite renderizar los elementos de la pagina anterior
const prevPag = document.getElementById("prevPag")
prevPag.addEventListener("click", ()=>{
    page = products.prevPage == null? page : products.prevPage
    page && fetchProductsOpts(page,limit, sort, query)
})

//Eventos para cambiar cantidad de productos por páginas
const limitSelect = document.getElementById("itemsPerPage")
limitSelect.addEventListener("click", ()=>{
    limit = limitSelect.value
    page = 1
    fetchProductsOpts(page,limit, sort, query)
})

//Eventos para orden de productos
const orden = document.getElementById("sortFilter")
orden.addEventListener("click", ()=>{
    sort = orden.value
    fetchProductsOpts(page,limit, sort, query)
})

//Evento para filtrar por categoría
const productCategory = document.getElementById("categoryFilter")
productCategory.addEventListener("click", ()=>{
    query = productCategory.value
    fetchProductsOpts(page,limit, sort, query)
})

//Evento para buscar productos
const btnSearch = document.getElementById("searchInputButton")
btnSearch.addEventListener("click", ()=>{
    query = productCategory.value
    const search = document.getElementById("searchInput").value
    console.log(search)
    fetchProductsSearch(search)
})

