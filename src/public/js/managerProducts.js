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
        products = data.data
        //Una vez obtenido los productos se llama la funcion que los renderiza en el DOM
        renderProducts(data.data.payload)
        renderBotonPage(data.data)
    })
}
const fetchProductsOpts = (page,limit, sort, query)=>{
    //Obtenemos los productos de la pagina pasada por parametro
    fetch(`http://localhost:8080/api/products/admin?page=${page}&&limit=${limit}&&sort=${sort}&&category=${query}`)
    .then( response => response.json())
    .then( data => {
        products = data.data
        //Una vez obtenido los productos se llama la funcion que los renderiza en el DOM
        renderProducts(data.data.payload)
        renderBotonPage(data.data)
    })
}

//Funcion que nos pemite renderizar los elementos con paginate
const fetchProductsSearch = (search)=>{
    //Obtenemos los productos de la pagina pasada por parametro
    fetch(`http://localhost:8080/api/products/admin?title=${search}`)
    .then( response => response.json())
    .then( data => {
        products = data.data
        //Una vez obtenido los productos se llama la funcion que los renderiza en el DOM
        renderProducts(data.data.payload)
        renderBotonPage(data.data)
    })
}

// Función para agregar un nuevo producto
async function addProduct() {
    
    document.getElementById('modalTitle').innerText = 'Agregar Producto';

    document.getElementById('titleId').value = '';
    document.getElementById('categoryId').value =  '';
    document.getElementById('priceId').value =  '';
    document.getElementById('descriptionId').value =  '';
    document.getElementById('stockId').value =  '';
    document.getElementById('statusId').value = 'false';
    document.getElementById('ownerId').value = '';

    const code = document.getElementById('codeId')
    code.value = '';
    code.disabled = false;
    const owner = document.getElementById('ownerId')
    owner.value = '';
    owner.disabled = false;
        
    
    // Mostrar el modal
    document.getElementById('ProductModal').style.display = 'block';

    //Envío del formulario
    const modal = document.getElementById('ProductModal');
    document.getElementById('ProductForm').onsubmit = function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        const product = {
            title: document.getElementById('titleId').value,
            category: formData.get('category'),
            code: formData.get('code'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description'),
            stock: parseInt(formData.get('stock')),
            status: formData.get('status'),
            owner: formData.get('owner'),
            thumbnail: formData.get('thumbnail')
        };
        
        //Actualizar el producto
        addProductFetch(product);
        
        // Cerrar el modal
        modal.style.display = 'none';
    }
    
}

// Función para abrir el modal y cargar los datos del producto
async function editProduct(productId) {
    document.getElementById('modalTitle').innerText = 'Editar Producto';
    // obtener los datos del producto por ID
    const product = await getProductById(productId);
    
    if (product) {
        // Llenar el formulario con los datos del producto
        document.getElementById('titleId').value = product.title || '';
        document.getElementById('categoryId').value = product.category || '';
        document.getElementById('priceId').value = product.price || '';
        document.getElementById('stockId').value = product.stock || '';
        document.getElementById('descriptionId').value = product.description || '';
        document.getElementById('statusId').value = product.status || '';
        document.getElementById('thumbnailId').value = product.thumbnail || '';

        //Campos que no pueden editarse
        const code = document.getElementById('codeId')
        code.value = product.code || '';
        code.disabled = true;
        const owner = document.getElementById('ownerId')
        owner.value = product.owner || '';
        owner.disabled = true;

        // Mostrar el modal
        document.getElementById('ProductModal').style.display = 'block';

        //Envío del formulario
        const modal = document.getElementById('ProductModal');
        document.getElementById('ProductForm').onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            const updatedProduct = {
                title: document.getElementById('titleId').value,
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                stock: parseInt(formData.get('stock')),
                status: formData.get('status'),
                thumbnail: formData.get('thumbnail')
            };
            
            //Actualizar el producto
            updateProduct(productId, updatedProduct);
            
            // Cerrar el modal
            modal.style.display = 'none';
             document.getElementById('titleId').value = '';
        
        }
    }
}

// Cerrar modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('ProductModal');
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
    return data.data
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

// Función para actualizar el producto)
async function addProductFetch(product) {

    console.log("Producto a agregar: ", product)
    
    const res =  await  fetch(`http://localhost:8080/api/products/`,{
        method: "POST",
        credentials : "include", // to send HTTP only cookies
        headers: {
            "Content-Type" : "application/json",
            'Accept': 'application/json'
        }, 
        body: JSON.stringify(product)
        }
    )

    fetchProducts(1)

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


//Algoritmo Principal

let page = 1, limit = 10, sort = 1, query=""
let products = []

fetchProducts(page)

//Evento para abrir modal para agregar producto
const btnAddProduct = document.getElementById("addProduct");
btnAddProduct.addEventListener('click', () =>{
    addProduct();
})

//Evento que permite renderizar los elementos de la pagina siguiente
const nextPag = document.getElementById("nextPag")
nextPag.addEventListener("click", ()=>{
    page = products.hasNextPage? page + 1 : page
    //Evita que se llame la funcion si la proxima pagina es "null"
    page && fetchProductsOpts(page,limit, sort, query)
})
//Evento que permite renderizar los elementos de la pagina anterior
const prevPag = document.getElementById("prevPag")
prevPag.addEventListener("click", ()=>{
    page = products.hasPrevPage? page - 1 : page
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

