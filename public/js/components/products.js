// Products component
let currentPage = 1;
let totalPages = 1;

function renderProductsPage() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="layout">
            <main class="content">
                <section>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2>${i18n.t('products.title')}</h2>
                        ${auth.hasRole('manager', 'admin') ? `
                            <button class="btn-add-product" onclick="showProductForm()">${i18n.t('products.addProduct')}</button>
                        ` : ''}
                    </div>
                    <div id="productsList"></div>
                    <div id="productsPagination" class="pagination"></div>
                </section>
            </main>
        </div>
    `;
    
    loadProducts();
}

async function loadProducts(page = 1) {
    currentPage = page;
    showLoading();
    
    try {
        const data = await api.getProducts(page, 10);
        renderProductsList(data.products);
        renderPagination(data.pagination);
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

function renderProductsList(products) {
    const container = document.getElementById('productsList');
    
    if (products.length === 0) {
        container.innerHTML = `<p>${i18n.t('products.noProducts')}</p>`;
        return;
    }
    
    const canEdit = auth.hasRole('manager', 'admin');
    const isCustomer = auth.isAuthenticated() && !canEdit;
    
    // Use card grid for better visual presentation matching existing design
    container.innerHTML = `
        <div class="card-grid">
            ${products.map(product => {
                const hasImage = product.image_url && product.image_url.trim() !== '';
                return `
                <article class="card">
                    ${hasImage ? `<img src="${product.image_url}" alt="${product.name}" class="product-card-image" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'140\'%3E%3Crect fill=\'%23f0f0f0\' width=\'300\' height=\'140\'/%3E%3Ctext fill=\'%23999\' font-family=\'sans-serif\' font-size=\'14\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3EImage not available%3C/text%3E%3C/svg%3E';">` : ''}
                    <div class="card-body">
                        <h3><a href="#/menu/${product.id}" style="color: var(--brand); text-decoration: none;">${product.name}</a></h3>
                        <p>${product.description || ''}</p>
                        <p><strong>${i18n.t('products.category')}:</strong> ${product.category}</p>
                        <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                        ${isCustomer ? `
                            <button class="btn btn-primary" onclick="addToCart(${product.id}, '${String(product.name).replace(/'/g, "\\'").replace(/"/g, '&quot;')}', ${parseFloat(product.price)})" style="width: 100%; margin-top: 1rem; padding: 10px;">Add to Cart</button>
                        ` : ''}
                        ${canEdit ? `
                            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                                <button class="btn btn-secondary" onclick="editProduct(${product.id})" style="flex: 1; padding: 8px;">${i18n.t('common.edit')}</button>
                                <button class="btn btn-danger" onclick="deleteProduct(${product.id})" style="flex: 1; padding: 8px;">${i18n.t('common.delete')}</button>
                            </div>
                        ` : ''}
                    </div>
                </article>
            `;
            }).join('')}
        </div>
    `;
    
    // Debug: Log products to see if image_url is present (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Products loaded:', products.map(p => ({ id: p.id, name: p.name, image_url: p.image_url, hasImage: !!(p.image_url && p.image_url.trim()) })));
    }
}

function renderPagination(pagination) {
    const container = document.getElementById('productsPagination');
    totalPages = pagination.totalPages;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <button onclick="loadProducts(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            ${i18n.t('common.previous')}
        </button>
        <span>${i18n.t('common.page')} ${currentPage} ${i18n.t('common.of')} ${totalPages}</span>
        <button onclick="loadProducts(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            ${i18n.t('common.next')}
        </button>
    `;
}

function renderProductDetail(id) {
    const mainContent = document.getElementById('mainContent');
    showLoading();
    
    api.getProduct(id)
        .then(data => {
            const product = data.product;
            mainContent.innerHTML = `
                <main class="content" style="max-width:1100px;margin:32px auto;padding:0 20px;">
                    <section>
                        <button class="btn btn-secondary mb-2" onclick="router.navigate('#/menu')" style="margin-bottom: 1rem;">${i18n.t('common.back')}</button>
                        <div class="card">
                            ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" onerror="this.style.display='none'">` : ''}
                            <div class="card-body">
                                <h2>${product.name}</h2>
                                <p><strong>${i18n.t('products.description')}:</strong> ${product.description || 'N/A'}</p>
                                <p><strong>${i18n.t('products.category')}:</strong> ${product.category}</p>
                                <p class="price"><strong>${i18n.t('products.price')}:</strong> $${parseFloat(product.price).toFixed(2)}</p>
                                <p><strong>${i18n.t('products.stock')}:</strong> ${product.stock_quantity}</p>
                                <p><strong>Created:</strong> ${new Date(product.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </section>
                </main>
            `;
        })
        .catch(error => {
            showAlert('error', error.message);
            router.navigate('#/menu');
        })
        .finally(() => hideLoading());
}

function showProductForm(product = null) {
    const mainContent = document.getElementById('mainContent');
    const isEdit = product !== null;
    
    mainContent.innerHTML = `
        <main class="content auth-container">
            <div class="auth-box">
                <h2>${isEdit ? i18n.t('products.editProduct') : i18n.t('products.addProduct')}</h2>
                <form id="productForm" class="auth-form" onsubmit="saveProduct(event, ${product?.id || 'null'})">
                    <label>${i18n.t('products.name')} *</label>
                    <input type="text" name="name" value="${product?.name || ''}" required>
                    <span class="error" id="nameError"></span>
                    <label>${i18n.t('products.description')}</label>
                    <textarea name="description">${product?.description || ''}</textarea>
                    <label>Image URL</label>
                    <input type="url" name="image_url" value="${product?.image_url || ''}" placeholder="https://example.com/image.jpg">
                    <span class="error" id="imageError"></span>
                    ${product?.image_url ? `<div style="margin-top: 10px;"><img src="${product.image_url}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid #ccc;" onerror="this.style.display='none'"></div>` : ''}
                    <label>${i18n.t('products.price')} *</label>
                    <input type="number" step="0.01" min="0" name="price" value="${product?.price || ''}" required>
                    <span class="error" id="priceError"></span>
                    <label>${i18n.t('products.category')} *</label>
                    <input type="text" name="category" value="${product?.category || ''}" required>
                    <span class="error" id="categoryError"></span>
                    <label>${i18n.t('products.stock')} *</label>
                    <input type="number" min="0" name="stock_quantity" value="${product?.stock_quantity || ''}" required>
                    <span class="error" id="stockError"></span>
                    <button type="submit" class="auth-btn">${i18n.t('common.save')}</button>
                    <button type="button" class="btn btn-secondary" onclick="router.goBack()" style="margin-top: 10px; width: 100%;">${i18n.t('common.cancel')}</button>
                </form>
            </div>
        </main>
    `;
    
    // Add live preview for image URL
    const imageInput = document.querySelector('input[name="image_url"]');
    if (imageInput) {
        imageInput.addEventListener('input', function() {
            const preview = document.querySelector('#productForm img');
            if (this.value && this.value.startsWith('http')) {
                if (!preview) {
                    const img = document.createElement('img');
                    img.alt = 'Preview';
                    img.style.cssText = 'max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid #ccc; margin-top: 10px; display: block;';
                    img.onerror = function() { this.style.display = 'none'; };
                    imageInput.parentElement.appendChild(img);
                    img.src = this.value;
                } else {
                    preview.src = this.value;
                    preview.style.display = 'block';
                }
            } else if (preview) {
                preview.style.display = 'none';
            }
        });
    }
}

async function saveProduct(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        image_url: formData.get('image_url') || null,
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        stock_quantity: parseInt(formData.get('stock_quantity'))
    };
    
    // Client-side validation
    if (!validateProduct(productData)) {
        return;
    }
    
    showLoading();
    
    try {
        if (id) {
            await api.updateProduct(id, productData);
            showAlert('success', i18n.t('products.updateSuccess'));
        } else {
            await api.createProduct(productData);
            showAlert('success', i18n.t('products.createSuccess'));
        }
        router.navigate('#/products');
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

function validateProduct(data) {
    let isValid = true;
    
    if (!data.name || data.name.length < 1) {
        document.getElementById('nameError').textContent = i18n.t('common.required');
        isValid = false;
    }
    
    if (data.price < 0) {
        document.getElementById('priceError').textContent = i18n.t('common.minValue', { min: 0 });
        isValid = false;
    }
    
    if (!data.category || data.category.length < 1) {
        document.getElementById('categoryError').textContent = i18n.t('common.required');
        isValid = false;
    }
    
    if (data.stock_quantity < 0) {
        document.getElementById('stockError').textContent = i18n.t('common.minValue', { min: 0 });
        isValid = false;
    }
    
    return isValid;
}

async function editProduct(id) {
    showLoading();
    try {
        const data = await api.getProduct(id);
        showProductForm(data.product);
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    showLoading();
    try {
        await api.deleteProduct(id);
        showAlert('success', i18n.t('products.deleteSuccess'));
        loadProducts(currentPage);
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
}

// Add to cart function for customers - make it global
window.addToCart = function(productId, productName, productPrice) {
    if (!auth.isAuthenticated()) {
        showAlert('error', 'Please login to add items to cart');
        router.navigate('#/login');
        return;
    }
    
    // Get full product details if available
    const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image_url: null
    };
    
    // Try to get image from the card if available
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
        const img = card.querySelector('img');
        if (img && img.src) {
            product.image_url = img.src;
        }
    }
    
    Cart.addItem(product);
    showAlert('success', `${productName} added to cart!`);
}

// Update UI on language change
window.addEventListener('langchange', () => {
    if (router.currentRoute === '/products' || router.currentRoute === '/menu' || router.currentRoute?.startsWith('/products/') || router.currentRoute?.startsWith('/menu/')) {
        renderProductsPage();
    }
});

