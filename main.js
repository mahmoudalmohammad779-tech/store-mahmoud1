// ========================================
// TECH & WATCH STORE - MAIN APPLICATION
// ========================================

// هاد الملف مسؤول عن تهيئة التطبيق الرئيسي
// بنحمل البيانات من JSON ونبدء التطبيق
// هون بيصير التكامل بين جميع الأجزاء

class TechWatchStore {
    constructor() {
        // تهيئة متغيرات البيانات الأساسية
        this.products = [];
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // هاد الفنكشن بيبدء التطبيق
    async init() {
        try {
            // حمل البيانات من ملف JSON
            await this.loadProducts();
            
            // حدّث عدد العناصر في السلة
            Cart.updateCartCount();
            
            // حمّل الصفحة الحالية
            this.loadCurrentPage();
            
            // ربّط الأحداث العامة
            this.attachGlobalEvents();
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    // حمّل المنتجات من ملف JSON
    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Failed to load products');
            this.products = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showToast('Error loading products', 'error');
        }
    }

    // احصل على الصفحة الحالية من عنوان URL
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('cart')) return 'cart';
        if (path.includes('product.html')) return 'product';
        if (path.includes('products')) return 'products';
        return 'home';
    }

    // حمّل محتوى الصفحة الحالية
    loadCurrentPage() {
        switch (this.currentPage) {
            case 'home':
                this.loadHomePage();
                break;
            case 'products':
                this.loadProductsPage();
                break;
            case 'product':
                this.loadProductPage();
                break;
            case 'cart':
                this.loadCartPage();
                break;
        }
    }

    // حمّل صفحة الرئيسية
    loadHomePage() {
        const featuredProducts = this.products.slice(0, 6);
        const grid = document.getElementById('featuredProducts');
        
        if (grid) {
            grid.innerHTML = featuredProducts
                .map(product => Products.createProductCard(product))
                .join('');
            
            // اربط الأزرار
            this.attachAddToCartButtons();
        }

        // ربط أزرار الفئات
        this.attachCategoryButtons();
    }

    // حمّل صفحة المنتجات
    loadProductsPage() {
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = this.products
                .map(product => Products.createProductCard(product))
                .join('');
            
            this.attachAddToCartButtons();
        }
    }

    // حمّل صفحة المنتج الواحد
    loadProductPage() {
        const productId = Router.getProductIdFromURL();
        const product = this.products.find(p => p.id === productId);
        
        if (!product) {
            window.location.href = 'products.html';
            return;
        }

        const detail = document.getElementById('productDetail');
        if (detail) {
            detail.innerHTML = Products.createProductDetail(product);
            
            // اربط الزر والكمية
            this.attachProductDetailEvents(product);
        }

        // حمّل المنتجات ذات الصلة
        this.loadRelatedProducts(product.category);
    }

    // حمّل المنتجات المرتبطة
    loadRelatedProducts(category) {
        const related = this.products
            .filter(p => p.category === category)
            .slice(0, 4);
        
        const container = document.getElementById('relatedProducts');
        if (container) {
            container.innerHTML = related
                .map(product => Products.createProductCard(product))
                .join('');
            
            this.attachAddToCartButtons();
        }
    }

    // حمّل صفحة السلة
    loadCartPage() {
        Cart.displayCart();
    }

    // اربط أحداث إضافة للسلة
    attachAddToCartButtons() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = parseInt(btn.dataset.productId);
                const product = this.products.find(p => p.id === productId);
                
                if (product) {
                    Cart.addToCart(product);
                    UI.animateAddToCart(btn);
                }
            });
        });
    }

    // اربط أزرار الفئات
    attachCategoryButtons() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                window.location.href = `products.html?category=${category}`;
            });
        });
    }

    // اربط الأحداث لصفحة المنتج
    attachProductDetailEvents(product) {
        const addBtn = document.querySelector('.add-to-cart-btn-detail');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const quantity = parseInt(
                    document.querySelector('.quantity-selector input').value || 1
                );
                
                Cart.addToCart(product, quantity);
                UI.animateAddToCart(addBtn);
            });
        }

        // أزرار الكمية
        const minusBtn = document.querySelector('.quantity-selector .minus-btn');
        const plusBtn = document.querySelector('.quantity-selector .plus-btn');
        const quantityInput = document.querySelector('.quantity-selector input');

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                const current = parseInt(quantityInput.value);
                if (current > 1) quantityInput.value = current - 1;
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                const current = parseInt(quantityInput.value);
                if (current < product.stock) quantityInput.value = current + 1;
            });
        }
    }

    // اربط الأحداث العامة
    attachGlobalEvents() {
        // زر الصعود للأعلى
        UI.setupScrollToTopButton();

        // البحث والتصفية (إن وجدوا)
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                Products.handleSearch();
            });
        }

        // الترتيب
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                Products.handleSort();
            });
        }

        // التصفية حسب الفئة
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('change', () => {
                Products.handleFilterChange();
            });
        });

        // التصفية حسب السعر
        const priceFilter = document.getElementById('priceFilter');
        if (priceFilter) {
            priceFilter.addEventListener('input', (e) => {
                document.getElementById('priceValue').textContent = 
                    `$${e.target.value}`;
                Products.handleFilterChange();
            });
        }

        // التصفية حسب التقييم
        document.querySelectorAll('.rating-filter').forEach(filter => {
            filter.addEventListener('change', () => {
                Products.handleFilterChange();
            });
        });

        // إعادة تعيين الفلاتر
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                Products.resetFilters();
            });
        }

        // النشرة الإخبارية
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit();
            });
        }

        // الخصم
        const applyDiscountBtn = document.getElementById('applyDiscount');
        if (applyDiscountBtn) {
            applyDiscountBtn.addEventListener('click', () => {
                Cart.applyDiscount();
            });
        }

        // زر الدفع
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.handleCheckout();
            });
        }
    }

    // معالج النشرة الإخبارية
    handleNewsletterSubmit() {
        const email = document.querySelector('.newsletter-form input').value;
        if (email) {
            this.showToast('Thank you for subscribing! 📧', 'success');
            document.querySelector('.newsletter-form input').value = '';
        }
    }

    // معالج الدفع
    handleCheckout() {
        const cart = Cart.getCart();
        if (cart.length === 0) {
            this.showToast('Your cart is empty', 'error');
            return;
        }

        this.showToast('Processing your order... 🎉', 'success');
        
        // محاكاة معالجة الطلب
        setTimeout(() => {
            Cart.clearCart();
            this.showToast('Order placed successfully! ✅', 'success');
            window.location.href = 'index.html';
        }, 2000);
    }

    // عرض رسالة تنبيهية
    showToast(message, type = 'success') {
        UI.showToast(message, type);
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TechWatchStore();
});