const loadPurchases = async () => {
    const container = document.getElementById('compras');
    
    const res = await fetch('/api/purchases/me');
    const { data } = await res.json();

    if (!data.docs.length) {
        container.innerHTML = `<p style="color:rgba(255,255,255,0.7)">No hay compras realizadas.</p>`;
        return;
    }

    container.innerHTML = data.docs.map(purchase => `
        <div class="purchase-item">
            <div class="purchase-header">
                <div class="purchase-date">
                    ${new Date(purchase.date_cart).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div class="purchase-date">Total: $${purchase.total.toLocaleString('es-AR')}</div>
            </div>
            <div class="purchase-products">
                ${purchase.products.map(item => `
                    <div class="purchase-product-card">
                        <div class="purchase-card-header">
                            <p class="purchase-card-category">x${item.quantity}</p>
                        </div>
                        <div class="purchase-card-body">
                            <h5 class="purchase-card-title">${item.title}</h5>
                        </div>
                        <div class="purchase-card-footer">
                            <div class="purchase-card-price">$${parseFloat(item.price).toLocaleString('es-AR')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
};

loadPurchases();