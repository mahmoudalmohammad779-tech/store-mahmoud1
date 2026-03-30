// ========================================
// CART MODULE - MANAGING SHOPPING CART
// ========================================

// هاد الملف مسؤول عن إدارة سلة التسوق
// بنضيف وننحذف المنتجات وبنحدّث السلة
// هون بتتم جميع عمليات السلة و LocalStorage

const Cart = {
    // هاد ثابت عشان نتخزن البيانات في localStorage
    STORAGE_KEY: 'techWatchStoreCart',
    DISCOUNT_CODES: {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'SAVE50': 0.50
    },

    // هاد الدالة بتزيف المنتج للسلة
    // بنخزنه في localStorage ونحدّث الـ count
    addToCart(product, quantity = 1) {
        // احصل على السلة الحالية من localStorage
        let cart = this.getCart();

        // ابحث عن المنتج في السلة
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            // إذا موجود، زيد الكمية
            existingItem.quantity += quantity;
        } else {
            // إذا ما موجود، أضفه
            cart.push({
                ...product,
                quantity: quantity
            });
        }

        // احفظ السلة المحدثة في localStorage
        this.saveCart(cart);

        // حدّث عدد العناصر في الـ navbar
        this.updateCartCount();
    },

    // هاد الدالة بتشيل المنتج من السلة
    removeFromCart(productId) {
        // احصل على السلة
        let cart = this.getCart();

        // صفّي المنتج المطلوب حذفه
        cart = cart.filter(item => item.id !== productId);

        // احفظ السلة المحدثة
        this.saveCart(cart);

        // حدّث الـ display
        this.displayCart();
        this.updateCartCount();
    },

    // هاد الدالة بتحدّث كمية المنتج
    updateQuantity(productId, quantity) {
        // احصل على السلة
        let cart = this.getCart();

        // ابحث عن المنتج وحدّث الكمية
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
        }

        // احفظ السلة المحدثة
        this.saveCart(cart);

        // حدّث الـ display
        this.displayCart();
    },

    // هاد الدالة بترجع السلة من localStorage
    getCart() {
        const cart = localStorage.getItem(this.STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    // هاد الدالة بتحفظ السلة في localStorage
    saveCart(cart) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    },

    // هاد الدالة بتشيل جميع عناصر السلة
    clearCart() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.updateCartCount();
    },

    // هاد الدالة بتحدّث عدد العناصر في الـ navbar
    updateCartCount() {
        const cart = this.getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCountElements = document.querySelectorAll('#cartCount');
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
        });
    },

    // هاد الدالة بتحسب الإجمالي
    // (subtotal, tax, shipping, total)
    calculateTotals() {
        const cart = this.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // احسب الضريبة (8%)
        const tax = subtotal * 0.08;
        
        // احسب الشحن (مجاني إذا أكثر من 100)
        const shipping = subtotal > 100 ? 0 : 10;
        
        // احسب الخصم إذا وجد
        let discount = 0;
        const discountCode = document.getElementById('discountCode')?.value;
        if (discountCode && this.DISCOUNT_CODES[discountCode]) {
            discount = subtotal * this.DISCOUNT_CODES[discountCode];
        }
        
        const total = subtotal + tax + shipping - discount;

        return {
            subtotal: Math.max(0, subtotal),
            tax: Math.max(0, tax),
            shipping: Math.max(0, shipping),
            discount: Math.max(0, discount),
            total: Math.max(0, total)
        };
    },

    // هاد الدالة بتطبّق كود الخصم
    applyDiscount() {
        const discountCode = document.getElementById('discountCode').value.toUpperCase();
        
        if (!discountCode) {
            UI.showToast('Please enter a discount code', 'warning');
            return;
        }

        if (this.DISCOUNT_CODES[discountCode]) {
            UI.showToast(`Discount code "${discountCode}" applied! ✅`, 'success');
            this.displayCart();
        } else {
            UI.showToast('Invalid discount code', 'error');
        }
    },

    // هاد الدالة بتعرض السلة على الشاشة
    displayCart() {
        const cart = this.getCart();
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.style.display = 'none';
            emptyCart.style.display = 'block';
            this.updateCartSummary();
            return;
        }

        cartItemsContainer.style.display = 'block';
        emptyCart.style.display = 'none';

        // اعرض كل منتج في السلة
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="decrease-qty" data-product-id="${item.id}">−</button>
                    <input type="number" value="${item.quantity}" min="1" 
                           class="qty-input" data-product-id="${item.id}">
                    <button class="increase-qty" data-product-id="${item.id}">+</button>
                </div>
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-item-btn" data-product-id="${item.id}">Remove</button>
            </div>
        `).join('');

        // اربط أحداث السلة
        this.attachCartEventListeners();

        // حدّث الملخص
        this.updateCartSummary();
    },

    // هاد الدالة بتربط أحداث السلة
    attachCartEventListeners() {
        // أزرار زيادة الكمية
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.productId);
                const input = document.querySelector(
                    `.qty-input[data-product-id="${productId}"]`
                );
                const newQuantity = parseInt(input.value) + 1;
                this.updateQuantity(productId, newQuantity);
            });
        });

        // أزرار تنقيص الكمية
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.productId);
                const input = document.querySelector(
                    `.qty-input[data-product-id="${productId}"]`
                );
                const newQuantity = parseInt(input.value) - 1;
                if (newQuantity >= 1) {
                    this.updateQuantity(productId, newQuantity);
                }
            });
        });

        // تحديث الكمية مباشرة من الـ input
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const newQuantity = parseInt(e.target.value);
                if (newQuantity >= 1) {
                    this.updateQuantity(productId, newQuantity);
                }
            });
        });

        // أزرار الحذف
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.productId);
                this.removeFromCart(productId);
                UI.showToast('Item removed from cart', 'success');
            });
        });
    },

    // هاد الدالة بتحدّث ملخص الطلب
    updateCartSummary() {
        const totals = this.calculateTotals();

        const elements = {
            'subtotal': document.getElementById('subtotal'),
            'shipping': document.getElementById('shipping'),
            'tax': document.getElementById('tax'),
            'total': document.getElementById('total')
        };

        if (elements.subtotal) elements.subtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
        if (elements.shipping) elements.shipping.textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`;
        if (elements.tax) elements.tax.textContent = `$${totals.tax.toFixed(2)}`;
        if (elements.total) elements.total.textContent = `$${totals.total.toFixed(2)}`;
    }
};