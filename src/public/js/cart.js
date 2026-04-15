const addToCart = async (product)=>{
    let user;
    try{
        const resUser = await fetch(`http://localhost:8080/api/sessions/current`)
        user = await resUser.json()
        //Los usuarios no pueden agregar sus propios productos
        if(user.data.email === product.owner || user.data.rol === "Admin"){
            const modal = document.getElementById("modalWarningRolUser")
            if(user.data.email === product.owner){
                modal.innerText = "Los Usuarios Premium no pueden agregar sus propios productos"
            }
            else{
                modal.innerText = "Los Administradores no pueden comprar productos"

            }
            modal.style.display = "block"
            setTimeout(()=>{
                modal.style.display = "none"
            },7000)
        }else{
            const resToProductSended = await fetch(`http://localhost:8080/api/cartItems/add`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({product_id: product.id})
            })
            const data = resToProductSended.json()
            totalProducts()
        }

    }
    catch(error){
        if(!user){
            window.location.href = "http://localhost:8080/users/login"
        }
        else{
            console.log("Error al Agregar el producto al carrito")
        }
    }
}

const totalProducts = async ()=>{
    let cant
    try{
        const resUser = await fetch(`http://localhost:8080/api/cartItems/cant`)
        const cart = await resUser.json()
        cant = cart.data
    }
    catch{
        cant = 0
    }
    const totalCountNav = document.getElementById("totalCountNav")
    totalCountNav.innerText = cant
}



