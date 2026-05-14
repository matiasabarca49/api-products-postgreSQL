let currentPage = 1;

const createCommentModal = () => {
    if (document.getElementById('commentModal')) return;

    const modal = document.createElement('div');
    modal.id = 'commentModal';
    modal.style.cssText = `
        display:none; position:fixed; z-index:2000; left:0; top:0;
        width:100%; height:100%; background:rgba(0,0,0,0.75);
        backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px);
        align-items:center; justify-content:center;
    `;
    modal.innerHTML = `
        <div style="
            background:rgba(255,255,255,0.15); backdrop-filter:blur(20px);
            -webkit-backdrop-filter:blur(20px); border-radius:20px;
            border:1px solid rgba(255,255,255,0.2); padding:0;
            width:90%; max-width:460px;
            box-shadow:0 25px 50px rgba(0,0,0,0.5);
            animation:modalSlideIn 0.3s ease-out;
        ">
            <div style="
                display:flex; justify-content:space-between; align-items:center;
                padding:1.5rem 2rem; border-bottom:1px solid rgba(255,255,255,0.1);
            ">
                <h2 style="color:white; margin:0; font-size:1.4rem; font-weight:bold; text-shadow:0 2px 10px rgba(0,0,0,0.3);">
                    Dejar un comentario
                </h2>
                <button id="closeCommentModal" style="
                    background:none; border:none; color:rgba(255,255,255,0.7);
                    font-size:2rem; cursor:pointer; line-height:1; transition:all 0.3s;
                " onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">&times;</button>
            </div>
            <div style="padding:2rem;">
                <p id="commentProductTitle" style="
                    color:rgba(255,255,255,0.7); font-size:0.9rem;
                    margin:0 0 1.5rem 0; text-transform:uppercase; letter-spacing:0.5px;
                "></p>

                <div style="margin-bottom:1.5rem;">
                    <label style="display:block; color:white; font-weight:500; margin-bottom:0.75rem; text-shadow:0 1px 3px rgba(0,0,0,0.3);">
                        Calificación
                    </label>
                    <div id="starContainer" style="display:flex; gap:0.5rem;">
                        ${[1,2,3,4,5].map(n => `
                            <span data-star="${n}" style="
                                font-size:2.2rem; cursor:pointer;
                                transition:transform 0.15s; color:rgba(255,255,255,0.25);
                            ">★</span>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-bottom:1.5rem;">
                    <label style="display:block; color:white; font-weight:500; margin-bottom:0.5rem; text-shadow:0 1px 3px rgba(0,0,0,0.3);">
                        Comentario
                    </label>
                    <textarea id="commentText" rows="4" placeholder="Contá tu experiencia con el producto..." style="
                        width:100%; padding:0.75rem 1rem; border:1px solid rgba(255,255,255,0.3);
                        border-radius:15px; background:rgba(255,255,255,0.1);
                        backdrop-filter:blur(10px); color:white; font-size:1rem;
                        resize:vertical; box-sizing:border-box; font-family:inherit;
                        transition:all 0.3s;
                    "></textarea>
                </div>

                <div id="commentError" style="
                    display:none; color:#ff6b6b; font-size:0.9rem;
                    margin-bottom:1rem; text-align:center;
                "></div>

                <div style="display:flex; gap:1rem; justify-content:flex-end;">
                    <button id="cancelComment" class="cancel-btn">Cancelar</button>
                    <button id="submitComment" class="save-btn">Enviar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    initCommentModal();
};

