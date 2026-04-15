const renderProducts = (ticket, products, user)=>{
    const contProducts = document.getElementById('contCart')
    contProducts.innerHTML= ""
    products.forEach(item => {
        const div = document.createElement('div')
        div.className= " purchase-product-card"
        div.style.maxWidth= "18rem"
        div.innerHTML= 
                    `
                        <div class="purchase-card-header ">
                            <p class="purchase-card-category">Producto</p>
                        </div>
                        <div class="purchase-card-body">
                            <h5 class="purchase-card-title">${item.title}</h5>
                        </div>
                        <div class="purchase-card-footer">
                            <h4 class="text-body-tertiary">Cantidad: ${item.quantity}</h4>
                            <h4>$${item.price * item.quantity}</h4> 
                        </div>
                    `
        contProducts.appendChild(div)
    });
    //Info
    const info = document.getElementById('infoID')
    info.innerHTML= `
        <h4>Comprado por: ${user.name} ${user.last_name}</h4>
        <h4>Código: ${ticket.code}</h4>
        <h4>Fecha de Compra: ${ticket.purchase_datetime}</h4>
    `
    const mail = document.getElementById('mailID')
    mail.innerHTML = `<p>Se ha enviado un mail al correo ${ticket.purchaser.email} con los datos de la compra.</p>`
    //Calculamos el total de la compra
    total(products)
}

//Funcion para calcular el total de la compra
const total = (array) =>{
    const total = array.reduce((acumulador, item) => item.price * item.quantity + acumulador, 0 )
    const contTotal = document.getElementById("total")
    contTotal.innerText = `Total Compra: $${total}`
}

/**  
* Algoritmo Principal 
**/

//Obtenemos las query params. Obtenemos el string de Query
const url = window.location.search
//Creamos el objeto que contiene las queryparams usando su constructor
const params = new URLSearchParams(url)
//Mediante el metodo "get" obtenemos el id para utilizarlo en el fetch
const code = params.get("code")
fetch(`http://localhost:8080/api/tickets?code=${code}`)
    .then( res => res.json())
    .then( ticket => {
        renderProducts(ticket.data, ticket.data.products, ticket.data.purchaser)
    })

