// Cart component
function renderCartPage() {
    const mainContent = document.getElementById('mainContent');
    const cart = Cart.getCart();
    
    if (cart.length === 0) {
        mainContent.innerHTML = `
            <main class="content" style="max-width: 1200px; margin: 0 auto; padding: 20px; text-align: center;">
                <h2>Your Cart</h2>
                <p style="font-size: 1.2em; color: var(--muted); margin: 40px 0;">Your cart is empty</p>
                <a href="#/menu" class="btn btn-primary">Browse Products</a>
            </main>
        `;
        return;
    }
    
    const total = Cart.getTotal();
    
    mainContent.innerHTML = `
        <main class="content" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <h2 style="text-align: center; margin-bottom: 30px;">Your Cart</h2>
            <div id="cartItemsList"></div>
            <div style="max-width: 600px; margin: 30px auto; padding: 20px; background: white; border-radius: 12px; border: 2px solid var(--brand);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 1.3em;">
                    <strong>Total:</strong>
                    <strong class="price">$${total.toFixed(2)}</strong>
                </div>
                <button class="btn btn-primary" onclick="checkoutCart()" style="width: 100%; padding: 15px; font-size: 1.1em; margin-bottom: 10px;">Checkout</button>
                <button class="btn btn-secondary" onclick="clearCart()" style="width: 100%; padding: 15px;">Clear Cart</button>
            </div>
        </main>
    `;
    
    renderCartItems(cart);
}

function renderCartItems(cart) {
    const container = document.getElementById('cartItemsList');
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item-card">
            ${item.product_image ? `<img src="${item.product_image}" alt="${item.product_name}" class="cart-item-image" onerror="this.style.display='none'">` : '<div class="cart-item-image" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>'}
            <div class="cart-item-details">
                <h3 style="margin: 0 0 5px 0;">${item.product_name}</h3>
                <p style="margin: 0; color: var(--muted);">$${parseFloat(item.product_price).toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button onclick="updateCartQuantity(${item.product_id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.product_id}, parseInt(this.value))">
                    <button onclick="updateCartQuantity(${item.product_id}, ${item.quantity + 1})">+</button>
                </div>
                <p class="price" style="margin: 0; min-width: 80px; text-align: right;">$${(parseFloat(item.product_price) * item.quantity).toFixed(2)}</p>
                <button class="btn btn-danger" onclick="removeFromCart(${item.product_id})" style="padding: 8px 12px;">Remove</button>
            </div>
        </div>
    `).join('');
}

window.updateCartQuantity = function(productId, quantity) {
    Cart.updateQuantity(productId, quantity);
    renderCartPage();
};

window.removeFromCart = function(productId) {
    Cart.removeItem(productId);
    renderCartPage();
};

window.clearCart = function() {
    if (confirm('Are you sure you want to clear your cart?')) {
        Cart.clearCart();
        renderCartPage();
    }
};

window.checkoutCart = async function() {
    if (!auth.isAuthenticated()) {
        showAlert('error', 'Please login to checkout');
        router.navigate('#/login');
        return;
    }
    
    const cart = Cart.getCart();
    if (cart.length === 0) {
        showAlert('error', 'Your cart is empty');
        return;
    }
    
    // Convert cart items to order format
    const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
    }));
    
    showLoading();
    try {
        await api.createOrder({ items });
        Cart.clearCart();
        showAlert('success', 'Order placed successfully!');
        router.navigate('#/orders');
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        hideLoading();
    }
};

