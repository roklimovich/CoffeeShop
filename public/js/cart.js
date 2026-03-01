// Cart management system
const Cart = {
    getCart() {
        const cartJson = localStorage.getItem('cart');
        return cartJson ? JSON.parse(cartJson) : [];
    },

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    addItem(product) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.product_id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                product_id: product.id,
                product_name: product.name,
                product_price: product.price,
                product_image: product.image_url || null,
                quantity: 1
            });
        }
        
        this.saveCart(cart);
        this.updateCartBadge();
        return cart;
    },

    removeItem(productId) {
        const cart = this.getCart();
        const filtered = cart.filter(item => item.product_id !== productId);
        this.saveCart(filtered);
        this.updateCartBadge();
        return filtered;
    },

    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.product_id === productId);
        
        if (item) {
            if (quantity <= 0) {
                return this.removeItem(productId);
            }
            item.quantity = quantity;
        }
        
        this.saveCart(cart);
        this.updateCartBadge();
        return cart;
    },

    clearCart() {
        this.saveCart([]);
        this.updateCartBadge();
    },

    getTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => {
            return total + (parseFloat(item.product_price) * item.quantity);
        }, 0);
    },

    getItemCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    },

    updateCartBadge() {
        const count = this.getItemCount();
        const badge = document.getElementById('cartBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }
};

// Initialize cart badge on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        Cart.updateCartBadge();
    });
}

