const Sales = (() => {
    // ─── State ────────────────────────────────────────────────
    let allSales      = [];
    let filteredSales = [];
    let currentPage   = 1;
    let totalPages    = 1;
    let hasPrevPage   = false;
    let hasNextPage   = false;
    let totalDocs     = 0;
    const LIMIT       = 5;

    // ─── DOM refs ─────────────────────────────────────────────
    const container      = document.getElementById('salesContainer');
    const searchInput    = document.getElementById('searchInput');
    const sortSelect     = document.getElementById('sortSelect');
    const statusSelect   = document.getElementById('statusSelect');
    const refreshBtn     = document.getElementById('refreshBtn');
    const paginationCont = document.getElementById('paginationContainer');
    const paginationList = document.getElementById('paginationList');
    const errorMessage   = document.getElementById('errorMessage');
    const errorText      = document.getElementById('errorText');

    // ─── Fetch (server-side pagination) ───────────────────────
    async function fetchSales(page = 1) {
        showLoading();
        try {
            const res = await fetch('/api/sales/?page=' + page + '&limit=' + LIMIT);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();
            if (!json.success) throw new Error('La API devolvio success: false');

            const data  = json.data;
            allSales    = data.payload;
            currentPage = data.page;
            totalPages  = data.totalPages;
            hasPrevPage = data.hasPrevPage;
            hasNextPage = data.hasNextPage;
            totalDocs   = data.totalDocs;

            applyFilters();
        } catch (err) {
            showError(err.message);
        }
    }

    // ─── Filter & Sort ────────────────────────────────────────
    function applyFilters() {
        const query        = searchInput.value.trim().toLowerCase();
        const sort         = sortSelect.value;
        const statusFilter = statusSelect ? statusSelect.value : '';

        filteredSales = allSales.filter(function(sale) {
            const matchesQuery = !query || (
                sale.buyer_name.toLowerCase().includes(query)  ||
                sale.buyer_email.toLowerCase().includes(query) ||
                sale.buyer_dni.includes(query)
            );
            const matchesStatus = !statusFilter || sale.status === statusFilter;
            return matchesQuery && matchesStatus;
        });

        filteredSales.sort(function(a, b) {
            switch (sort) {
                case 'oldest':  return new Date(a.date_cart) - new Date(b.date_cart);
                case 'highest': return parseFloat(b.total)   - parseFloat(a.total);
                case 'lowest':  return parseFloat(a.total)   - parseFloat(b.total);
                default:        return new Date(b.date_cart) - new Date(a.date_cart);
            }
        });

        updateStats();
        renderPage();
    }

    // ─── Stats ────────────────────────────────────────────────
    function updateStats() {
        const totalRevenue = filteredSales.reduce(function(acc, s) { return acc + parseFloat(s.total); }, 0);
        const avg = filteredSales.length ? totalRevenue / filteredSales.length : 0;

        document.getElementById('statTotal').textContent  = formatCurrency(totalRevenue);
        document.getElementById('statOrders').textContent = totalDocs;
        document.getElementById('statAvg').textContent    = formatCurrency(avg);
    }

    // ─── Render ───────────────────────────────────────────────
    function renderPage() {
        if (filteredSales.length === 0) {
            container.innerHTML =
                '<div class="empty-state">' +
                    '<h3>Sin resultados</h3>' +
                    '<p>No se encontraron ventas con ese criterio de busqueda.</p>' +
                '</div>';
            paginationCont.style.display = 'none';
            return;
        }

        container.innerHTML = filteredSales.map(renderSaleCard).join('');
        renderPagination();
    }

    // ─── Badge helpers ────────────────────────────────────────
    function statusBadge(status, saleIds) {
        var map = {
            pending:   { label: 'Pendiente', icon: '🕐', bg: 'rgba(255,193,7,0.2)',  border: 'rgba(255,193,7,0.5)',  color: '#ffc107' },
            approved:  { label: 'Aprobado',  icon: '✅', bg: 'rgba(40,167,69,0.2)',  border: 'rgba(40,167,69,0.5)',  color: '#28a745' },
            cancelled: { label: 'Cancelado', icon: '❌', bg: 'rgba(220,53,69,0.2)',  border: 'rgba(220,53,69,0.5)',  color: '#dc3545' },
            shipped:   { label: 'Enviado',   icon: '🚚', bg: 'rgba(23,162,184,0.2)', border: 'rgba(23,162,184,0.5)', color: '#17a2b8' },
            delivered: { label: 'Entregado', icon: '📬', bg: 'rgba(0,255,58,0.15)',  border: 'rgba(0,255,58,0.4)',   color: '#00ff3a' },
        };
        var s = map[status] || { label: status, icon: '•', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.3)', color: 'white' };

        var options = ['pending','approved','shipped','delivered','cancelled']
            .filter(function(st) { return st !== status; })
            .map(function(st) {
                var m = map[st];
                return '<option value="' + st + '">' + m.icon + ' ' + m.label + '</option>';
            }).join('');

        // ids separados por coma para evitar problemas con comillas en atributos HTML
        var idsAttr = saleIds.join(',');

        return (
            '<span style="background:' + s.bg + ';border:1px solid ' + s.border + ';color:' + s.color + ';padding:0.4rem 1rem;border-radius:20px;font-size:0.88rem;font-weight:600;">' + s.icon + ' ' + s.label + '</span>' +
            '<select class="status-changer filter-select" data-ids="' + idsAttr + '" style="font-size:0.82rem;padding:0.35rem 0.75rem;border-radius:20px;cursor:pointer;min-width:0;">' +
                '<option value="" disabled selected>Cambiar...</option>' +
                options +
            '</select>'
        );
    }

    function deliveryBadge(type) {
        var map = {
            shipping: { label: 'Envio a domicilio', icon: '🚚', bg: 'rgba(42,82,152,0.25)', border: 'rgba(100,140,255,0.5)', color: '#7da6ff' },
            pickup:   { label: 'Retiro en tienda',  icon: '🏪', bg: 'rgba(255,152,0,0.2)',  border: 'rgba(255,152,0,0.5)',   color: '#ff9800' },
        };
        var d = map[type] || { label: type, icon: '•', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.3)', color: 'white' };
        return '<span style="background:' + d.bg + ';border:1px solid ' + d.border + ';color:' + d.color + ';padding:0.4rem 1rem;border-radius:20px;font-size:0.88rem;font-weight:600;">' + d.icon + ' ' + d.label + '</span>';
    }

    // ─── Change status ────────────────────────────────────────
    async function changeStatus(saleIds, newStatus, selectEl) {
        selectEl.disabled = true;
        try {
            var res = await fetch('/api/sales/states', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: saleIds, status: newStatus })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            fetchSales(currentPage);
        } catch (err) {
            showError('No se pudo actualizar el estado: ' + err.message);
            selectEl.disabled = false;
        }
    }

    // ─── Sale card ────────────────────────────────────────────
    function renderSaleCard(sale) {
        var date        = formatDate(sale.date_cart);
        var products    = sale.products.map(renderProductPill).join('');
        var amountLabel = sale.amount + ' producto' + (sale.amount != 1 ? 's' : '');
        var saleIds     = sale.products.map(function(p) { return p.id_sale; });

        return (
            '<div class="purchase-item" style="animation:fadeIn 0.5s ease-out;">' +

                '<div class="purchase-header" style="flex-wrap:wrap;gap:0.75rem;">' +
                    '<span class="purchase-date">' + date + '</span>' +
                    '<div style="display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap;">' +
                        statusBadge(sale.status, saleIds) +
                        deliveryBadge(sale.delivery_type) +
                        '<span style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:white;padding:0.4rem 1rem;border-radius:20px;font-size:0.88rem;font-weight:500;">📦 ' + amountLabel + '</span>' +
                        '<span style="padding:0.4rem 1rem;border-radius:20px;border:1px solid rgba(0,255,58,0.4);background:rgba(0,255,58,0.1);color:#00ff3a;font-size:1.1rem;font-weight:bold;">' + formatCurrency(parseFloat(sale.total)) + '</span>' +
                    '</div>' +
                '</div>' +

                '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin:1rem 0;padding:1.25rem;background:rgba(255,255,255,0.07);border-radius:15px;border:1px solid rgba(255,255,255,0.1);">' +
                    buyerField('👤 Comprador',   sale.buyer_name) +
                    buyerField('✉️ Email',       sale.buyer_email) +
                    buyerField('🪪 DNI',         sale.buyer_dni) +
                    buyerField('📍 Dirección',   sale.street + ', ' + sale.city) +
                    buyerField('🏙️ Provincia',  sale.province) +
                    buyerField('📮 Cod. Postal', sale.postal_code) +
                '</div>' +

                '<div class="purchase-products" style="height:auto;flex-wrap:wrap;overflow:visible;padding:0.5rem 0 1rem;">' +
                    products +
                '</div>' +

            '</div>'
        );
    }

    function buyerField(label, value) {
        return (
            '<div>' +
                '<p style="color:rgba(255,255,255,0.55);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.25rem;">' + label + '</p>' +
                '<p style="color:white;font-weight:600;font-size:0.95rem;margin:0;">' + value + '</p>' +
            '</div>'
        );
    }

    function renderProductPill(product) {
        return (
            '<div class="purchase-product-card" style="height:auto;min-height:120px;padding:0;">' +
                '<div class="purchase-card-header">' +
                    '<p class="purchase-card-category">x' + product.quantity + '</p>' +
                '</div>' +
                '<div class="purchase-card-body" style="padding:0.5rem 1rem;">' +
                    '<p class="purchase-card-title" style="-webkit-line-clamp:3;">' + product.title + '</p>' +
                '</div>' +
                '<div class="purchase-card-footer">' +
                    '<p class="purchase-card-price">' + formatCurrency(product.price * product.quantity) + '</p>' +
                    '<p style="color:rgba(255,255,255,0.6);font-size:0.8rem;margin-top:0.2rem;">' + formatCurrency(product.price) + ' c/u</p>' +
                '</div>' +
            '</div>'
        );
    }

    // ─── Pagination (server-side) ─────────────────────────────
    function renderPagination() {
        if (totalPages <= 1) {
            paginationCont.style.display = 'none';
            return;
        }

        paginationCont.style.display = 'flex';
        var html = '';

        html += '<li class="page-item">' +
            '<button class="page-btn" ' + (!hasPrevPage ? 'disabled style="opacity:0.4;cursor:default;"' : '') + ' data-page="' + (currentPage - 1) + '">← Ant</button>' +
        '</li>';

        for (var i = 1; i <= totalPages; i++) {
            var activeStyle = i === currentPage ? 'background:rgba(255,255,255,0.4);font-weight:bold;' : '';
            html += '<li class="page-item">' +
                '<button class="page-btn" data-page="' + i + '" style="' + activeStyle + '">' + i + '</button>' +
            '</li>';
        }

        html += '<li class="page-item">' +
            '<button class="page-btn" ' + (!hasNextPage ? 'disabled style="opacity:0.4;cursor:default;"' : '') + ' data-page="' + (currentPage + 1) + '">Sig →</button>' +
        '</li>';

        paginationList.innerHTML = html;

        paginationList.querySelectorAll('.page-btn:not([disabled])').forEach(function(btn) {
            btn.addEventListener('click', function() {
                fetchSales(parseInt(btn.dataset.page));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // ─── UI helpers ───────────────────────────────────────────
    function showLoading() {
        container.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;padding:4rem;">' +
                '<div class="spinner"></div>' +
                '<p style="color:rgba(255,255,255,0.8);margin-top:1rem;">Cargando ventas...</p>' +
            '</div>';
        paginationCont.style.display = 'none';
    }

    function showError(msg) {
        errorText.textContent = msg;
        errorMessage.style.display = 'block';
        setTimeout(function() { errorMessage.style.display = 'none'; }, 4000);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
    }

    function formatDate(isoString) {
        return new Date(isoString).toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    // ─── Event listeners ──────────────────────────────────────
    function bindEvents() {
        searchInput.addEventListener('input',  applyFilters);
        sortSelect.addEventListener('change',  applyFilters);
        if (statusSelect) statusSelect.addEventListener('change', applyFilters);
        refreshBtn.addEventListener('click', function() { fetchSales(currentPage); });

        container.addEventListener('change', function(e) {
            if (e.target.classList.contains('status-changer')) {
                e.stopPropagation();
                var saleIds   = e.target.dataset.ids.split(',').map(Number);
                var newStatus = e.target.value;
                if (saleIds.length && newStatus) changeStatus(saleIds, newStatus, e.target);
            }
        });
    }

    // ─── Init ─────────────────────────────────────────────────
    function init() {
        bindEvents();
        fetchSales(1);
    }

    return { init: init };
})();

document.addEventListener('DOMContentLoaded', Sales.init);