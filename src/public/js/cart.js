const addToCart = async (product)=>{
    let user;
    try{
        const resUser = await fetch(`http://localhost:8080/api/sessions/current`)
        user = await resUser.json()
        if(!user.success){
            window.location.href = "http://localhost:8080/users/login"
            return;
        }
        //Los usuarios no pueden agregar sus propios productos
        const modal = document.getElementById("modalWarningRolUser")
        if(user.data.rol === "admin"){
            modal.innerText = "Los Administradores no pueden comprar productos"
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
                body: JSON.stringify({seller_product_id: product.seller_product_id})
            })
            const data = await resToProductSended.json()
            if(!data.success){
                if(data.error.statusCode === 403){
                    modal.innerText = "No puedes agregar tu propio producto al carrito"
                }else{
                    modal.innerText = "Error al agregar el producto al carrito"
                }
                modal.style.display = "block"
                setTimeout(()=>{
                    modal.style.display = "none"
                },7000)
            }else{
                modal.innerText = "Producto agregado al carrito"
                modal.classList.replace("bg-danger", "bg-success")
                modal.style.display = "block"
                setTimeout(()=>{
                    modal.style.display = "none"
                },1000)
                totalProducts()
            }
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
        if(cart.success){
            cant = cart.data;
        }else{
            cart = "0";
        }
    }
    catch{
        cant = 0
    }
    const totalCountNav = document.getElementById("totalCountNav")
    totalCountNav.innerText = cant
}



