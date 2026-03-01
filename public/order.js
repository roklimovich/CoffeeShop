(function() {
    'use strict';
    
    var cart = [];
    var cartSection = document.getElementById('order-cart');
    var cartItems = document.getElementById('cart-items');
    var cartTotal = document.getElementById('cart-total');
    var placeOrderBtn = document.getElementById('placeOrderBtn');
    var clearCartBtn = document.getElementById('clearCartBtn');
    var clickableCards = document.querySelectorAll('.clickable-card');
    
    function updateCart() {
        if (!cartSection || !cartItems || !cartTotal) return;
        
        if (cart.length === 0) {
            cartSection.style.display = 'none';
            return;
        }
        
        cartSection.style.display = 'block';
        cartItems.innerHTML = '';
        
        cart.forEach(function(item, index) {
            var itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = 
                '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-image">' +
                '<div class="cart-item-info">' +
                    '<h4>' + item.name + '</h4>' +
                    '<p class="cart-item-price">$' + item.price.toFixed(2) + '</p>' +
                '</div>' +
                '<button class="cart-remove" data-index="' + index + '" type="button">✕</button>';
            cartItems.appendChild(itemDiv);
        });
        
        var total = cart.reduce(function(sum, item) {
            return sum + parseFloat(item.price);
        }, 0);
        cartTotal.textContent = total.toFixed(2);
        
        var removeButtons = document.querySelectorAll('.cart-remove');
        removeButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var index = parseInt(btn.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCart();
            });
        });
    }
    
    function addToCart(productId, name, price, image) {
        cart.push({
            id: productId,
            name: name,
            price: parseFloat(price),
            image: image
        });
        updateCart();
    }
    
    clickableCards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('cart-remove')) return;
            
            var productId = card.getAttribute('data-product-id');
            var productName = card.getAttribute('data-product-name');
            var productPrice = card.getAttribute('data-product-price');
            var productImage = card.getAttribute('data-product-image');
            
            addToCart(productId, productName, productPrice, productImage);
            
            card.style.transform = 'scale(0.95)';
            setTimeout(function() {
                card.style.transform = '';
            }, 200);
        });
    });
    
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Your cart is empty. Please add items to your order.');
                return;
            }
            
            if (typeof window.showQuiz === 'function') {
                window.showQuiz();
            } else {
                var overlay = document.getElementById('quizOverlay');
                if (overlay) {
                    overlay.classList.add('show');
                }
            }
        });
    }
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            cart = [];
            updateCart();
        });
    }
    
    updateCart();
})();

