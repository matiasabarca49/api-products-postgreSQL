const render = (product) =>{
    const title = document.getElementById("title")
    const price = document.getElementById("price")
    const description = document.getElementById("description")
    const stock = document.getElementById("stock")
    const category = document.getElementById("category")
    const addCart = document.getElementById("addCart")
    title.innerText = product.title
    price.innerText = `$${product.price}`
    description.innerText = product.description
    stock.innerText = `Disponibles: ${product.stock}`
    category.innerText = product.category
    addCart.addEventListener('click', () => {
        addToCart(product)})

    // Vendedores
    // Vendedor principal (primer seller)
    const mainSeller = product.store_name;
    if (mainSeller) {
        document.getElementById('sellerName').textContent = mainSeller;
        document.getElementById('sellerInitial').textContent = mainSeller.charAt(0).toUpperCase()
    }

    // Otros vendedores
    const otherSellers = product.sellers;
    const otherContainer = document.getElementById('otherSellersContainer')

    if (otherSellers.length === 0) {
        otherContainer.innerHTML = `<span style="background:rgba(255,255,255,0.1); border:1px dashed rgba(255,255,255,0.25); border-radius:12px; padding:0.5rem 1.2rem; color:rgba(255,255,255,0.45); font-size:0.85rem; font-style:italic;">Sin otros vendedores</span>`
    } else {
        otherSellers.forEach(s => {
            otherContainer.insertAdjacentHTML('beforeend', `
                <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.08); border-radius:12px; border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; margin-bottom:0.6rem;">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(45deg,#2a5298,#1e3c72); display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:bold; color:white; flex-shrink:0;">
                            ${s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight:600; color:white; font-size:0.95rem;">${s.name}</div>
                            <div style="color:rgba(255,255,255,0.6); font-size:0.82rem;">$${s.price.toLocaleString()}</div>
                        </div>
                    </div>
                    <a href="http://localhost:8080/productview?i=${product.id}&s=${s.id}" style="background:linear-gradient(45deg,#2a5298,#1e3c72); color:white; padding:0.4rem 1rem; border-radius:20px; font-size:0.85rem; font-weight:600; text-decoration:none; transition:all 0.3s ease; box-shadow:0 2px 8px rgba(42,82,152,0.3);">
                        Ver producto
                    </a>
                </div>
            `)
        })
    }

    // Comentarios
    const comments = product.comments || []
    const avg = parseFloat(product.rating).toFixed(1) || 0

    document.getElementById('avgRating').textContent = avg

    const avgStarsEl = document.getElementById('avgStars')
    const avgNum = parseFloat(avg) || 0
    for (let i = 1; i <= 5; i++) {
        const s = document.createElement('span')
        s.innerHTML = i <= Math.round(avgNum) ? '★' : '☆'
        s.style.cssText = `font-size:1.4rem; color:${i <= Math.round(avgNum) ? '#f5c542' : 'rgba(255,255,255,0.3)'}`
        avgStarsEl.appendChild(s)
    }

    const container = document.getElementById('commentsContainer')
    if (comments.length === 0) {
        container.innerHTML = `<p style="color:rgba(255,255,255,0.5); font-style:italic;">Sin comentarios todavía.</p>`
    } else {
        comments.forEach(c => {
            const stars = Array.from({length:5}, (_,i) =>
                `<span style="color:${i < c.rating ? '#f5c542' : 'rgba(255,255,255,0.25)'}; font-size:1rem;">★</span>`
            ).join('')
            container.insertAdjacentHTML('beforeend', `
                <div style="background:rgba(255,255,255,0.1); border-radius:14px; border:1px solid rgba(255,255,255,0.15); padding:1rem 1.2rem; margin-bottom:0.85rem;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
                        <div style="display:flex; gap:3px;">${stars}</div>
                        <span style="font-size:0.85rem; font-weight:600; color:rgba(255,255,255,0.75);">${c.user_name ?? 'Anónimo'}</span>
                    </div>
                    <p style="color:rgba(255,255,255,0.88); font-size:0.97rem; line-height:1.5; margin:0;">${c.comment}</p>
                </div>
            `)
        })
    }
}

/**
* Algoritmo Principal 
*/

totalProducts()

const url = window.location.search
const params = new URLSearchParams(url)
const i = params.get("i");
const s = params.get("s");

fetch(`http://localhost:8080/api/products/${i}/${s}`)
    .then( response => response.json())
    .then( data =>{
        render(data.data)
    })