const initCommentModal = () => {
    let selectedRating = 0;
    let currentProductId = null;

    const modal = document.getElementById('commentModal');
    const stars = document.querySelectorAll('#starContainer [data-star]');
    const textarea = document.getElementById('commentText');
    const errorDiv = document.getElementById('commentError');

    const paintStars = (upTo) => {
        stars.forEach(s => {
            const n = parseInt(s.dataset.star);
            s.style.color = n <= upTo ? '#f5c518' : 'rgba(255,255,255,0.25)';
            s.style.textShadow = n <= upTo ? '0 0 8px rgba(245,197,24,0.6)' : 'none';
        });
    };

    stars.forEach(s => {
        s.addEventListener('mouseenter', () => paintStars(parseInt(s.dataset.star)));
        s.addEventListener('mouseleave', () => paintStars(selectedRating));
        s.addEventListener('click', () => {
            selectedRating = parseInt(s.dataset.star);
            paintStars(selectedRating);
        });
    });

    const closeModal = () => {
        modal.style.display = 'none';
        selectedRating = 0;
        currentProductId = null;
        paintStars(0);
        textarea.value = '';
        errorDiv.style.display = 'none';
    };

    document.getElementById('closeCommentModal').addEventListener('click', closeModal);
    document.getElementById('cancelComment').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    document.getElementById('submitComment').addEventListener('click', async () => {
        errorDiv.style.display = 'none';

        if (!selectedRating) {
            errorDiv.textContent = 'Por favor seleccioná una calificación.';
            errorDiv.style.display = 'block';
            return;
        }
        if (!textarea.value.trim()) {
            errorDiv.textContent = 'El comentario no puede estar vacío.';
            errorDiv.style.display = 'block';
            return;
        }

        const btn = document.getElementById('submitComment');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            const res = await fetch('/api/products/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: currentProductId,
                    rating: selectedRating,
                    comment: textarea.value.trim()
                })
            });

            if (!res.ok) throw new Error('Error al enviar');

            // Actualizar botones de ese producto sin recargar
            const ratingCopy = selectedRating;
            document.querySelectorAll(`[onclick*="openCommentModal(${currentProductId},"]`).forEach(btn => {
                btn.outerHTML = starsHTML(ratingCopy);
            });

            closeModal();
        } catch {
            errorDiv.textContent = 'Hubo un error al enviar. Intentá de nuevo.';
            errorDiv.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Enviar';
        }
    });

    window.openCommentModal = (productId, productTitle) => {
        currentProductId = productId;
        selectedRating = 0;
        paintStars(0);
        textarea.value = '';
        errorDiv.style.display = 'none';
        document.getElementById('commentProductTitle').textContent = productTitle;
        modal.style.display = 'flex';
    };
};

const starsHTML = (rating) => `
    <div style="display:flex; align-items:center; gap:0.3rem;">
        ${'<span style="color:#f5c518">★</span>'.repeat(rating)}${'<span style="color:rgba(255,255,255,0.25)">☆</span>'.repeat(5 - rating)}
    </div>
`;

const commentBtnHTML = (productId, title) => `
    <button
        onclick="openCommentModal(${productId}, '${title.replace(/'/g, "\\'")}')"
        style="
            background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3);
            color:white; padding:0.35rem 0.75rem; border-radius:20px;
            cursor:pointer; font-size:0.8rem; font-weight:500;
            transition:all 0.3s; white-space:nowrap;
        "
        onmouseover="this.style.background='rgba(255,255,255,0.28)'"
        onmouseout="this.style.background='rgba(255,255,255,0.15)'"
    >★ Comentar</button>
`;

