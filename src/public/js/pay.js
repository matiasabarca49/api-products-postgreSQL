const render = (cart)=>{
    const cartCont = document.getElementById('cartCont')
    const totalShopping = document.getElementById('totalShopping')
    const contentPay = document.getElementById('contToPay')
    cartCont.innerHTML = " "
    if( cart.length !== 0){
        cart.forEach(product => {
            console.log(product)
            const div = document.createElement("div")
            div.classList = "cart-item-container"
            div.innerHTML =         
                `
                    <div class="cart-item cart-item-content">
                    <div class="item-header">
                        <p class="item-category">${product.category}</p>
                        <button class="remove-btn" id="delete${product.seller_product_id}">X</button>
                    </div>
                    <div class="item-body">
                        <h5 class="item-title">${product.title}</h5>
                        <p class="item-quantity">Cantidad: ${product.quantity}</p>
                        <div class="mt-3"> Vendido por: ${product.store_name}</div>
                    </div>
                    <div class="item-footer">
                        <div class="item-calculation">${product.price} x ${product.quantity}</div>
                    </div>
                    </div>
                    <div class="cart-item-total">
                        <div class="item-price">$${product.price * product.quantity}</div>
                    </div>
             `
            cartCont.appendChild(div)
            //Agregar Evento para eliminar producto
            const btnDelete = document.getElementById(`delete${product.seller_product_id}`)
            btnDelete.addEventListener("click", ()=>{
                deleteProduct(product.seller_product_id)
            })
        })
        //Total de la compra
        const total = cart.reduce((acumulador, product) => acumulador + (product.price * product.quantity), 0)
        totalShopping.innerText= `$${total}` 
        //crear botón para pagar
        contentPay.innerHTML = " "
        const btn = document.createElement('button')
        btn.className = "w-50 mx-auto my-3 btn btn-danger d-block"
        btn.id = "toPay"
        btn.innerText= "Pagar"
        //Evento para apagar
        btn.addEventListener('click', ()=>{
            const processPurchase = document.getElementById('processPurchase')
            processPurchase.style.display="block"
            finishPurchase()
        })
        contentPay.appendChild(btn)
    }
    else{
        cartCont.innerHTML= `<p class="p-5 mt-3 fs-2 opacity-50 text-center text-white"> - Carrito Vacio - </p>`
        totalShopping.innerText="$0"
        contentPay.innerHTML = " "
    }
    
}

const deleteProduct = async (seller_product_id) =>{
    console.log("Se intenta eliminar producto id: ", seller_product_id)
    const res =  await fetch(`http://localhost:8080/api/cartItems/remove/${seller_product_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
    })
    getCart()
}


//Funcion que se ejecuta al hacer click al boton pagar
const finishPurchase = async ()=>{
    //Corroborramos la sesion
    let req = await fetch(`http://localhost:8080/api/sessions/current`);
    const user = await req.json();

    //Generamos la Compra
    req = await fetch(`http://localhost:8080/api/purchases/checkout`);
    const ticket = await req.json();

    if(!ticket.success){
        alert("Error al procesar la compra, intente de nuevo");
    }else{
        window.location.href= `http://localhost:8080/ticket?code=${ticket.data.code}`
    }
        
}

const getCart = ()=>{
    fetch('http://localhost:8080/api/cartItems')
    .then( res => res.json())
    .then( cart => {
        cart = cart.data
        render(cart)
    })
}

/**
 *  Algoritmo Principal 
**/

let user
getCart()
