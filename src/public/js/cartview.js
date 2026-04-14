const getCart = (idCart) =>{
    fetch(`http://localhost:8080/api/carts/${idCart}`)
    .then(response => response.json())
    .then( data =>{
        renderProducts(data.cart.products)
        getUserCart(data.cart.id)
    } )
}

const getUserCart = (idCart)=>{
    fetch(`http://localhost:8080/api/ticket/filter?idCart=${idCart}`)
    .then(response => response.json())
    .then( data =>{
        getUser(data.ticket)

    } )
}

const getUser = (ticket) =>{
    fetch(`http://localhost:8080/api/users/filter?email=${ticket.purchaser}`)
    .then(response => response.json())
    .then( data =>{
        console.log(data)
         //Info
        const info = document.getElementById('infoID')
        info.innerHTML= `
            <h4>Comprado por: ${data.user.name} ${data.user.lastName}</h4>
            <h4>Email: ${data.user.email}</h4>
            <h4>Código: ${ticket.code}</h4>
            <h4>Fecha de Compra: ${ticket.purchase_datetime}</h4>
    `
    } )
}

const renderProducts = (array)=>{
    const contProducts = document.getElementById('contCart')
    contProducts.innerHTML= ""
    array.forEach(item => {
        const div = document.createElement('div')
        div.className= " col-2 col-6 col-sm-4 card  mb-3 flex-grow-1 shadow"
        div.style.maxWidth= "18rem"
        div.innerHTML= 
                    `
                        <div class="card-header bg-transparent ">
                            <p class="card-text"><small class="text-body-secondary">${item.product.category}</small>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title fs-4 text-black fw-bold">${item.product.title}</h5>
                            <p class="card-text">${item.product.description}</p>
                        </div>
                        <div class="card-footer bg-transparent fs-4 text d-flex justify-content-between align-items-center">
                            <h4 class="text-body-tertiary">Cantidad: ${item.quantity}</h4>
                            <h4>$${item.product.price * item.quantity}</h4> 
                        </div>
                    `
        contProducts.appendChild(div)
    });
    //Calculamos el total de la compra
    total(array)
}

//Funcion para calcular el total de la compra
const total = (array) =>{
    const total = array.reduce((acumulador, item) => item.product.price * item.quantity + acumulador, 0 )
    const contTotal = document.getElementById("total")
    contTotal.innerText = `Total Compra: $${total}`
}

/**  
* Algoritmo Principal 
**/

//obtenemos la URL actual
//const url = window.location.href
//mediante el metodo "split" obtenemos el id del carrito. 
//const id = url.split("/")[4]



//Una vez extraido el ID realizamos el fetch
//getCart(id)

const formCart = document.getElementById("buttonCartID")
formCart.addEventListener("click", (e)=>{
    e.preventDefault()
    const idCart = document.getElementById("IDCartToSearch").value
    getCart(idCart)
})