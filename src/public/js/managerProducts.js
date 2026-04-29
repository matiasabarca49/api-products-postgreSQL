const renderProducts = async (array) => {
    const user = await getUser();
    console.log("Usuario actual: ", user);
    const contProducts = document.getElementById('products')
    contProducts.innerHTML = ""
    array.forEach(product => {
        console.log(product)
        const div = document.createElement('div')
        div.className = "product-card"
        div.style.maxWidth = "18rem"
        div.innerHTML = 
                    ` 
                            <div class="card-header">
                                <div class="header-content">
                                    <p class="card-category">${product.category}</p>
                                    <div class="header-buttons">
                                    ${ user.rol === "admin"
                                        ? 

                                        `
                                            <button class="btn principal-button edit-btn" id=editProduct${product.seller_product_id}>
                                                ✎
                                            </button>
                                        `
                                        : ""
                                    }
                                        
                                        <button class="btn btn-danger status-btn" id=statusProduct${product.seller_product_id}>
                                            $
                                        </button>
                                        <button class="btn btn-danger delete-btn" onclick="deleteProduct('${product.seller_product_id}')">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <h6 class="text-body-secondary">ID: ${product.seller_product_id}</h6>
                                <h5 class="card-title">${product.title}</h5>
                                <h6>stock: ${product.stock}</h6>
                            </div>
                            <div class="card-footer"> 
                                <span class="card-price">$ ${product.price}</span>
                                <a class="btn btn-light" href="http://localhost:8080/productview?i=${product.product_id}&s=${product.seller_id}">Ver en Tienda</a>
                            </div>  
                    `
        contProducts.appendChild(div)

        document.getElementById(`statusProduct${product.seller_product_id}`).addEventListener('click', ()=>{
            editStatusProduct(product);
        })

        if(user.rol === "admin"){
            document.getElementById(`editProduct${product.seller_product_id}`).addEventListener('click', ()=>{
                editProduct(product);
            })
        }

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
    
    //Obtenemos el usuario
    const userData = await getUser();

    console.log("Usuario logeado: ", userData)

    document.getElementById('modalTitle').innerText = 'Agregar Producto';

    document.getElementById('titleId').value = '';
    document.getElementById('categoryId').value =  '';
    document.getElementById('priceId').value =  '';
    document.getElementById('descriptionId').value =  '';
    document.getElementById('stockId').value =  '';
    document.getElementById('statusId').value = 'false';

    const code = document.getElementById('codeId')
    code.value = '';
    code.disabled = false;        
    
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
            owner_id: userData.id, // Usar el ID del usuario logeado
            thumbnail: formData.get('thumbnail')
        };
        
        //Actualizar el producto
        addProductFetch(product);
        
        // Cerrar el modal
        modal.style.display = 'none';
    }
    
}

// Función para abrir el modal y cargar los datos del producto
async function editProduct(product) {
    document.getElementById('modalTitle').innerText = 'Editar Producto';
    // obtener los datos del producto por ID
    const productDB = await getProductById(product);
    
    if (product) {
        // Llenar el formulario con los datos del producto
        document.getElementById('titleId').value = productDB.title || '';
        document.getElementById('categoryId').value = productDB.category || '';
        document.getElementById('codeId').value = productDB.code || '';
        document.getElementById('priceId').value = productDB.price || '';
        document.getElementById('stockId').value = productDB.stock || '';
        document.getElementById('descriptionId').value = productDB.description || '';
        document.getElementById('statusId').value = productDB.seller_status;
        document.getElementById('thumbnailId').value = productDB.thumbnail || '';

        //Campos que no pueden editarse
        const code = document.getElementById('codeId')
        code.disabled = true;
        const stock = document.getElementById('stockId')
        stock.disabled = true;
        const price = document.getElementById('priceId')
        price.disabled = true;
        const status = document.getElementById('statusId')
        status.disabled = true;

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
                description: formData.get('description'),
                thumbnail: formData.get('thumbnail')
            };
            
            //Actualizar el producto
            updateProduct(product.product_id, updatedProduct);
            
            // Cerrar el modal
            modal.style.display = 'none';
             document.getElementById('titleId').value = '';
        
        }
    }
}

// Función para abrir el modal y cargar los datos del producto
async function editStatusProduct(product) {
    document.getElementById('modalTitle').innerText = 'Editar Producto';
    // obtener los datos del producto por ID
    const productDB = await getProductById(product);

    if (productDB) {
        // Llenar el formulario con los datos del producto
        document.getElementById('statusSId').value = productDB.seller_status;
        document.getElementById('priceSId').value = productDB.price || '';
        document.getElementById('stockSId').value = productDB.stock || '';

        // Mostrar el modal
        document.getElementById('statusModal').style.display = 'block';

        //Envío del formulario
        const modal = document.getElementById('statusModal');
        document.getElementById('statusForm').onsubmit = function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            const updatedProduct = {
                price: document.getElementById('priceSId').value,
                status: formData.get('status'),
                stock: formData.get('stock'),
            };
            
            //Actualizar el producto
            updateSellerProduct(product, updatedProduct);
            
            // Cerrar el modal
            modal.style.display = 'none';
             document.getElementById('titleId').value = '';
        
        }
    }
}

// Cerrar modal productos
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

// Cerrar modal productos
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('statusModal');
    const cancelBtn = document.getElementById('cancelStatusModal');
    const closeBtn = document.getElementById('closeStatusModal');
    
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




async function getProductById(product) {
    //obtener los datos del producto
    const res = await fetch(`http://localhost:8080/api/products/${product.product_id}/${product.seller_id}`)
    const data = await res.json();
    return data.data
}

// Función para actualizar el estado del producto
async function updateSellerProduct(product, updatedProduct) {
    
    const res =  await  fetch(`http://localhost:8080/api/products/${product.product_id}/seller/${product.seller_id}`,{
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
// Función para actualizar el producto
async function updateProduct(id, updatedProduct) {
    
    const res =  await  fetch(`http://localhost:8080/api/products/${id}`,{
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

function deleteProduct(seller_product_id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        fetch(`http://localhost:8080/api/products/${seller_product_id}`,{  
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

//Obtener usuario logeado para mostrar su nombre en el header
const getUser = async() =>{
    const req = await fetch(`http://localhost:8080/api/sessions/current`);
    const data = await req.json();
    return data.data;
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
    fetchProductsSearch(search)
})

