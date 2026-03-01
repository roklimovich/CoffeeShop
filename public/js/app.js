// Main application file
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showAlert(type, message, containerId = 'mainContent') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '80px';
    alert.style.right = '20px';
    alert.style.zIndex = '1001';
    alert.style.minWidth = '300px';
    alert.style.fontFamily = '"Century Gothic", serif, Arial, sans-serif';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

async function renderHomePage() {
    const mainContent = document.getElementById('mainContent');
    
    // Load first 5 products
    let productsHtml = '<p>Loading products...</p>';
    try {
        const productsData = await api.getProducts(1, 5);
        const products = productsData.products || [];
        const canEdit = auth.hasRole('manager', 'admin');
        const isCustomer = auth.isAuthenticated() && !canEdit;
        
        if (products.length > 0) {
            productsHtml = `
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
                            </div>
                        </article>
                    `;
                    }).join('')}
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="#/menu" class="btn btn-primary" style="display: inline-block; padding: 12px 24px;">View Full Menu →</a>
                </div>
            `;
        } else {
            productsHtml = '<p>No products available.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsHtml = '<p>Unable to load products. <a href="#/menu">View menu</a></p>';
    }
    
    mainContent.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <section id="about" style="margin-bottom: 40px;">
                <h2 style="text-align: center;">Welcome to Maison du Café</h2>
                <p>We are a neighborhood coffee house dedicated to craft brewing and warm hospitality. From classic espresso to slow‑brew pour overs, our baristas bring out the best in every bean.</p>
                <p>Planning your first visit? Here is what to expect:</p>
                <ol>
                    <li>Greeted with a smile and aroma of freshly ground coffee.</li>
                    <li>Curated menu featuring signature drinks and seasonal specials.</li>
                    <li>Comfortable seating, soft music, and outlets for your laptop.</li>
                </ol>
            </section>
            <section id="menu" style="margin-bottom: 40px;">
                <h2 style="text-align: center;">Featured Products</h2>
                ${productsHtml}
            </section>
            <section id="loyalty" style="margin-bottom: 40px;">
                <h2 style="text-align: center;">Loyalty program</h2>
                <p>Collect stamps and enjoy free drinks and exclusive menu.</p>
                <ul>
                    <li>Buy 9 drinks, get the 10th free</li>
                    <li>Early access to seasonal menu</li>
                </ul>
            </section>
        </div>
    `;
}

// Initialize router
router.route('/', { callback: renderHomePage }); // Also handle root as home
router.route('/home', { callback: renderHomePage });
router.route('/menu', { callback: renderProductsPage, auth: false });
router.route('/products', { callback: renderProductsPage, auth: false }); // Keep for backwards compatibility
router.route('/products/:id', { callback: () => {
    const hash = window.location.hash.slice(1);
    const id = parseInt(hash.split('/')[2]);
    renderProductDetail(id);
}, auth: false });
router.route('/menu/:id', { callback: () => {
    const hash = window.location.hash.slice(1);
    const id = parseInt(hash.split('/')[2]);
    renderProductDetail(id);
}, auth: false });
router.route('/cart', { callback: renderCartPage, auth: true });
router.route('/orders', { callback: renderOrdersPage, auth: true });
router.route('/orders/create', { callback: showOrderForm, auth: true });
router.route('/orders/:id', { callback: () => {
    const hash = window.location.hash.slice(1);
    const id = parseInt(hash.split('/')[2]);
    renderOrderDetail(id);
}, auth: true });
router.route('/login', { callback: renderLoginPage, auth: false });
router.route('/register', { callback: renderRegisterPage, auth: false });

// Language switcher
document.getElementById('langEn').addEventListener('click', () => {
    i18n.setLang('en');
    document.getElementById('langEn').classList.add('active');
    document.getElementById('langPl').classList.remove('active');
});

document.getElementById('langPl').addEventListener('click', () => {
    i18n.setLang('pl');
    document.getElementById('langPl').classList.add('active');
    document.getElementById('langEn').classList.remove('active');
});

// Set active language button
if (i18n.getLang() === 'pl') {
    document.getElementById('langPl').classList.add('active');
} else {
    document.getElementById('langEn').classList.add('active');
}

// Update navigation active state
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('?')[0];
    
    document.querySelectorAll('.top-nav a[data-route]').forEach(link => {
        link.classList.remove('active');
        const route = link.getAttribute('data-route');
        if (route && (path === `/${route}` || (route === 'home' && (path === '/home' || path === '/')) || (route === 'menu' && path === '/menu') || (route === 'cart' && path.startsWith('/cart')))) {
            link.classList.add('active');
        }
    });
    
    // Update cart badge
    Cart.updateCartBadge();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    router.handleRoute();
    Cart.updateCartBadge();
});

// Update cart badge on navigation
window.addEventListener('hashchange', () => {
    Cart.updateCartBadge();
});

