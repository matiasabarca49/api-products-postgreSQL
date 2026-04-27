let currentPage = 1;

const loadPurchases = async (page = 1) => {
    const container = document.getElementById('compras');

    const res = await fetch(`/api/purchases/me?page=${page}&limit=5`);
    const { data } = await res.json();

    if (!data.payload.length) {
        container.innerHTML = `<p style="color:rgba(255,255,255,0.7)">No hay compras realizadas.</p>`;
        return;
    }

    container.innerHTML = data.payload.map(purchase => `
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
                            <p>Vendido por: ${item.store_name}</p>
                            <p class="purchase-card-category">${item.quantity} x $${(item.price).toLocaleString('es-AR')}</p>
                        </div>
                        <div class="purchase-card-body">
                            <h5 class="purchase-card-title">${item.title}</h5>
                        </div>
                        <div class="purchase-card-footer">
                            <div class="purchase-card-price">$${(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString('es-AR')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    renderPagination(data);
};

const renderPagination = ({ page, totalPages, hasPrevPage, hasNextPage}) => {
    const existing = document.getElementById('pagination');
    if (existing) existing.remove();

    if (totalPages <= 1) return;

    const nav = document.createElement('div');
    nav.id = 'pagination';
    nav.className = 'pagination-container';
    nav.innerHTML = `
        <ul class="pagination">
            <li class="page-item">
                <button class="page-btn" ${!hasPrevPage ? 'disabled style="opacity:0.4;cursor:default"' : ''} 
                    onclick="changePage(${page - 1})">‹ Anterior</button>
            </li>
            <li class="page-item">
                <span class="page-btn" style="cursor:default">${page} / ${totalPages}</span>
            </li>
            <li class="page-item">
                <button class="page-btn" ${!hasNextPage ? 'disabled style="opacity:0.4;cursor:default"' : ''} 
                    onclick="changePage(${page + 1})">Siguiente ›</button>
            </li>
        </ul>
    `;

    document.getElementById('compras').after(nav);
};

const changePage = (page) => {
    currentPage = page;
    loadPurchases(page);
    window.scrollTo({ top: document.getElementById('compras').offsetTop - 20, behavior: 'smooth' });
};

loadPurchases();