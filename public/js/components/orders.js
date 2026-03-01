// Orders component
let currentOrderPage = 1;
let totalOrderPages = 1;

function renderOrdersPage() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <main class="content" style="max-width:1100px;margin:32px auto;padding:0 20px;">
            <section>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2>${i18n.t('orders.title')}</h2>
                    ${auth.isAuthenticated() ? `
                        <button class="btn-add-product" onclick="showOrderForm()">${i18n.t('orders.createOrder')}</button>
                    ` : ''}
                </div>
                <div id="ordersList"></div>
                <div id="ordersPagination" class="pagination"></div>
            </section>
        </main>
    `;
    
    loadOrders();
}

async function loadOrders(page = 1) {
    currentOrderPage = page;
    showLoading();
    
    try {
        const data = await api.getOrders(page, 10);
        renderOrdersList(data.orders);
        renderOrdersPagination(data.pagination);
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

function renderOrdersList(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = `<p>${i18n.t('orders.noOrders')}</p>`;
        return;
    }
    
    const canEdit = auth.hasRole('manager', 'admin');
    
    container.innerHTML = `
        <table class="specials-table">
            <thead>
                <tr>
                    <th>${i18n.t('orders.orderId')}</th>
                    ${auth.hasRole('manager', 'admin') ? `<th>${i18n.t('orders.customer')}</th>` : ''}
                    <th>${i18n.t('orders.status')}</th>
                    <th>${i18n.t('orders.total')}</th>
                    <th>${i18n.t('orders.date')}</th>
                    ${canEdit ? `<th>${i18n.t('products.actions')}</th>` : ''}
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td><a href="#/orders/${order.id}" style="color: var(--brand); text-decoration: none;">#${order.id}</a></td>
                        ${auth.hasRole('manager', 'admin') ? `<td>${order.user_name} (${order.user_email})</td>` : ''}
                        <td>${i18n.t(`orders.statuses.${order.status}`)}</td>
                        <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                        ${canEdit ? `
                            <td>
                                <button class="btn btn-secondary" onclick="editOrder(${order.id})" style="padding: 6px 12px; margin-right: 5px;">${i18n.t('common.edit')}</button>
                                ${auth.hasRole('admin') ? `
                                    <button class="btn btn-danger" onclick="deleteOrder(${order.id})" style="padding: 6px 12px;">${i18n.t('common.delete')}</button>
                                ` : ''}
                            </td>
                        ` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderOrdersPagination(pagination) {
    const container = document.getElementById('ordersPagination');
    totalOrderPages = pagination.totalPages;
    
    if (totalOrderPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <button onclick="loadOrders(${currentOrderPage - 1})" ${currentOrderPage === 1 ? 'disabled' : ''}>
            ${i18n.t('common.previous')}
        </button>
        <span>${i18n.t('common.page')} ${currentOrderPage} ${i18n.t('common.of')} ${totalOrderPages}</span>
        <button onclick="loadOrders(${currentOrderPage + 1})" ${currentOrderPage === totalOrderPages ? 'disabled' : ''}>
            ${i18n.t('common.next')}
        </button>
    `;
}

function renderOrderDetail(id) {
    const mainContent = document.getElementById('mainContent');
    showLoading();
    
    api.getOrder(id)
        .then(data => {
            const order = data.order;
            const items = data.items;
            
            mainContent.innerHTML = `
                <main class="content" style="max-width:1100px;margin:32px auto;padding:0 20px;">
                    <section>
                        <button class="btn btn-secondary mb-2" onclick="router.goBack()" style="margin-bottom: 1rem;">${i18n.t('common.back')}</button>
                        <h2>${i18n.t('orders.orderId')} #${order.id}</h2>
                        <div class="card" style="margin-bottom: 2rem;">
                            <div class="card-body">
                                ${auth.hasRole('manager', 'admin') ? `<p><strong>${i18n.t('orders.customer')}:</strong> ${order.user_name}</p>` : ''}
                                <p><strong>${i18n.t('orders.status')}:</strong> ${i18n.t(`orders.statuses.${order.status}`)}</p>
                                <p class="price"><strong>${i18n.t('orders.total')}:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
                                <p><strong>${i18n.t('orders.date')}:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <h3>${i18n.t('orders.items')}</h3>
                        ${items && items.length > 0 ? `
                        <table class="specials-table">
                            <thead>
                                <tr>
                                    <th>${i18n.t('products.name')}</th>
                                    <th>${i18n.t('orders.quantity')}</th>
                                    <th>${i18n.t('orders.unitPrice')}</th>
                                    <th>${i18n.t('orders.subtotal')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr>
                                        <td>${item.product_name || 'Unknown Product'}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : `<p>No items found in this order.</p>`}
                    </section>
                </main>
            `;
        })
        .catch(error => {
            showAlert('error', error.message);
            router.navigate('#/orders');
        })
        .finally(() => hideLoading());
}

window.showOrderForm = async function() {
    showLoading();
    try {
        const productsData = await api.getProducts(1, 100);
        const products = productsData.products;
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <main class="content auth-container">
                <div class="auth-box">
                    <h2>${i18n.t('orders.createOrder')}</h2>
                    <form id="orderForm" class="auth-form" onsubmit="saveOrder(event)">
                        <div id="orderItems">
                            <div class="order-item">
                                <select name="product_id" required>
                                    <option value="">${i18n.t('products.name')}</option>
                                    ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} - $${parseFloat(p.price).toFixed(2)}</option>`).join('')}
                                </select>
                                <input type="number" name="quantity" min="1" value="1" required style="width: 100px;">
                                <button type="button" class="btn btn-danger" onclick="removeOrderItem(this)">${i18n.t('common.delete')}</button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="addOrderItem()" style="width: 100%; margin-bottom: 15px;">${i18n.t('common.add')} ${i18n.t('orders.items')}</button>
                        <button type="submit" class="auth-btn">${i18n.t('common.create')}</button>
                        <button type="button" class="btn btn-secondary" onclick="router.goBack()" style="margin-top: 10px; width: 100%;">${i18n.t('common.cancel')}</button>
                    </form>
                </div>
            </main>
        `;
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

window.addOrderItem = function() {
    const container = document.getElementById('orderItems');
    const firstItem = container.querySelector('.order-item');
    const select = firstItem.querySelector('select');
    const options = Array.from(select.options).slice(1).map(opt => opt.outerHTML).join('');
    
    const newItem = document.createElement('div');
    newItem.className = 'order-item';
    newItem.innerHTML = `
        <select name="product_id" required>
            <option value="">${i18n.t('products.name')}</option>
            ${options}
        </select>
        <input type="number" name="quantity" min="1" value="1" required style="width: 100px;">
        <button type="button" class="btn btn-danger" onclick="removeOrderItem(this)">${i18n.t('common.delete')}</button>
    `;
    container.appendChild(newItem);
}

window.removeOrderItem = function(btn) {
    const items = document.querySelectorAll('.order-item');
    if (items.length > 1) {
        btn.closest('.order-item').remove();
    }
}

window.saveOrder = async function(event) {
    event.preventDefault();
    const form = event.target;
    const items = Array.from(form.querySelectorAll('.order-item')).map(item => ({
        product_id: parseInt(item.querySelector('select').value),
        quantity: parseInt(item.querySelector('input[type="number"]').value)
    })).filter(item => item.product_id);
    
    if (items.length === 0) {
        showAlert('error', 'Order must contain at least one item');
        return;
    }
    
    showLoading();
    try {
        await api.createOrder({ items });
        showAlert('success', i18n.t('orders.createSuccess'));
        router.navigate('#/orders');
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

async function editOrder(id) {
    showLoading();
    try {
        const data = await api.getOrder(id);
        const order = data.order;
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <main class="content auth-container">
                <div class="auth-box">
                    <h2>${i18n.t('orders.editOrder')}</h2>
                    <form id="orderUpdateForm" class="auth-form" onsubmit="updateOrder(event, ${order.id})">
                        <label>${i18n.t('orders.status')}</label>
                        <select name="status" required style="padding: 12px 14px; border-radius: 10px; border: 1px solid #ccc;">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>${i18n.t('orders.statuses.pending')}</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>${i18n.t('orders.statuses.processing')}</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>${i18n.t('orders.statuses.completed')}</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>${i18n.t('orders.statuses.cancelled')}</option>
                        </select>
                        <button type="submit" class="auth-btn">${i18n.t('common.update')}</button>
                        <button type="button" class="btn btn-secondary" onclick="router.goBack()" style="margin-top: 10px; width: 100%;">${i18n.t('common.cancel')}</button>
                    </form>
                </div>
            </main>
        `;
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

async function updateOrder(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    showLoading();
    try {
        await api.updateOrder(id, { status: formData.get('status') });
        showAlert('success', i18n.t('orders.updateSuccess'));
        router.navigate('#/orders');
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }
    
    showLoading();
    try {
        await api.deleteOrder(id);
        showAlert('success', i18n.t('orders.deleteSuccess'));
        loadOrders(currentOrderPage);
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

// Update UI on language change
window.addEventListener('langchange', () => {
    if (router.currentRoute === '/orders' || router.currentRoute?.startsWith('/orders/')) {
        renderOrdersPage();
    }
});

