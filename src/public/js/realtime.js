const render = (array)=>{
    const contProducts = document.getElementById('products')
    contProducts.innerHTML= ""
    array.forEach(product => {
        const div = document.createElement('div')
        div.className= " col-2 col-6 col-sm-4 card  mb-3 flex-grow-1"
        div.style.maxWidth= "18rem"
        div.innerHTML= 
                    `
                        <div class="card-header bg-transparent ">
                            <p class="card-text"><small class="text-body-secondary">${product.category}</small>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title fs-4 text-black fw-bold">${product.title}</h5>
                            <p class="card-text">${product.description.slice(0,70)}...</p>
                        </div>
                        <div class="card-footer bg-transparent fs-4 text "> $ ${product.price}</div>
                    `
        contProducts.appendChild(div)
    });

}

const addProduct = (  )=>{
    const newProduct ={
        title: document.getElementById('title').value,
        description: document.getElementById('description').value || "Sin Descripción",
        price: document.getElementById('price').value,
        thumbnail: document.getElementById('thumbnail').value || "Sin Imagen" ,
        code: document.getElementById('code').value,
        stock: document.getElementById('stock').value,
        status: true,
        category: document.getElementById('category').value,
        owner: document.getElementById('owner').value
    }
    socket.emit('newProductToBase', newProduct )
    return false
}

const socket = io()

socket.on('sendProducts', (data)=>{
    render(data)
})