const loadPurchases = async (page = 1) => {
    const container = document.getElementById('compras');

    const res = await fetch(`/api/purchases/me?page=${page}&limit=5`);
    const data  = await res.json();

    if (!data.success) {
        container.innerHTML = `<p style="color:rgba(255,255,255,0.7)">No hay compras realizadas.</p>`;
        return;
    }

    container.innerHTML = data.data.payload.map(purchase => `
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
                        <div class="purchase-card-footer" style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="purchase-card-price">$${(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString('es-AR')}</div>
                            ${item.comment ? starsHTML(item.comment.rating) : commentBtnHTML(item.product_id, item.title)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    renderPagination(data);
};

const renderPagination = ({ page, totalPages, hasPrevPage, hasNextPage }) => {
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

/* ─── ADDRESSES ─────────────────────────────────────── */

const BASE_ADDR = '/api/users/addresses';
let editingIndex = null;   // índice dentro del array del usuario

// ── Render ──────────────────────────────────────────
const renderAddresses = (addresses) => {
    const container = document.getElementById('addressList');
    if (!addresses || !addresses.length) {
        container.innerHTML = `
            <div class="purchase-item" style="text-align:center;color:rgba(255,255,255,0.7);padding:2rem;">
                Todavía no tenés direcciones guardadas.
            </div>`;
        return;
    }

    container.innerHTML = addresses.map((addr, i) => `
        <div class="purchase-item" style="margin-bottom:1.2rem;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
                <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
                        <p style="margin:0;font-size:1.1rem;font-weight:600;color:white;">${addr.street}</p>
                        ${addr.is_delfault
                            ? `<span style="background:linear-gradient(45deg,#f7971e,#ffd200);color:#1a1a1a;padding:0.2rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:700;">Predeterminada</span>`
                            : ''}
                    </div>
                    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:0.95rem;">
                        ${addr.city}, ${addr.province} &nbsp;·&nbsp; CP ${addr.postal_code}
                    </p>
                </div>
                <div style="display:flex;gap:0.5rem;align-items:center;flex-shrink:0;">
                    ${!addr.is_delfault
                        ? `<button onclick="setDefaultAddress(${i})" title="Establecer como predeterminada" style="
                            background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
                            color:white;padding:0.4rem 0.9rem;border-radius:20px;cursor:pointer;
                            font-size:0.8rem;font-weight:500;transition:all 0.3s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.28)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                            ★ Predeterminar
                        </button>`
                        : ''}
                    <button onclick="openEditAddress(${i})" class="edit-btn" title="Editar">✏</button>
                    <button onclick="deleteAddress(${i})" class="delete-btn" title="Eliminar">✕</button>
                </div>
            </div>
        </div>
    `).join('');
};

// ── Cargar desde API ────────────────────────────────
const loadAddresses = async () => {
    try {
        const res = await fetch(BASE_ADDR);
        const json = await res.json();
        const addresses = json.data?.[0]?.adressess || [];
        renderAddresses(addresses);
    } catch {
        document.getElementById('addressList').innerHTML =
            `<p style="color:#ff6b6b">Error al cargar las direcciones.</p>`;
    }
};

// ── Modal ───────────────────────────────────────────
const openAddressModal = (mode = 'add', addr = null, index = null) => {
    editingIndex = index;
    document.getElementById('addressModalTitle').textContent =
        mode === 'edit' ? 'Editar dirección' : 'Agregar dirección';
    document.getElementById('addrStreet').value   = addr?.street      || '';
    document.getElementById('addrCity').value     = addr?.city        || '';
    document.getElementById('addrProvince').value = addr?.province    || '';
    document.getElementById('addrPostal').value   = addr?.postal_code || '';
    document.getElementById('addrDefault').checked = addr?.is_delfault || false;
    document.getElementById('addressError').style.display = 'none';
    document.getElementById('addressModal').style.display = 'flex';
};

const closeAddressModal = () => {
    document.getElementById('addressModal').style.display = 'none';
    editingIndex = null;
};

// ── Abrir edición ───────────────────────────────────
window.openEditAddress = async (index) => {
    const res  = await fetch(BASE_ADDR);
    const json = await res.json();
    const addr = json.data?.[0]?.adressess?.[index];
    openAddressModal('edit', addr, index);
};

// ── Predeterminar ────────────────────────────────────
window.setDefaultAddress = async (index) => {
    const res     = await fetch(BASE_ADDR);
    const json    = await res.json();
    const all     = json.data?.[0]?.adressess || [];
    const updated = all.map((a, i) => ({ ...a, is_delfault: i === index }));

    await fetch(BASE_ADDR, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: updated })
    });
    renderAddresses(updated);
};

// ── Eliminar ────────────────────────────────────────
window.deleteAddress = async (index) => {
    if (!confirm('¿Eliminás esta dirección?')) return;
    const res  = await fetch(BASE_ADDR);
    const json = await res.json();
    const all  = json.data?.[0]?.adressess || [];
    all.splice(index, 1);

    await fetch(BASE_ADDR, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: all })
    });
    renderAddresses(all);
};

// ── Guardar (crear o editar) ────────────────────────
/* document.getElementById('submitAddress').addEventListener('click', async () => {
    const street   = document.getElementById('addrStreet').value.trim();
    const city     = document.getElementById('addrCity').value.trim();
    const province = document.getElementById('addrProvince').value.trim();
    const postal   = document.getElementById('addrPostal').value.trim();
    const isDef    = document.getElementById('addrDefault').checked;
    const errDiv   = document.getElementById('addressError');

    if (!street || !city || !province || !postal) {
        errDiv.textContent = 'Completá todos los campos.';
        errDiv.style.display = 'block';
        return;
    }

    const newAddr = { street, city, province, postal_code: postal, is_delfault: isDef };

    // Traer las actuales para mutar
    const res  = await fetch(BASE_ADDR);
    const json = await res.json();
    let all    = json.data?.[0]?.adressess || [];

    if (isDef) all = all.map(a => ({ ...a, is_delfault: false }));

    if (editingIndex !== null) {
        all[editingIndex] = newAddr;
    } else {
        if (!all.length) newAddr.is_delfault = true; // primera = predeterminada
        all.push(newAddr);
    }

    const method = editingIndex !== null ? 'PUT' : 'POST';

    try {
        const saveRes = await fetch(BASE_ADDR, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses: all })
        });
        if (!saveRes.ok) throw new Error();
        closeAddressModal();
        renderAddresses(all);
    } catch {
        errDiv.textContent = 'Error al guardar. Intentá de nuevo.';
        errDiv.style.display = 'block';
    }
});

// ── Eventos del modal ───────────────────────────────
document.getElementById('btnNewAddress').addEventListener('click', () => openAddressModal('add'));
document.getElementById('closeAddressModal').addEventListener('click', closeAddressModal);
document.getElementById('cancelAddress').addEventListener('click', closeAddressModal);
document.getElementById('addressModal').addEventListener('click', e => {
    if (e.target === document.getElementById('addressModal')) closeAddressModal();
}); */

loadAddresses();

createCommentModal();
loadPurchases();

